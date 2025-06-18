'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      // Set coordinates from the click event for smooth transition
      if (e) {
        root.style.setProperty('--x', `${e.clientX}px`);
        root.style.setProperty('--y', `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme]
  );

  // Don't render anything until we have the theme
  if (!mounted) {
    return (
      <Button
        variant='ghost'
        size='icon'
        className='group/toggle border-border/40 bg-background/80 hover:bg-accent/80 size-9 rounded-lg border backdrop-blur-sm transition-all duration-200'
        disabled
      >
        <div className='size-4' />
        <span className='sr-only'>Loading theme toggle</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant='ghost'
      size='icon'
      className='group/toggle border-border/40 bg-background/80 hover:bg-accent/80 theme-toggle-button size-9 rounded-lg border backdrop-blur-sm'
      onClick={handleThemeToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className='relative size-4'>
        <IconSun
          className={`theme-toggle-icon absolute inset-0 size-4 ${
            isDark
              ? 'scale-0 rotate-90 opacity-0'
              : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <IconMoon
          className={`theme-toggle-icon absolute inset-0 size-4 ${
            isDark
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-0 -rotate-90 opacity-0'
          }`}
        />
      </div>
      <span className='sr-only'>
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}
