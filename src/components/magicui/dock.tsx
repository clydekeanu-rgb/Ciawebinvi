import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export interface DockProps {
  className?: string;
  magnification?: number;
  distance?: number;
  children: React.ReactNode;
}

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className = '', magnification = 58, distance = 120, children }, ref) => {
    const mouseX = useMotionValue(Infinity);

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`mx-auto flex h-16 items-end gap-2.5 rounded-3xl bg-white/90 px-4 pb-2.5 backdrop-blur-lg border-2 border-pink-200/90 shadow-2xl ${className}`}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              mouseX,
              magnification,
              distance,
            } as any);
          }
          return child;
        })}
      </motion.div>
    );
  }
);
Dock.displayName = 'Dock';

export interface DockIconProps {
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: any;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  title?: string;
  label?: string;
}

export const DockIcon = ({
  size = 40,
  magnification = 58,
  distance = 120,
  mouseX,
  className = '',
  children,
  onClick,
  title,
  label,
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX || useMotionValue(Infinity), (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() || { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, magnification, size]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <div className="relative group flex flex-col items-center">
      {/* Tooltip Label on Hover (Instant 0ms display) */}
      {label && (
        <span className="absolute -top-11 hidden group-hover:block bg-slate-900/95 text-white font-heading font-bold text-[11px] px-3 py-1 rounded-xl shadow-xl border border-pink-300/40 pointer-events-none z-50 whitespace-nowrap">
          {label}
        </span>
      )}

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        onClick={onClick}
        title={title || label}
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-b from-pink-50 to-purple-50 text-slate-700 shadow-sm border border-pink-200/80 transition-colors hover:bg-pink-100 active:scale-95 cursor-pointer ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};
DockIcon.displayName = 'DockIcon';
