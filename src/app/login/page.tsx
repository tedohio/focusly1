'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { BrandHeader } from '@/components/ui/BrandHeader';
import { toast } from 'sonner';
import { Mail, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email for the login link!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-bg text-fg">
      {/* Background Container */}
      <div className="absolute inset-0 overflow-hidden">
        <AuroraBackground intensity="default" />
        <FloatingOrbs enabled={true} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Header */}
          <BrandHeader
            // Uncomment and configure when you have your logo:
            // logo={{
            //   src: '/logo.png', // Path to your logo file
            //   alt: 'Focusly Logo',
            //   width: 56,
            //   height: 56
            // }}
            title="Focusly"
            subtitle="Cut the noise and execute on what matters"
            layout="logo-above-text" // Options: 'logo-only', 'logo-text', 'logo-above-text'
          />

          {/* Login Card */}
          <Card className="bg-card border border-card-border rounded-2xl shadow-2xl backdrop-blur-md">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-fg">
                Welcome back
              </CardTitle>
              <CardDescription className="text-fg-muted">
                Enter your email to receive a magic link, or sign in with Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-fg">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="form-input-dark h-12 rounded-xl border-0"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 form-button-primary rounded-xl font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send magic link
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-3 text-fg/60">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 form-button-secondary rounded-xl font-medium"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Chrome className="w-4 h-4 mr-2" />
                    Sign in with Google
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-fg/50">
              By continuing, you agree to our{' '}
              <a href="#" className="text-fg-muted hover:text-fg underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-fg-muted hover:text-fg underline">
                Privacy Policy
              </a>
            </p>
            <p className="text-xs text-fg/40">
              © 2024 Focusly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
