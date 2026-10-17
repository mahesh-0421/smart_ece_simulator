import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('ece_theme') === 'dark' ||
      (!localStorage.getItem('ece_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ece_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ece_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="btn btn-secondary"
      style={{ padding: '6px 10px', fontSize: '12px' }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};
