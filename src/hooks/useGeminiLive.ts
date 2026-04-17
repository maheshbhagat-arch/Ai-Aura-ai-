import { useState, useCallback, useRef, useEffect } from 'react';
import { ai, LIVE_MODEL } from '../lib/gemini';
import { LiveServerMessage, Modality } from "@google/genai";

export type LiveState = 'idle' | 'connecting' | 'connected' | 'error';

export function useGeminiLive() {
  const [state, setState] = useState<LiveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setState('idle');
    isPlayingRef.current = false;
    audioQueueRef.current = [];
  }, []);

  const playNextInQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      isPlayingRef.current = false;
      playNextInQueue();
    };

    source.start();
  }, []);

  const connect = useCallback(async (systemInstruction: string) => {
    try {
      setState('connecting');
      setError(null);
      setTranscript([]);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing. Please add it to your environment variables.");
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support microphone access or you are not in a secure context.");
      }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          throw new Error("Microphone access denied. Please enable microphone permissions in your browser settings and try again.");
        }
        throw micErr;
      }

      const sessionPromise = ai.live.connect({
        model: LIVE_MODEL,
        config: {
          systemInstruction,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setState('connected');
            
            // Setup Microphone Processor
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              if (isMuted) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
                });
              });
            };

            source.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              audioQueueRef.current.push(pcm16);
              playNextInQueue();
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              // In a real app, we'd stop the current source node too
            }

            // Handle Transcriptions
            const userTranscription = message.serverContent?.inputTranscription?.text;
            if (userTranscription) {
              setTranscript(prev => [...prev, { role: 'user', text: userTranscription }]);
            }

            const modelTranscription = message.serverContent?.outputTranscription?.text;
            if (modelTranscription) {
               setTranscript(prev => {
                 const last = prev[prev.length - 1];
                 if (last && last.role === 'model') {
                   return [...prev.slice(0, -1), { role: 'model', text: last.text + modelTranscription }];
                 }
                 return [...prev, { role: 'model', text: modelTranscription }];
               });
            }
          },
          onerror: (err) => {
            console.error("Live Session Error:", err);
            setError("Connection error occurred");
            stop();
          },
          onclose: () => {
            setState('idle');
            stop();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to start voice session");
      setState('error');
      stop();
    }
  }, [isMuted, stop, playNextInQueue]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    state,
    error,
    isMuted,
    setIsMuted,
    transcript,
    connect,
    stop
  };
}
