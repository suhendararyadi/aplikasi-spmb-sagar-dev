'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  // PERBAIKAN: Gunakan .map() untuk membuat array komponen.
  // Ini adalah cara yang lebih modern dan akan membantu TypeScript mengenali tipe secara otomatis.
  const timerComponents = Object.keys(timeLeft).map((interval) => {
    const value = timeLeft[interval as keyof TimeLeft];
    
    // Jangan tampilkan komponen jika nilainya tidak ada atau negatif
    if (value === undefined || value < 0) {
      return null;
    }

    return (
      <div key={interval} className="text-center">
        <div className="text-4xl md:text-6xl font-bold text-primary">
          {value}
        </div>
        <div className="text-sm uppercase text-muted-foreground">{interval}</div>
      </div>
    );
  });

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {/* Filter untuk menghapus komponen null (jika ada) */}
      {timerComponents.filter(Boolean).length > 0
        ? timerComponents
        : <span>Pengumuman telah dibuka!</span>}
    </div>
  );
}
