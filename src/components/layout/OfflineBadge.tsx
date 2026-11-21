import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../utils/pwa';
import { useTranslation } from '../../context/LanguageContext';

interface OfflineBadgeProps {
  forceOffline?: boolean;
}

export const OfflineBadge: React.FC<OfflineBadgeProps> = ({ forceOffline }) => {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  const showOffline = forceOffline !== undefined ? forceOffline : !isOnline;

  if (!showOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-600 text-white px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all animate-pulse"
      data-testid="offline-badge"
    >
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{t('app.offline')}</span>
    </div>
  );
};
