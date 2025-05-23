import React, { useState } from 'react';

const CryptoIcon = ({ symbol, size = 24 }) => {
  const [iconError, setIconError] = useState(false);

  const cleanSymbol = symbol
    ?.replace(/USDT$|BTC$/i, '')
    .toLowerCase();

  const iconUrls = [
    `https://assets.coincap.io/assets/icons/${cleanSymbol}@2x.png`,
  ];

  const handleError = (e) => {
    const currentIndex = iconUrls.indexOf(e.target.src);
    if (currentIndex < iconUrls.length - 1) {
      e.target.src = iconUrls[currentIndex + 1];
    } else {
      setIconError(true);
    }
  };

  return (
    <img
      src={iconUrls[0]}
      alt={symbol}
      width={size}
      height={size}
      onError={handleError}
      className={`rounded-full bg-background-secondary ${iconError ? 'placeholder-icon' : ''}`}
    />
  );
};

export default CryptoIcon;