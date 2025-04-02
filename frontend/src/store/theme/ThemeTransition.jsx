// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// export function ThemeTransition({ isDark, originX, originY }) {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={isDark ? 'dark' : 'light'}
//         initial={{ clipPath: `circle(0px at ${originX}px ${originY}px)` }}
//         animate={{ 
//           clipPath: `circle(2000px at ${originX}px ${originY}px)`,
//           transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
//         }}
//         exit={{ 
//           clipPath: `circle(0px at ${originX}px ${originY}px)`,
//           transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
//         }}
//         className={`fixed inset-0 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} z-[50]`}
//         style={{ 
//           pointerEvents: 'none',
//           mixBlendMode: 'difference'
//         }}
//       />
//     </AnimatePresence>
//   );
// }

// DESATIVADO PORÉM PODE SER IMPLEMENTADO