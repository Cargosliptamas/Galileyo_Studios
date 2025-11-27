"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { useTimer } from "react-timer-hook";

interface CountdownTimerProps {
  endDate: string;
}

interface TimeUnit {
  value: number;
  label: string;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [isExpired, setIsExpired] = useState(false);
  const { days, hours, minutes, seconds } = useTimer({
    expiryTimestamp: new Date(endDate),
    onExpire: () => {
      setIsExpired(true);
    },
  });
  // const [timeLeft, setTimeLeft] = useState({
  //   days: 0,
  //   hours: 0,
  //   minutes: 0,
  //   seconds: 0,
  //   expired: false,
  // });

  // useEffect(() => {
  //   const calculateTimeLeft = () => {
  //     const now = new Date().getTime();
  //     const end = endDate.getTime();
  //     const difference = end - now;

  //     if (difference <= 0) {
  //       return {
  //         days: 0,
  //         hours: 0,
  //         minutes: 0,
  //         seconds: 0,
  //         expired: true,
  //       };
  //     }

  //     return {
  //       days: Math.floor(difference / (1000 * 60 * 60 * 24)),
  //       hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  //       minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
  //       seconds: Math.floor((difference % (1000 * 60)) / 1000),
  //       expired: false,
  //     };
  //   };

  //   // Calculate immediately
  //   setTimeLeft(calculateTimeLeft());

  //   // Update every second
  //   const interval = setInterval(() => {
  //     setTimeLeft(calculateTimeLeft());
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [endDate]);

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 backdrop-blur-sm"
      >
        <Clock className="h-5 w-5 text-red-400" />
        <div className="text-center">
          <div className="text-sm font-medium text-red-400">Offer Ended</div>
        </div>
      </motion.div>
    );
  }

  const timeUnits: TimeUnit[] = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ].filter((unit) => unit.value > 0 || unit.label === "Seconds");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Time Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 sm:gap-4">
        {timeUnits.map((unit) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="rounded-xl border border-slate-50/50 bg-white p-4 backdrop-blur-sm sm:p-5">
              <motion.div
                key={unit.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="mb-1.5 text-center text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl"
              >
                {String(unit.value).padStart(2, "0")}
              </motion.div>
              <div className="text-center text-xs font-medium uppercase tracking-wider text-slate-600 sm:text-sm">
                {unit.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
