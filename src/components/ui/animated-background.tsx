"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "default" | "minimal" | "intense";
  className?: string;
}

export function AnimatedBackground({
  variant = "default",
  className,
}: AnimatedBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Gradient Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
          top: "50%",
          right: "10%",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {variant !== "minimal" && (
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[60px]"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)",
            bottom: "20%",
            left: "30%",
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// Floating orbs that can be used anywhere
interface FloatingOrbProps {
  size?: "sm" | "md" | "lg" | number;
  color?: "cyan" | "purple" | "pink" | string;
  className?: string;
  initialX?: number;
  initialY?: number;
  duration?: number;
}

export function FloatingOrb({
  size = "md",
  color = "cyan",
  className,
  initialX = 0,
  initialY = 0,
  duration = 8,
}: FloatingOrbProps) {
  const predefinedSizes: Record<string, string> = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  const predefinedColors: Record<string, string> = {
    cyan: "rgba(34,211,238,0.3)",
    purple: "rgba(168,85,247,0.3)",
    pink: "rgba(236,72,153,0.3)",
  };

  const sizeClass = typeof size === "number" ? "" : predefinedSizes[size];
  const colorValue = typeof color === "string" && color.startsWith("rgba")
    ? color
    : predefinedColors[color] || predefinedColors.cyan;

  const sizeStyle = typeof size === "number"
    ? { width: size, height: size }
    : {};

  return (
    <motion.div
      className={`absolute rounded-full blur-[60px] ${sizeClass} ${className}`}
      style={{
        background: `radial-gradient(circle, ${colorValue} 0%, transparent 70%)`,
        left: initialX,
        top: initialY,
        ...sizeStyle,
      }}
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Animated gradient text
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${className}`}
    >
      {children}
    </span>
  );
}
