import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CustomTooltip } from './CustomTooltip';

export const CryptoChart = React.memo(({ data, isLoading, color, height, isMobile }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Formatadores responsivos
  const tickFormatter = (value) => `$${isMobile ? value : value.toLocaleString()}`;
  
  // Reduzir a densidade de pontos no eixo X em telas menores
  const tickCount = isMobile ? 4 : 8;

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
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data?.length / tickCount) || 0}
          />
          <YAxis 
            tickFormatter={tickFormatter}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            width={isMobile ? 40 : 60}
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
    prevProps.isMobile === nextProps.isMobile &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

CryptoChart.displayName = 'CryptoChart';