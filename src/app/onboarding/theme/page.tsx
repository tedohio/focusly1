'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';

export default function ThemeSelectionPage() {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { setTheme } = useTheme();
  const router = useRouter();

  const saveThemeMutation = useMutation({
    mutationFn: async (theme: 'light' | 'dark' | 'system') => {
      setTheme(theme);
      // Small delay to ensure theme is applied
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    onSuccess: () => {
      toast.success('Theme preference saved');
      router.push('/onboarding');
    },
    onError: (error) => {
      toast.error('Failed to save theme preference');
      console.error(error);
    },
  });

  const handleContinue = () => {
    saveThemeMutation.mutate(selectedTheme);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border border-card-border">
          <CardHeader className="text-center">
            <CardTitle className="text-fg">Choose your theme</CardTitle>
            <CardDescription className="text-fg-muted">
              How would you like Focusly to look?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={selectedTheme} 
              onValueChange={(value) => setSelectedTheme(value as 'light' | 'dark' | 'system')}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-card-border hover:bg-bg-muted transition-colors">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className="w-8 h-8 rounded border border-card-border bg-white flex items-center justify-center">
                    <Sun className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-medium text-fg">Light</div>
                    <div className="text-sm text-fg-muted">Clean and bright interface</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border border-card-border hover:bg-bg-muted transition-colors">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className="w-8 h-8 rounded border border-card-border bg-gray-800 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-fg">Dark</div>
                    <div className="text-sm text-fg-muted">Easy on the eyes in low light</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border border-card-border hover:bg-bg-muted transition-colors">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className="w-8 h-8 rounded border border-card-border bg-gradient-to-br from-white to-gray-800 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-fg">System</div>
                    <div className="text-sm text-fg-muted">Follows your device setting</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Button 
              onClick={handleContinue}
              disabled={saveThemeMutation.isPending}
              className="w-full"
            >
              {saveThemeMutation.isPending ? 'Saving...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
