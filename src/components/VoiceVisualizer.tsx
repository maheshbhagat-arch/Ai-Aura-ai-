import { motion } from "motion/react";

interface VoiceVisualizerProps {
  isActive: boolean;
  isMuted: boolean;
}

export function VoiceVisualizer({ isActive, isMuted }: VoiceVisualizerProps) {
  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: isActive && !isMuted ? [1, 1.2, 1] : 1,
          opacity: isActive && !isMuted ? [0.4, 0.8, 0.4] : 0.2,
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-rosy-500/30 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(255, 78, 0, 0.2)' }}
      />

      {/* Main Circle */}
      <motion.div
        animate={{
          scale: isActive && !isMuted ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-56 h-56 bg-white/5 backdrop-blur-3xl rounded-full shadow-2xl flex items-center justify-center overflow-hidden border border-white/10"
      >
        {/* Animated Waveform */}
        <div className="flex items-center gap-1.5 h-16">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isActive && !isMuted ? [12, 64, 12] : 12,
                backgroundColor: isActive && !isMuted ? ['#ff4e00', '#ff8e5e', '#ff4e00'] : '#ffffff33',
              }}
              transition={{
                duration: 0.6 + i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 rounded-full"
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Particles */}
      {isActive && !isMuted && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
            x: (Math.random() - 0.5) * 240,
            y: (Math.random() - 0.5) * 240,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-2 h-2 bg-orange-400 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
}
