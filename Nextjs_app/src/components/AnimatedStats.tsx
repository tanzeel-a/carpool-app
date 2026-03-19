"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./AnimatedStats.module.css";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

// Different stat sets based on number of people sharing
const statSets: StatItem[][] = [
  // 2 people sharing
  [
    { value: 50, suffix: "%", label: "less fare" },
    { value: 2, suffix: "x", label: "less emissions" },
    { value: 100, suffix: "m", label: "match radius" },
  ],
  // 3 people sharing
  [
    { value: 66, suffix: "%", label: "less fare" },
    { value: 3, suffix: "x", label: "less emissions" },
    { value: 150, suffix: "m", label: "match radius" },
  ],
  // 4 people sharing
  [
    { value: 75, suffix: "%", label: "less fare" },
    { value: 4, suffix: "x", label: "less emissions" },
    { value: 200, suffix: "m", label: "match radius" },
  ],
];

// Simple counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

function StatNumber({ value, suffix }: { value: number; suffix: string }) {
  const count = useCounter(value);

  return (
    <span className={styles.value}>
      {count}
      <span className={styles.suffix}>{suffix}</span>
    </span>
  );
}

interface AnimatedStatsProps {
  variant?: "dark" | "light";
}

export default function AnimatedStats({ variant = "dark" }: AnimatedStatsProps) {
  const [stats, setStats] = useState<StatItem[]>(statSets[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const randomIndex = Math.floor(Math.random() * statSets.length);
    setStats(statSets[randomIndex]);
  }, []);

  const containerClass = variant === "light"
    ? `${styles.container} ${styles.containerLight}`
    : styles.container;

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  // Individual stat animation
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
    },
  };

  return (
    <motion.div
      className={containerClass}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={`${stat.label}-${index}`}
          className={styles.stat}
          variants={statVariants}
        >
          {isClient ? (
            <StatNumber value={stat.value} suffix={stat.suffix} />
          ) : (
            <span className={styles.value}>
              {stat.value}
              <span className={styles.suffix}>{stat.suffix}</span>
            </span>
          )}
          <span className={styles.label}>{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
