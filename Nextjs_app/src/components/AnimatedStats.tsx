"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
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
  // Mixed metrics set 1
  [
    { value: 60, suffix: "%", label: "savings" },
    { value: 3, suffix: "x", label: "greener travel" },
    { value: 50, suffix: "m", label: "instant match" },
  ],
  // Mixed metrics set 2
  [
    { value: 80, suffix: "%", label: "cost cut" },
    { value: 5, suffix: "x", label: "eco friendly" },
    { value: 250, suffix: "m", label: "search area" },
  ],
];

function AnimatedNumber({
  value,
  suffix,
  shouldAnimate,
}: {
  value: number;
  suffix: string;
  shouldAnimate: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current) {
      hasAnimated.current = true;

      const controls = animate(0, value, {
        duration: 2.5,
        ease: [0.25, 0.1, 0.25, 1],
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest));
        },
      });

      return () => controls.stop();
    }
  }, [shouldAnimate, value]);

  return (
    <span className={styles.value}>
      {displayValue}
      <span className={styles.suffix}>{suffix}</span>
    </span>
  );
}

interface AnimatedStatsProps {
  variant?: "dark" | "light";
}

export default function AnimatedStats({ variant = "dark" }: AnimatedStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const [stats, setStats] = useState<StatItem[] | null>(null);

  useEffect(() => {
    // Randomize stats only on client to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * statSets.length);
    setStats(statSets[randomIndex]);
  }, []);

  const containerClass = variant === "light"
    ? `${styles.container} ${styles.containerLight}`
    : styles.container;

  // Render skeleton loading state during SSR to maintain layout
  if (!stats) {
    return (
      <div ref={ref} className={containerClass}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.stat}>
            <span className={`${styles.value} ${styles.skeleton}`}>
              <span className={styles.shimmer}>--</span>
              <span className={styles.suffix}>%</span>
            </span>
            <span className={`${styles.label} ${styles.skeleton}`}>
              <span className={styles.shimmer}>loading...</span>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={`${stat.label}-${index}`}
          className={styles.stat}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{
            duration: 0.6,
            delay: 0.2 + index * 0.2,
            ease: "easeOut",
          }}
        >
          <AnimatedNumber
            value={stat.value}
            suffix={stat.suffix}
            shouldAnimate={isInView}
          />
          <span className={styles.label}>{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
