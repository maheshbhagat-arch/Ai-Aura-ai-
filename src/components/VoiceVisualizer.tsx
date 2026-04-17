import { motion } from "motion/react";

interface VoiceVisualizerProps {
  isActive: boolean;
  isMuted: boolean;
}

export function VoiceVisualizer({ isActive, isMuted }: VoiceVisualizerProps) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: isActive && !isMuted ? [1, 1.1, 1] : 1,
          opacity: isActive && !isMuted ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-pink-200 rounded-full blur-3xl"
      />

      {/* Main Circle */}
      <motion.div
        animate={{
          scale: isActive && !isMuted ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-48 h-48 bg-white rounded-full shadow-xl flex items-center justify-center overflow-hidden border-4 border-pink-100"
      >
        {/* Animated Waveform or Heart */}
        <div className="flex items-end gap-1 h-12">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isActive && !isMuted ? [10, 40, 10] : 10,
              }}
              transition={{
                duration: 0.5 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-2 bg-pink-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Particles */}
      {isActive && !isMuted && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          className="absolute w-3 h-3 bg-pink-300 rounded-full"
        />
      ))}
    </div>
  );
}
