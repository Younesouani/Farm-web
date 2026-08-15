'use client';

import React, { useEffect, useState } from 'react';

const APK_URL = 'https://github.com/Younesouani/Farm-mobile/releases/download/EcolifeFarm/Ecolife.Farm.apk';

export default function DownloadAppBanner() {
  const [isDropped, setIsDropped] = useState(false);

  useEffect(() => {
    // Trigger bubble drop effect shortly after page loads
    const timer = setTimeout(() => {
      setIsDropped(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-emerald-900 text-white px-4 py-2.5 shadow-lg border-b border-emerald-800 transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top ${
        isDropped
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-full opacity-0 scale-95'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">📱</span>
          <p className="text-xs sm:text-sm font-medium">
            Get the <span className="font-bold text-emerald-300">Ecolife Farm</span> Android app for instant ordering & real-time updates!
          </p>
        </div>
        <a
          href={APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-emerald-500/20"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M5 20h14v-2H5v2zm7-18L5.33 9h4.17v6h5V9h4.17L12 2z" />
          </svg>
          Download APK
        </a>
      </div>
    </div>
  );
}
