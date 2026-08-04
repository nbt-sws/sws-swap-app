import { useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { useAuthRegister } from '@/hooks/useApi';
import { mapApiUserToAuthUser } from '@/lib/api-mappers';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

export function RegisterScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAuthRegister();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const registerSchema = z
    .object({
      fullName: z.string().min(2, t('auth.register.nameTooShort')),
      email: z.string().email(t('auth.invalidEmail')),
      password: z.string().min(8, t('auth.register.passwordTooShort')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.register.passwordMismatch'),
      path: ['confirmPassword'],
    });
  type RegisterForm = z.infer<typeof registerSchema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: RegisterForm) => {
    register.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (res) => {
          setTokens(res.token);
          setUser(mapApiUserToAuthUser(res.user));
          toast.success(t('auth.register.success'));
          // New collectors land on onboarding (pick games → follow shops → KYC).
          navigate({ to: '/onboarding' });
        },
        onError: () => {
          toast.error(t('auth.register.failed'));
        },
      }
    );
  };

  return (
    <div className="min-h-full flex flex-col bg-surface px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/logo.png"
            alt="SwibSwap"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <span className="text-xl font-bold">SwibSwap</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{t('auth.register.title')}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t('auth.register.subtitle')}
        </p>

        <Card className="bg-surface-light border-border">
          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.fullName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('auth.register.fullNamePlaceholder')}
                          className="bg-surface border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-surface border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-surface border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.register.confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-surface border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-light h-12"
                  disabled={register.isPending}
                >
                  {register.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* TODO(P1-12): Social login (Apple/Google) is not implemented yet.
            Buttons are hidden on production until real OAuth flows exist. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="text-brand hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </p>

        {/* TODO(P1-12): Terms/privacy pages are not implemented yet.
            Rendered as plain text until real /terms and /privacy routes exist. */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground text-center mt-6"
        >
          {t('auth.terms')}
        </motion.p>
      </motion.div>
    </div>
  );
}
