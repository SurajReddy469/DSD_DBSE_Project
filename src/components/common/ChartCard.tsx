import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  type?: 'bar' | 'line' | 'progress' | 'donut';
  data: ChartDataPoint[];
  height?: number;
  legend?: { label: string; color: string }[];
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type = 'bar',
  data,
  height = 200,
  legend,
  action,
}) => {
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {legend && (
        <div className="flex items-center gap-4 mb-3 text-xs text-slate-600 dark:text-slate-400">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bar Chart Type */}
      {type === 'bar' && (
        <div className="flex items-end gap-2 pt-4 justify-between" style={{ height: `${height}px` }}>
          {data.map((item, idx) => {
            const heightPercent = (item.value / maxValue) * 100;
            const secPercent = item.secondaryValue ? (item.secondaryValue / maxValue) * 100 : null;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 transition-opacity duration-200 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-20">
                  {item.label}: {item.value} {item.secondaryValue ? `| ${item.secondaryValue}` : ''}
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-[85%]">
                  <div
                    className="w-full max-w-[18px] bg-brand-500 dark:bg-brand-600 rounded-t-md transition-all duration-300 group-hover:bg-brand-400"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                  {secPercent !== null && (
                    <div
                      className="w-full max-w-[18px] bg-emerald-500 dark:bg-emerald-600 rounded-t-md transition-all duration-300 group-hover:bg-emerald-400"
                      style={{ height: `${Math.max(secPercent, 4)}%` }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress / Horizontal Bars */}
      {type === 'progress' && (
        <div className="flex flex-col gap-3 pt-2">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / maxValue) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{item.value} ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color || '#0c87eb',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Area / Curved Line Chart */}
      {type === 'line' && (
        <div className="relative pt-2" style={{ height: `${height}px` }}>
          <svg className="w-full h-[85%] overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0c87eb" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0c87eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Draw Area */}
            <path
              d={`M 0,120 ${data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 400;
                  const y = 120 - (d.value / maxValue) * 100;
                  return `L ${x},${y}`;
                })
                .join(' ')} L 400,120 Z`}
              fill="url(#areaGradient)"
            />
            {/* Draw Line */}
            <path
              d={data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 400;
                  const y = 120 - (d.value / maxValue) * 100;
                  return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#0c87eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 400;
              const y = 120 - (d.value / maxValue) * 100;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="fill-white dark:fill-slate-900 stroke-brand-600 stroke-[2.5]"
                />
              );
            })}
          </svg>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
            {data.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Donut / Ratio Chart */}
      {type === 'donut' && (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="4"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-brand-500"
                strokeDasharray="68, 100"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-emerald-500"
                strokeDasharray="22, 100"
                strokeDashoffset="-68"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">89%</span>
              <span className="text-[10px] text-slate-400">Circulation</span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {data.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || '#0c87eb' }} />
                <span className="text-slate-600 dark:text-slate-400">{d.label}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
