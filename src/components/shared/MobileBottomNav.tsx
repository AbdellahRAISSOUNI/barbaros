'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  FaChartLine, 
  FaQrcode, 
  FaHistory,
  FaUser,
  FaTrophy,
  FaMedal,
  FaGift,
  FaCalendarPlus,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarAlt
} from 'react-icons/fa';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exactMatch?: boolean;
}

interface BurgerMenuItem {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action?: () => void;
}

interface MobileBottomNavProps {
  userType: 'barber' | 'client';
}

export function MobileBottomNav({ userType }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);

  const isActive = (href: string, exactMatch?: boolean) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  // Barber Navigation Configuration
  const barberMainNavItems: NavItem[] = [
    {
      href: '/barber',
      icon: FaChartLine,
      label: 'Dashboard',
      exactMatch: true
    },
    {
      href: '/barber/achievements',
      icon: FaTrophy,
      label: 'Awards'
    }
  ];

  const barberCenterAction = {
    href: '/barber/scanner',
    icon: FaQrcode,
    label: 'Scanner'
  };

  const barberRightNavItems: NavItem[] = [
    {
      href: '/barber/history',
      icon: FaHistory,
      label: 'History'
    }
  ];

  const barberBurgerItems: BurgerMenuItem[] = [
    {
      href: '/barber/leaderboard',
      icon: FaMedal,
      label: 'Leaderboard'
    },
    {
      href: '/barber/profile',
      icon: FaUser,
      label: 'Profile'
    },
    {
      icon: FaSignOutAlt,
      label: 'Logout',
      action: handleSignOut
    }
  ];

  // Client Navigation Configuration
  const clientMainNavItems: NavItem[] = [
    {
      href: '/client',
      icon: FaChartLine,
      label: 'Home',
      exactMatch: true
    },
    {
      href: '/client/reservations/new',
      icon: FaCalendarPlus,
      label: 'Book'
    }
  ];

  const clientCenterAction = {
    href: '/client/qrcode',
    icon: FaQrcode,
    label: 'QR Code'
  };

  const clientRightNavItems: NavItem[] = [
    {
      href: '/client/rewards',
      icon: FaGift,
      label: 'Rewards'
    }
  ];

  const clientBurgerItems: BurgerMenuItem[] = [
    {
      href: '/client/reservations',
      icon: FaCalendarAlt,
      label: 'Reservations'
    },
    {
      href: '/client/history',
      icon: FaHistory,
      label: 'History'
    },
    {
      href: '/client/profile',
      icon: FaUser,
      label: 'Profile'
    },
    {
      icon: FaSignOutAlt,
      label: 'Logout',
      action: handleSignOut
    }
  ];

  // Select configuration based on user type
  const mainNavItems = userType === 'barber' ? barberMainNavItems : clientMainNavItems;
  const centerAction = userType === 'barber' ? barberCenterAction : clientCenterAction;
  const rightNavItems = userType === 'barber' ? barberRightNavItems : clientRightNavItems;
  const burgerItems = userType === 'barber' ? barberBurgerItems : clientBurgerItems;

  const NavButton = ({ item, position }: { item: NavItem; position: 'left' | 'right' }) => {
    const active = isActive(item.href, item.exactMatch);
    const Icon = item.icon;

    return (
      <Link 
        href={item.href}
        className={`flex flex-col items-center justify-center mobile-nav-item ${
          active ? 'transform -translate-y-0.5' : ''
        }`}
      >
        <div className={`relative p-2 rounded-2xl transition-all duration-300 ease-out ${
          active 
            ? 'bg-slate-900 shadow-lg shadow-slate-900/25' 
            : 'bg-transparent hover:bg-slate-100'
        }`}>
          <Icon className={`w-4 h-4 transition-all duration-300 ${
            active ? 'text-white' : 'text-slate-600'
          }`} />
          
          {/* Active indicator */}
          {active && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full" />
          )}
        </div>
        
        <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
          active ? 'text-slate-900' : 'text-slate-500'
        }`}>
          {item.label}
        </span>
      </Link>
    );
  };

  const CenterActionButton = () => {
    const active = isActive(centerAction.href);
    const Icon = centerAction.icon;

    return (
      <Link 
        href={centerAction.href}
        className={`flex flex-col items-center justify-center mobile-nav-item ${
          active ? 'transform -translate-y-1' : ''
        }`}
      >
        <div className={`relative p-3 rounded-2xl transition-all duration-300 ease-out ${
          active 
            ? 'bg-slate-900 shadow-xl shadow-slate-900/30 scale-105' 
            : 'bg-slate-900 shadow-lg shadow-slate-900/25 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-105 active:scale-95'
        }`}>
          <Icon className="w-5 h-5 text-white" />
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
        </div>
        
        <span className={`text-xs mt-1 font-semibold transition-all duration-300 ${
          active ? 'text-slate-900' : 'text-slate-700'
        }`}>
          {centerAction.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Burger Menu Overlay */}
      {showBurgerMenu && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setShowBurgerMenu(false)}
        />
      )}

      {/* Burger Menu */}
      <div className={`fixed right-4 bottom-20 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-900/20 z-50 transform transition-all duration-300 ease-out lg:hidden ${
        showBurgerMenu 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="p-2 w-48">
          <div className="space-y-0.5">
            {burgerItems.map((item, index) => {
              const Icon = item.icon;
              
              if (item.action) {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action?.();
                      setShowBurgerMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      item.label === 'Logout' 
                        ? 'text-red-600 hover:bg-red-50/80' 
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={index}
                  href={item.href!}
                  onClick={() => setShowBurgerMenu(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href!) 
                      ? 'bg-slate-100/80 text-slate-900' 
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Menu arrow pointing down to burger button */}
        <div className="absolute bottom-0 right-8 transform translate-y-full">
          <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white/95" />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden mobile-nav-shadow">
        {/* Background with blur and subtle gradient */}
        <div className="absolute inset-0 bg-white/85 mobile-nav-backdrop border-t border-slate-200/60" />
        
        <div className="relative px-4 py-2 safe-area-bottom">
          {/* Perfect center alignment with grid layout */}
          <div className="flex items-center justify-center max-w-lg mx-auto">
            <div className="grid grid-cols-5 gap-4 w-full max-w-md mx-auto items-center">
              {/* Left side - 2 items */}
              {mainNavItems[0] && (
                <div className="flex justify-center">
                  <NavButton item={mainNavItems[0]} position="left" />
                </div>
              )}
              {mainNavItems[1] && (
                <div className="flex justify-center">
                  <NavButton item={mainNavItems[1]} position="left" />
                </div>
              )}
              
              {/* Center - exactly in the middle */}
              <div className="flex justify-center">
                <CenterActionButton />
              </div>
              
              {/* Right side - 2 items */}
              {rightNavItems[0] && (
                <div className="flex justify-center">
                  <NavButton item={rightNavItems[0]} position="right" />
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowBurgerMenu(!showBurgerMenu)}
                  className={`flex flex-col items-center justify-center mobile-nav-item ${
                    showBurgerMenu ? 'transform -translate-y-0.5' : ''
                  }`}
                >
                  <div className={`relative p-2 rounded-2xl transition-all duration-300 ease-out ${
                    showBurgerMenu 
                      ? 'bg-slate-900 shadow-lg shadow-slate-900/25' 
                      : 'bg-transparent hover:bg-slate-100'
                  }`}>
                    {showBurgerMenu ? (
                      <FaTimes className="w-4 h-4 text-white" />
                    ) : (
                      <FaBars className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  
                  <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                    showBurgerMenu ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    Menu
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Safe area padding for content */}
      <div className="h-16 lg:hidden safe-area-bottom" />
    </>
  );
} 