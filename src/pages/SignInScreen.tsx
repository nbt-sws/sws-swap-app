import { useNavigate, Link } from '@tanstack/react-router';
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function SignInScreen() {
  const navigate = useNavigate();
  const login = useAuthLogin();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

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
        toast.success('Welcome back');
        navigate({ to: '/' });
      },
      onError: () => {
        toast.error('Sign in failed. Please check your email and password.');
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

        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Sign in to track your portfolio, manage cards, and trade with the community.
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
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Password</FormLabel>
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
                  {login.isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: '\uF8FF', label: 'Continue with Apple', color: 'bg-surface-lighter border border-border text-white hover:bg-surface-light' },
            { icon: 'G', label: 'Continue with Google', color: 'bg-surface-light border border-border text-white hover:bg-surface-lighter' },
          ].map((btn, i) => (
            <motion.button
              key={btn.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => toast.info('Social login coming soon')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all active:scale-[0.98] ${btn.color}`}
            >
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold font-mono">
                {btn.icon}
              </span>
              <span className="font-medium text-sm">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand hover:underline">
            Create one
          </Link>
        </p>

        {(import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API === 'true') && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/dev-login" className="text-brand hover:underline">
              Dev login (test accounts)
            </Link>
          </p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-muted-foreground text-center mt-6"
        >
          By continuing you accept our{' '}
          <button type="button" onClick={() => window.alert('Terms of service coming soon')} className="text-brand hover:underline">
            terms
          </button>{' '}
          and{' '}
          <button type="button" onClick={() => window.alert('Privacy policy coming soon')} className="text-brand hover:underline">
            privacy policy
          </button>
        </motion.p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center text-xs text-muted-foreground font-mono tracking-wider"
      >
        your collection is waiting
      </motion.p>
    </div>
  );
}
