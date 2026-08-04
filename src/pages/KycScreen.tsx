import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, useKycStatus, useSubmitKyc } from '@/hooks/useApi';
import { uploadsApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, CheckCircle, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { KycStatus } from '@/types';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function KycScreen() {
  const { t } = useTranslation();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: kycStatus, isLoading: statusLoading } = useKycStatus((user as any)?.id);
  const submitKyc = useSubmitKyc();

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveStatus: KycStatus = kycStatus?.status ?? (user as any)?.kycStatus ?? 'NONE';
  const isSubmitted = effectiveStatus === 'PENDING' || effectiveStatus === 'APPROVED';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('kyc.imageTooLarge'));
      return;
    }
    setIdImage(file);
    try {
      const dataUrl = await readFileAsBase64(file);
      setPreview(dataUrl);
    } catch {
      toast.error(t('kyc.readFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim()) {
      toast.error(t('kyc.fillAll'));
      return;
    }
    if (!idImage) {
      toast.error(t('kyc.needImage'));
      return;
    }
    try {
      // 1) Upload the document to R2 via the uploads endpoint → real key
      const formData = new FormData();
      formData.append('file', idImage);
      const { key } = await uploadsApi.upload(formData);
      // 2) Submit the KYC payload with the stored document key
      await submitKyc.mutateAsync({
        fullName: fullName.trim(),
        idNumber: idNumber.trim(),
        docKey: key,
      });
      toast.success(t('kyc.successToast'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('kyc.failed'));
    }
  };

  if (userLoading || statusLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-96 w-full max-w-xl mx-auto" />
      </PageContainer>
    );
  }

  const steps = [t('kyc.step1'), t('kyc.step2'), t('kyc.step3')];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('kyc.title')}
        icon={<Shield className="text-brand" />}
        description={t('kyc.subtitle')}
        back={{ to: '/profile' }}
        badge={
          <span
            className={cn(
              'pxl-chip',
              effectiveStatus === 'APPROVED' && 'pxl-chip--cyan',
              effectiveStatus === 'PENDING' && 'pxl-chip--brand',
              effectiveStatus === 'REJECTED' && 'border-pldown/50 text-pldown bg-pldown/10'
            )}
          >
            {t(`kyc.status.${effectiveStatus}`)}
          </span>
        }
      />

      <div className="max-w-xl mx-auto">
        {/* Identity permit — ticket-edge perforation turns the form into a document */}
        <Card className="ticket-edge bg-surface-light border-border overflow-hidden">
          <CardContent className="p-6 pt-7">
            <div className="flex items-center gap-3 mb-6 pb-4 ticket-dash">
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="ticket-label">SwibSwap ID Permit</p>
                <p className="font-semibold truncate">{(user as any)?.displayName ?? (user as any)?.email ?? ''}</p>
              </div>
              <span className="ml-auto shrink-0">
                {effectiveStatus === 'APPROVED' && <FileCheck className="w-5 h-5 text-plup" />}
                {effectiveStatus === 'REJECTED' && <AlertCircle className="w-5 h-5 text-pldown" />}
                {effectiveStatus === 'PENDING' && <CheckCircle className="w-5 h-5 text-warning" />}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {steps.map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border"
                >
                  <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center text-[10px] pxl-num text-brand">
                    0{i + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>

            {isSubmitted ? (
              <div className="text-center p-4 rounded-lg bg-plup/10 border border-plup/20">
                <CheckCircle className="w-6 h-6 text-plup mx-auto mb-2" />
                <p className="text-sm text-plup">
                  {effectiveStatus === 'APPROVED' ? t('kyc.approvedMsg') : t('kyc.submittedMsg')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="kyc-fullName">{t('kyc.fullName')}</Label>
                  <Input
                    id="kyc-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('kyc.fullNamePlaceholder')}
                    className="bg-surface border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kyc-idNumber">{t('kyc.idNumber')}</Label>
                  <Input
                    id="kyc-idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={t('kyc.idNumberPlaceholder')}
                    className="bg-surface border-border mono-num"
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('kyc.idImage')}</Label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-dashed transition',
                      preview
                        ? 'border-brand bg-brand/5'
                        : 'border-border bg-surface hover:bg-surface-lighter hover:border-brand/40'
                    )}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="ID preview"
                        className="max-h-32 rounded object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('kyc.uploadHint')}</span>
                      </>
                    )}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </button>
                  {idImage && <p className="text-xs text-muted-foreground mono-num">{idImage.name}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-light font-bold shadow-glow h-11"
                  disabled={submitKyc.isPending}
                >
                  {submitKyc.isPending ? t('kyc.submitting') : t('kyc.submit')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
