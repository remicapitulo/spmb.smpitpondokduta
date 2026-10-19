import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, HardDrive } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:right-auto z-40 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-amber-400/40">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200 shrink-0" />
      <span className="truncate sm:whitespace-normal">Mode Offline — PWA aktif lokal</span>
      <HardDrive className="w-3.5 h-3.5 opacity-80 shrink-0 ml-auto sm:ml-0" />
    </div>
  );
};
