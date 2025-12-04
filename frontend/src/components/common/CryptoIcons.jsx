import React, { useState } from 'react';

const CryptoIcon = ({ symbol, size = 24 }) => {
  const [iconError, setIconError] = useState(false);

  const cleanSymbol = (() => {
    if (!symbol) return '';
    const s = String(symbol).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const SUFFIXES = ['USDT','USDC','BUSD','TUSD','USDP','DAI','BIDR','BRL','EUR','USD'];
    const suffix = SUFFIXES.find(x => s.length > x.length && s.endsWith(x));
    const base = suffix ? s.slice(0, -suffix.length) : s;
    return base.toLowerCase();
  })();

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