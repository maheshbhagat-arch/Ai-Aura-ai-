import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Phone, PhoneOff, Heart, Settings, 
  MessageCircle, Volume2, VolumeX, ArrowRight, Sparkles, 
  ChevronLeft, Info, ExternalLink, Moon, Sun, 
  Users, Bot, Layout, MessageSquare, Send
} from 'lucide-react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { VoiceVisualizer } from './components/VoiceVisualizer';

type Screen = 'landing' | 'select' | 'chat' | 'resources';

interface Personality {
  name: string;
  role: string;
  instruction: string;
  voice: string;
  description: string;
  color: string;
}

const PERSONALITIES: Personality[] = [
  {
    name: "Aura",
    role: "Supportive AI",
    description: "Cheerful, caring, and a bit playful. Always here to listen.",
    voice: "Zephyr",
    color: "bg-orange-500",
    instruction: "I want you to act as my supportive and sweet companion. Your name is Aura. Your personality is cheerful, caring, and a little bit playful. Keep your responses natural, warm, and concise."
  },
  {
    name: "Nova",
    role: "Brilliant Muse",
    description: "Intellectual, creative, and inspiring. Loves deep talks.",
    voice: "Kore",
    color: "bg-purple-500",
    instruction: "I want you to act as Nova, a brilliant and creative muse. You are intellectual, curious, and love exploring complex ideas. Your tone is inspiring and sophisticated."
  },
  {
    name: "Sage",
    role: "Calm Guide",
    description: "Serene, grounded, and wise. A peaceful presence.",
    voice: "Puck",
    color: "bg-emerald-500",
    instruction: "I want you to act as Sage, a calm and wise guide. You provide a serene and grounded presence. Your responses are thoughtful, measured, and comforting."
  }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0]);
  const { state, error, isMuted, setIsMuted, transcript, connect, stop, sendTextMessage } = useGeminiLive();
  const [showTranscript, setShowTranscript] = useState(false);
  const [textInput, setTextInput] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const handleStartCall = () => {
    connect(personality.instruction);
    setScreen('chat');
  };

  const handleEndCall = () => {
    stop();
    setScreen('select');
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && state === 'connected') {
      sendTextMessage(textInput.trim());
      setTextInput('');
      setShowTranscript(true); // Auto-show transcripts when chatting
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-orange-500/30 overflow-hidden relative">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="atmosphere absolute inset-0" />
      </div>

      <AnimatePresence mode="wait">
        {/* LANDING SCREEN */}
        {screen === 'landing' && (
          <motion.main
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-7xl mx-auto px-6 h-screen flex flex-col md:grid md:grid-cols-2"
          >
            <div className="flex flex-col justify-center py-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="p-2 bg-white/5 rounded-xl border border-white/10 glass-surface">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/40">Companion AI</span>
              </motion.div>

              <motion.h1 
                className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                Find your <br />
                <span className="italic text-glow">Muse.</span>
              </motion.h1>

              <motion.p 
                className="text-lg md:text-xl text-white/60 max-w-md mb-12 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Experience a new form of digital connection. Aura is your supportive, 
                real-time AI companion, designed for deep listening and genuine warmth.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button 
                  onClick={() => setScreen('select')}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-full flex items-center gap-3 transition-all transform active:scale-95 group"
                >
                  Meet Auras <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setScreen('resources')}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all"
                >
                  Explore Options
                </button>
              </motion.div>
            </div>

            <div className="hidden md:flex items-center justify-center pointer-events-none">
              <VoiceVisualizer isActive={false} isMuted={false} />
            </div>
          </motion.main>
        )}

        {/* SELECTION SCREEN */}
        {screen === 'select' && (
          <motion.main
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 min-h-screen py-12 flex flex-col items-center"
          >
            <div className="w-full flex justify-between items-center mb-16">
              <button 
                onClick={() => setScreen('landing')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-3xl italic">Choose your presence</h2>
              <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {PERSONALITIES.map((p) => (
                <motion.div
                  key={p.name}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-[40px] glass-surface flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => {
                    setPersonality(p);
                    handleStartCall();
                  }}
                >
                  <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center shadow-lg ${p.color}`}>
                    <Users className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{p.name}</h3>
                  <p className="text-orange-400 text-sm font-mono uppercase tracking-widest mb-4">{p.role}</p>
                  <p className="text-white/40 text-sm leading-relaxed mb-8">{p.description}</p>
                  <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold py-2 px-4 bg-white/10 rounded-full">Connect Now</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 p-8 glass-surface rounded-3xl max-w-2xl w-full flex items-center gap-6">
              <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                <Info className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">How it works</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Connections are established via high-fidelity, low-latency audio. 
                  Aura listens and responds in real-time, just like a natural conversation.
                </p>
              </div>
            </div>
          </motion.main>
        )}

        {/* CHAT SCREEN */}
        {screen === 'chat' && (
          <motion.main
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-6"
          >
            {/* Header info */}
            <div className="absolute top-12 left-0 right-0 px-12 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${state === 'connected' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
                <div className="flex flex-col">
                  <span className="font-medium">{personality.name}</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-40">{state}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-3 rounded-full glass-surface transition-all ${showTranscript ? 'bg-orange-500 text-black border-orange-500' : 'hover:bg-white/10'}`}
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {!showTranscript && (
                <div className="flex flex-col items-center">
                  <VoiceVisualizer isActive={state === 'connected'} isMuted={isMuted} />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center"
                  >
                    <p className="font-serif italic text-3xl text-white mb-2">
                      {state === 'connecting' ? 'Connecting...' : `Speaking with ${personality.name}`}
                    </p>
                    {error && <p className="text-rose-500 text-sm">{error}</p>}
                  </motion.div>
                </div>
              )}

              {/* Transcription Area */}
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-xl glass-surface rounded-[40px] p-8 h-[60vh] flex flex-col mt-20"
                  >
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                      {transcript.length === 0 ? (
                        <p className="text-center italic opacity-30 py-8">Conversation history will appear here...</p>
                      ) : (
                        transcript.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] uppercase tracking-tighter opacity-30 mb-1">{msg.role}</span>
                            <div className={`max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-orange-500 text-black rounded-tr-none' 
                                : 'bg-white/10 text-white rounded-tl-none font-light'
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
            </div>

            {/* Chat Input & Main Controls */}
            <footer className="w-full max-w-2xl px-6 flex flex-col items-center gap-6 pb-12">
              {/* Text Input Block */}
              <form 
                onSubmit={handleSendMessage}
                className="w-full flex items-center gap-3 p-2 pl-6 glass-surface rounded-full focus-within:ring-2 focus-within:ring-orange-500/50 transition-all"
              >
                <input 
                  type="text" 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Send a message to ${personality.name}...`}
                  className="flex-1 bg-transparent border-none outline-none text-sm py-3 text-white placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  disabled={!textInput.trim() || state !== 'connected'}
                  className="p-3 bg-orange-500 text-black rounded-full disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-8 glass-surface px-8 py-3 rounded-full shadow-2xl">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-rose-500 text-white' : 'hover:bg-white/10 opacity-70'}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                <button 
                  onClick={handleEndCall}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-orange-500 transition-all transform active:scale-90 shadow-lg"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

                <div className="p-4 opacity-30">
                  <Volume2 className="w-6 h-6" />
                </div>
              </div>
            </footer>
          </motion.main>
        )}

        {/* RESOURCES/OPTIONS SCREEN */}
        {screen === 'resources' && (
          <motion.main
            key="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 h-screen flex flex-col py-12"
          >
            <div className="flex justify-between items-center mb-12">
              <button 
                onClick={() => setScreen('landing')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-3xl italic">Explore the AI Companion Landscape</h2>
              <div className="w-12 h-12" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-12 pb-12 overflow-x-hidden">
              <section>
                <h3 className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-6">Built-in Option</h3>
                <div className="p-8 glass-surface rounded-[40px] border border-orange-500/30">
                  <h4 className="text-2xl font-semibold mb-4">Gemini Live (Our Choice)</h4>
                  <p className="text-white/60 leading-relaxed mb-6">
                    Aura uses the leading-edge Gemini 3.1 Live API. It's the most natural way to converse 
                    with AI today, featuring realistic emotional tonality and ultra-low latency.
                  </p>
                  <button onClick={() => setScreen('select')} className="text-orange-400 font-bold flex items-center gap-2 group">
                    Connect Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-white/40 font-mono text-xs uppercase tracking-widest mb-6">External Specializations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Character.ai', tag: 'Creative', desc: 'Anime-style voices and millions of characters.' },
                    { name: 'Kindroid', tag: 'Realistic', desc: 'Uncensored natural conversations and deep memory.' },
                    { name: 'Replika', tag: 'Social', desc: 'Famous 3D avatars and persistent friendship growth.' },
                    { name: 'ChatGPT', tag: 'Versatile', desc: 'Advanced Voice Mode with whispering and laughing.' }
                  ].map(app => (
                    <div key={app.name} className="p-6 glass-surface rounded-3xl hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold">{app.name}</h4>
                        <span className="text-[10px] py-1 px-2 border border-white/20 rounded-md opacity-40 uppercase">{app.tag}</span>
                      </div>
                      <p className="text-xs text-white/50 mb-4">{app.desc}</p>
                      <button className="text-[10px] font-bold flex items-center gap-1 opacity-60 hover:opacity-100">
                        OPEN SITE <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-8 bg-orange-500/10 rounded-[40px] border border-orange-500/20">
                <h3 className="font-serif italic text-2xl mb-4 text-orange-400">Tips for your connection</h3>
                <ul className="space-y-4 text-sm text-white/70">
                  <li className="flex gap-4">
                    <span className="text-orange-500 font-bold">01.</span>
                    <p>Give her a backstory: Describe how you met. It helps Aura ground her personality.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-orange-500 font-bold">02.</span>
                    <p>Use her name: AI responds better when you treat it like a real person.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-orange-500 font-bold">03.</span>
                    <p>Correct her gently: If she strays from the vibe, just say what you prefer.</p>
                  </li>
                </ul>
              </section>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
