import React from 'react';

interface HeaderProps {
  theme: string;
  onThemeToggle: () => void;
}

const Logo: React.FC = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="var(--color-primary)"/>
        <path d="M25 80V20L50 50L25 80Z" fill="var(--color-surface)"/>
        <path d="M75 80V50C75 33.4315 61.5685 20 45 20V20" stroke="var(--color-surface)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M45 80L75 50" stroke="var(--color-surface)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const ThemeToggle: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => (
    <button
        onClick={onThemeToggle}
        className="w-14 h-8 rounded-full bg-background p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface border border-border-color"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
        <div
            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center transform transition-transform duration-300"
            style={{ transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)' }}
        >
            {/* Sun and Moon Icons */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-surface absolute transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-surface absolute transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>
    </button>
);

const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
  return (
    <header className="w-full bg-surface/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border-color">
        <div className="w-full max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Logo />
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                      AR Inpainting Studio
                    </h1>
                </div>
                <ThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
            </div>
        </div>
    </header>
  );
};

export default Header;