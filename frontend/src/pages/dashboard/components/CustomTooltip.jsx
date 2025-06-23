import React from 'react';

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-primary border border-border-primary rounded-lg shadow-lg p-3">
        <p className="text-text-secondary">
          {payload[0]?.payload?.fullDate || label}
        </p>
        <p className="font-semibold text-text-primary">
          {`Preço: R$${parseFloat(payload[0]?.value).toLocaleString()}`}
        </p>
        {payload[0]?.payload?.volume && (
          <p className="text-text-tertiary">
            {`Volume: ${parseFloat(payload[0].payload.volume).toLocaleString()}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};