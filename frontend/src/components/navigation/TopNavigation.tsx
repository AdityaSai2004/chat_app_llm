"use client";

import Logo from "../Logo";

interface TopNavigationProps {
  title?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function TopNavigation({
  title,
  onBack,
  showBackButton = false,
  user = { name: "User" },
}: TopNavigationProps) {
  const navigationItems = [
    { name: "Home", href: "#", active: false },
    { name: "Explore", href: "#", active: false },
    { name: "Notifications", href: "#", active: false },
  ];

  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo or Back button + Title */}
          <div className="flex items-center space-x-4">
            {showBackButton ? (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : (
              <Logo size="sm" />
            )}

            {title && (
              <h1 className="text-xl font-semibold text-white">{title}</h1>
            )}

            {!title && !showBackButton && (
              <span className="text-xl font-semibold text-white">ChatApp</span>
            )}
          </div>

          {/* Center - Navigation Items (hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.active
                    ? "text-blue-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right side - Settings and User */}
          <div className="flex items-center space-x-4">
            {/* Settings button */}
            <button
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* User avatar */}
            <div className="relative">
              <button className="flex items-center space-x-2 rounded-lg hover:bg-slate-700 transition-colors p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0)}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
