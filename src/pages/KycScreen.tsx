import { useState, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useUser, useKycStatus, useSubmitKyc } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ArrowLeft, CheckCircle, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { KycStatus } from '@/types';

const statusLabel: Record<KycStatus, string> = {
  NONE: 'Not verified',
  PENDING: 'Under review',
  APPROVED: 'Verified',
  REJECTED: 'Rejected',
};

const statusColor: Record<KycStatus, string> = {
  NONE: 'text-muted-foreground bg-surface',
  PENDING: 'text-warning bg-warning/10',
  APPROVED: 'text-plup bg-plup/10',
  REJECTED: 'text-pldown bg-pldown/10',
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function KycScreen() {
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
      toast.error('Image must be smaller than 5 MB');
      return;
    }
    setIdImage(file);
    try {
      const dataUrl = await readFileAsBase64(file);
      setPreview(dataUrl);
    } catch {
      toast.error('Failed to read image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!idImage) {
      toast.error('Please upload an ID image');
      return;
    }
    try {
      const imageBase64 = await readFileAsBase64(idImage);
      // Backend expects s3Key references, but no upload/presigned-URL endpoint
      // is exposed in the gateway yet. In real mode this will fail until the
      // backend can accept or generate S3 keys.
      await submitKyc.mutateAsync({
        documents: [{ type: 'ID_CARD', s3Key: imageBase64 }],
      });
      toast.success('KYC verification submitted');
    } catch (err) {
      const isRealMode = import.meta.env.VITE_USE_MOCK_API !== 'true';
      const message =
        isRealMode && !(err instanceof Error && err.message.toLowerCase().includes('mock'))
          ? 'KYC document upload is not fully wired yet: the backend expects an S3 key but no upload endpoint is exposed.'
          : err instanceof Error
          ? err.message
          : 'Failed to submit KYC';
      toast.error(message);
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

  return (
    <PageContainer className="py-6">
      <Link
        to="/profile"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to profile
      </Link>
      <div className="max-w-xl mx-auto">
        <Card className="bg-surface-light border-border">
          <CardContent className="p-6">
            <div className="w-16 h-16 rounded-full bg-brand/10 mx-auto flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">KYC Verification</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Verify your identity to unlock full trading and withdrawal features.
            </p>

            <div className="flex items-center justify-center mb-6">
              <span
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                  statusColor[effectiveStatus]
                )}
              >
                {effectiveStatus === 'APPROVED' && <FileCheck className="w-4 h-4" />}
                {effectiveStatus === 'REJECTED' && <AlertCircle className="w-4 h-4" />}
                {effectiveStatus === 'PENDING' && <CheckCircle className="w-4 h-4" />}
                {effectiveStatus === 'NONE' && <Shield className="w-4 h-4" />}
                {statusLabel[effectiveStatus as keyof typeof statusLabel]}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {['Upload ID card / Passport', 'Take a selfie (optional)', 'Wait for review'].map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border"
                >
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
                    {i + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>

            {isSubmitted ? (
              <div className="text-center p-4 rounded-lg bg-plup/10 border border-plup/20">
                <CheckCircle className="w-6 h-6 text-plup mx-auto mb-2" />
                <p className="text-sm text-plup">
                  {effectiveStatus === 'APPROVED'
                    ? 'Your identity is verified.'
                    : 'Verification submitted. We will review your documents shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="kyc-fullName">Full name</Label>
                  <Input
                    id="kyc-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="As shown on your ID"
                    className="bg-surface border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kyc-idNumber">ID / Passport number</Label>
                  <Input
                    id="kyc-idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="ID or passport number"
                    className="bg-surface border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label>ID image</Label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-dashed transition',
                      preview
                        ? 'border-brand bg-brand/5'
                        : 'border-border bg-surface hover:bg-surface-lighter'
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
                        <span className="text-sm text-muted-foreground">Click to upload ID image</span>
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
                  {idImage && <p className="text-xs text-muted-foreground">{idImage.name}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-light"
                  disabled={submitKyc.isPending}
                >
                  {submitKyc.isPending ? 'Submitting...' : 'Submit verification'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
