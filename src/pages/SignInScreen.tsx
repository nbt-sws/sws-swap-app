import { useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { useAuthLogin } from '@/hooks/useApi';
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

export function SignInScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthLogin();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });
  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: (res) => {
        setTokens(res.token);
        setUser(mapApiUserToAuthUser(res.user));
        toast.success(t('auth.signIn.success'));
        navigate({ to: '/' });
      },
      onError: () => {
        toast.error(t('auth.signIn.failed'));
      },
    });
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

        <h1 className="text-3xl font-bold mb-2">{t('auth.signIn.title')}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t('auth.signIn.subtitle')}
        </p>

        <Card className="bg-surface-light border-border">
          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <Button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-light h-12"
                  disabled={login.isPending}
                >
                  {login.isPending ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* TODO(P1-12): Social login (Apple/Google) is not implemented yet.
            Buttons are hidden on production until real OAuth flows exist. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('auth.signIn.noAccount')}{' '}
          <Link to="/register" className="text-brand hover:underline">
            {t('auth.signIn.createOne')}
          </Link>
        </p>

        {(import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API === 'true') && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/dev-login" className="text-brand hover:underline">
              {t('auth.signIn.quickLogin')}
            </Link>
          </p>
        )}

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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center text-xs text-muted-foreground font-mono tracking-wider"
      >
        {t('auth.signIn.tagline')}
      </motion.p>
    </div>
  );
}
