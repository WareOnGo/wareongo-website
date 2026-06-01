import React, { useEffect, useRef, useState } from 'react';

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

const stats: Stat[] = [
  { value: 1500, suffix: '+', label: 'verified warehouses' },
  { value: 1.3, decimals: 1, suffix: 'M+', label: 'sqft transacted' },
  { value: 90, suffix: '+', label: 'cities covered' },
  { value: 8, suffix: '-hour', label: 'shortlist' },
];

const DURATION_MS = 1600;

const useCountUp = (target: number, start: boolean, decimals = 0) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return value.toFixed(decimals);
};

const StatTile = ({ stat, start }: { stat: Stat; start: boolean }) => {
  const display = useCountUp(stat.value, start, stat.decimals ?? 0);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-wareongo-blue leading-none tabular-nums whitespace-nowrap">
        {stat.prefix}
        {display}
        {stat.suffix}
      </div>
      <p className="mt-3 text-sm sm:text-base text-wareongo-slate">
        {stat.label}
      </p>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStart(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 w-full"
    >
      {stats.map((s) => (
        <StatTile key={s.label} stat={s} start={start} />
      ))}
    </div>
  );
};

export default StatsSection;
