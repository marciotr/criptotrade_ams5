import React from 'react';

export const CryptoIcon = ({ symbol, size = 24 }) => {
  const [fallback, setFallback] = React.useState(false);
  
  // if (!fallback) {
  //   return (
  //     <img
  //       src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol?.toLowerCase()}.png`}
  //       alt={symbol}
  //       width={size}
  //       height={size}
  //       className="rounded-full"
  //       onError={(e) => {
  //         e.target.onerror = null;
  //         // Segunda tentativa com a API da Binance
  //         e.target.src = `https://www.binance.com/static/images/coins/${symbol?.toUpperCase()}.png`;
  //         e.target.onerror = () => setFallback(true);
  //       }}
  //     />
  //   );
  // }

  // Fallback para ícones locais ou círculo com letra
  const IconComponent = CRYPTO_ICONS[symbol?.toUpperCase()] || FallbackIcon;
  return <IconComponent size={size} symbol={symbol} />;
};

// Ícone de fallback para quando o símbolo não está disponível
export const FallbackIcon = ({ symbol, size = 24 }) => {
  const colors = {
    BTC: '#F7931A',   
    ETH: '#627EEA',
    ADA: '#0033AD',  
    XRP: '#23292F',  
    DOT: '#E6007A',   
    SOL: '#14F195',  
    DOGE: '#C2A633', 
    AVAX: '#E84142', 
    MATIC: '#8247E5', 
    LTC: '#BFBBBB',  
    LINK: '#2A5ADA', 
    XLM: '#000000',   
    EOS: '#000000',  
    KMD: '#2B6680',
    DEFAULT: '#7F7F7F'
  };
  
  const bgColor = colors[symbol.toUpperCase()] || colors.DEFAULT;
  
  return (
    <div 
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        color: '#fff',
        fontSize: size/2,
        fontWeight: 'bold'
      }}
    >
      {symbol.charAt(0)}
    </div>
  );
};

// Bitcoin
export const BTCIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" fill="#FFF"/>
  </svg>
);

// Ethereum
export const ETHIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16.498 4v8.87l7.497 3.35z" fill="#FFF" fillOpacity="0.602"/>
    <path d="M16.498 4L9 16.22l7.498-3.35z" fill="#FFF"/>
    <path d="M16.498 21.968v6.027L24 17.616z" fill="#FFF" fillOpacity="0.602"/>
    <path d="M16.498 27.995v-6.028L9 17.616z" fill="#FFF"/>
    <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="#FFF" fillOpacity="0.2"/>
    <path d="M9 16.22l7.498 4.353v-7.701z" fill="#FFF" fillOpacity="0.602"/>
  </svg>
);

// Cardano
export const ADAIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#0033AD"/>
    <path d="M16.634 15.536a1.222 1.222 0 100-2.445 1.222 1.222 0 000 2.445z" fill="#FFF"/>
    <path d="M11.236 22.698a.968.968 0 100-1.937.968.968 0 000 1.937zM16.652 19.98a.968.968 0 100-1.938.968.968 0 000 1.938zM14.64 18.042a.726.726 0 100-1.453.726.726 0 000 1.453zM18.578 18.042a.726.726 0 100-1.453.726.726 0 000 1.453zM12.626 18.042a.726.726 0 100-1.453.726.726 0 000 1.453zM20.446 16.106a.484.484 0 100-.969.484.484 0 000 .969zM16.652 12.89a.968.968 0 100-1.937.968.968 0 000 1.938zM21.99 19.98a.968.968 0 100-1.937.968.968 0 000 1.938zM11.236 10.953a.968.968 0 100-1.937.968.968 0 000 1.937zM7.98 16.106a.484.484 0 100-.969.484.484 0 000 .969zM9.41 19.98a.968.968 0 100-1.937.968.968 0 000 1.938zM9.41 11.921a.968.968 0 100-1.937.968.968 0 000 1.937zM14.642 13.858a.726.726 0 100-1.452.726.726 0 000 1.452zM18.578 13.858a.726.726 0 100-1.452.726.726 0 000 1.452zM22.068 22.698a.968.968 0 100-1.937.968.968 0 000 1.937zM22.068 10.953a.968.968 0 100-1.937.968.968 0 000 1.937z" fill="#FFF"/>
  </svg>
);

// XRP (Ripple)
export const XRPIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#23292F"/>
    <path d="M23 10l-3 3c-2.5 2.5-6.5 2.5-9 0l-3-3" stroke="#FFF" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
    <path d="M9 22l3-3c2.5-2.5 6.5-2.5 9 0l3 3" stroke="#FFF" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
  </svg>
);

// Polkadot
export const DOTIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#E6007A"/>
    <circle cx="16" cy="16" r="4" fill="#FFF"/>
    <circle cx="16" cy="6" r="2" fill="#FFF"/>
    <circle cx="16" cy="26" r="2" fill="#FFF"/>
    <circle cx="26" cy="16" r="2" fill="#FFF"/>
    <circle cx="6" cy="16" r="2" fill="#FFF"/>
    <circle cx="23" cy="9" r="2" fill="#FFF"/>
    <circle cx="9" cy="23" r="2" fill="#FFF"/>
    <circle cx="23" cy="23" r="2" fill="#FFF"/>
    <circle cx="9" cy="9" r="2" fill="#FFF"/>
  </svg>
);

// Solana
export const SOLIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#14F195"/>
    <path d="M10 10l12 12M10 10h8M10 10v8M22 22h-8M22 22v-8" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16l12-6M10 16h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Mapeamento de símbolos para componentes de ícones
export const CRYPTO_ICONS = {
  'BTC': BTCIcon,
  'ETH': ETHIcon,
  'ADA': ADAIcon,
  'XRP': XRPIcon,
  'DOT': DOTIcon,
  'SOL': SOLIcon,
  'USDT': ({ size }) => (
    <div className={`w-${size} h-${size} rounded-full bg-[#26A17B] flex items-center justify-center`}>
      <span className="text-white font-bold" style={{ fontSize: size/2 }}>T</span>
    </div>
  ),
  // Adicione mais ícones conforme necessário
};

export default CryptoIcon;