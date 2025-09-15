'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ThemeStepProps {
  onComplete: () => void;
}

export function ThemeStep({ onComplete }: ThemeStepProps) {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { setTheme } = useTheme();

  const handleContinue = () => {
    setTheme(selectedTheme);
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose your theme</CardTitle>
        <CardDescription>
          How would you like Focusly to look?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedTheme} 
          onValueChange={(value) => setSelectedTheme(value as 'light' | 'dark' | 'system')}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted transition-colors">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 rounded border bg-white flex items-center justify-center">
                <Sun className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <div className="font-medium">Light</div>
                <div className="text-sm text-muted-foreground">Clean and bright interface</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted transition-colors">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 rounded border bg-gray-800 flex items-center justify-center">
                <Moon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="font-medium">Dark</div>
                <div className="text-sm text-muted-foreground">Easy on the eyes in low light</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted transition-colors">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 rounded border bg-gradient-to-br from-white to-gray-800 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">System</div>
                <div className="text-sm text-muted-foreground">Follows your device setting</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
