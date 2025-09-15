'use client';

import { useTheme } from '@/components/theme/ThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    toast.success('Theme preference saved');
  };

  return (
    <Card className="bg-card border border-card-border">
      <CardHeader>
        <CardTitle className="text-fg">Appearance</CardTitle>
        <CardDescription className="text-fg-muted">
          Choose how Focusly looks to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={handleThemeChange} className="space-y-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
              <Sun className="h-4 w-4" />
              <span className="text-fg">Light</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
              <Moon className="h-4 w-4" />
              <span className="text-fg">Dark</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer">
              <Monitor className="h-4 w-4" />
              <span className="text-fg">System</span>
              <span className="text-fg-muted text-sm">(Follows your device setting)</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
