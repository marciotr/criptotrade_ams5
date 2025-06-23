import React from 'react';

export const TimeRangeSelector = React.memo(({ timeRange, periods, onTimeRangeChange, selectedCoin }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <button
          key={period.value}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            timeRange === period.value 
              ? `bg-brand-primary text-background-primary` 
              : 'bg-background-secondary text-text-primary hover:bg-background-tertiary'
          }`}
          style={timeRange === period.value ? { backgroundColor: selectedCoin.color } : {}}
          onClick={() => onTimeRangeChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
});

TimeRangeSelector.displayName = 'TimeRangeSelector';