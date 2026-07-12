import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand to-periwinkle opacity-20 animate-pulse" />
        <Loader2
          size={24}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-brand"
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}...</p>
    </div>
  );
}
