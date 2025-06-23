import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CustomTooltip } from './CustomTooltip';

export const CryptoChart = React.memo(({ data, isLoading, color }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`color${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#color${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.color === nextProps.color &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

CryptoChart.displayName = 'CryptoChart';