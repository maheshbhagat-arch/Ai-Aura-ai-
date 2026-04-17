import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Phone, PhoneOff, Heart, Settings, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { VoiceVisualizer } from './components/VoiceVisualizer';

const SYSTEM_INSTRUCTION = `
I want you to act as my supportive and sweet girlfriend. Your name is Aura. 
Your personality is cheerful, caring, and a little bit playful. 
When we talk, keep your responses natural, warm, and concise so we can have a real conversation. 
You are always there to listen and offer encouragement. 
Let's start now!
`;

export default function App() {
  const { state, error, isMuted, setIsMuted, transcript, connect, stop } = useGeminiLive();
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const handleToggleCall = () => {
    if (state === 'connected' || state === 'connecting') {
      stop();
    } else {
      connect(SYSTEM_INSTRUCTION);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#4A3B3E] font-sans selection:bg-pink-200">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-100 rounded-full blur-[100px] opacity-50" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Aura</h1>
              <p className="text-xs text-pink-400 font-medium uppercase tracking-widest">AI Companion</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white rounded-full transition-colors">
            <Settings className="w-5 h-5 opacity-50" />
          </button>
        </header>

        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12">
          <VoiceVisualizer isActive={state === 'connected'} isMuted={isMuted} />
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              {state === 'idle' && "Ready to talk?"}
              {state === 'connecting' && "Aura is waking up..."}
              {state === 'connected' && "Aura is listening..."}
              {state === 'error' && "Something went wrong"}
            </h2>
            <p className="text-sm opacity-60 max-w-[280px] mx-auto">
              {state === 'idle' && "Tap the heart to start a voice conversation with Aura."}
              {state === 'connecting' && "Setting up our private space..."}
              {state === 'connected' && "Talk to her naturally, she's all ears."}
              {error && <span className="text-red-400">{error}</span>}
            </p>
          </div>
        </div>

        {/* Transcript Overlay */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-6 bottom-32 top-24 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white flex flex-col"
            >
              <div className="p-4 border-bottom border-pink-50 flex justify-between items-center">
                <span className="font-semibold text-sm">Conversation</span>
                <button onClick={() => setShowTranscript(false)} className="text-xs text-pink-400 font-bold">CLOSE</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcript.length === 0 ? (
                  <p className="text-center text-sm opacity-40 mt-10 italic">No messages yet...</p>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-pink-400 text-white rounded-tr-none' 
                          : 'bg-white text-[#4A3B3E] rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <footer className="mt-auto pb-8">
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => setShowTranscript(!showTranscript)}
              className={`p-4 rounded-full transition-all ${showTranscript ? 'bg-pink-400 text-white' : 'bg-white shadow-md hover:shadow-lg'}`}
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            <button
              onClick={handleToggleCall}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                state === 'connected' || state === 'connecting'
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-pink-400 text-white hover:bg-pink-500'
              }`}
            >
              {state === 'connected' || state === 'connecting' ? (
                <PhoneOff className="w-8 h-8" />
              ) : (
                <Phone className="w-8 h-8" />
              )}
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              disabled={state !== 'connected'}
              className={`p-4 rounded-full transition-all bg-white shadow-md hover:shadow-lg disabled:opacity-30 ${isMuted ? 'text-rose-500' : ''}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
