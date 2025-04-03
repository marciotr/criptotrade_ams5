import React, { useState } from 'react';

const CryptoIcon = ({ symbol, size = 24 }) => {
  const [iconError, setIconError] = useState(false);

  // Clean up symbol (remove USDT, BTC suffix and convert to lowercase)
  const cleanSymbol = symbol
    ?.replace(/USDT$|BTC$/i, '')
    .toLowerCase();

  // Multiple fallback URLs
  const iconUrls = [
    `https://assets.coincap.io/assets/icons/${cleanSymbol}@2x.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSymbol}.png`,
    `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/${cleanSymbol}.png`
  ];

  const handleError = (e) => {
    const currentIndex = iconUrls.indexOf(e.target.src);
    if (currentIndex < iconUrls.length - 1) {
      // Try next fallback URL
      e.target.src = iconUrls[currentIndex + 1];
    } else {
      // If all URLs fail, show placeholder
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