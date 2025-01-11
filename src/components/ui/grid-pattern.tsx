import { useId } from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[x: number, y: number]>;
  strokeDasharray?: string;
  className?: string;
  [key: string]: unknown;
}

export function GridPattern({
  width = 20,
  height = 20,
  x = 0,
  y = 0,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed top-0 left-0 w-full h-full fill-gray-400/5 stroke-gray-400/5",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M0.5 ${height} V0.5 H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              width={width - 1}
              height={height - 1}
              x={x * width}
              y={y * height}
              strokeWidth="0"
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

export default GridPattern;
