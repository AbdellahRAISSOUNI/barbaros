'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exactMatch?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface CollapsibleSidebarProps {
  title: string;
  subtitle: string;
  sections: NavigationSection[];
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function CollapsibleSidebar({ 
  title, 
  subtitle, 
  sections, 
  onCollapsedChange 
}: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      const collapsed = JSON.parse(savedState);
      setIsCollapsed(collapsed);
      onCollapsedChange?.(collapsed);
    }
  }, [onCollapsedChange]);

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
    onCollapsedChange?.(newCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const isActive = (href: string, exactMatch?: boolean) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };
  
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const NavItems = ({ mobile = false }: { mobile?: boolean }) => {
    // Flatten all items for better organization and eliminate scrolling
    const allItems = sections.flatMap(section => section.items);
    
    // Define priority items that should have enhanced visual treatment based on the first few items
    const priorityItems = allItems.slice(0, 4).map(item => item.label);
    
    return (
      <div className="flex flex-col h-full">
        {/* Main Navigation Items */}
        <div className={`flex-1 ${mobile ? 'px-4' : isCollapsed ? 'px-2' : 'px-4'} space-y-0.5`}>
          {allItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            const isPriority = priorityItems.includes(item.label);
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`group relative flex items-center transition-all duration-200 rounded-xl ${
                  isCollapsed && !mobile 
                    ? 'p-3 justify-center mx-1' 
                    : mobile 
                      ? 'px-4 py-3.5'
                      : 'px-3 py-2.5'
                } ${
                  active
                    ? isPriority
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg ring-1 ring-gray-900/20' 
                      : 'bg-gray-900 text-white shadow-sm ring-1 ring-gray-900/10'
                    : isPriority
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-150 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                }`}
                onClick={closeMobileMenu}
                title={isCollapsed && !mobile ? item.label : undefined}
              >
                <Icon className={`transition-all duration-200 flex-shrink-0 ${
                  isCollapsed && !mobile 
                    ? 'text-lg' 
                    : mobile
                      ? 'mr-4 text-lg'
                      : 'mr-3 text-base'
                } ${
                  active 
                    ? 'text-white' 
                    : isPriority
                      ? 'text-gray-600 group-hover:text-gray-800'
                      : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                
                <span className={`font-medium transition-all duration-300 ${
                  mobile ? 'text-sm' : 'text-sm'
                } ${
                  isPriority && !active ? 'font-semibold' : 'font-medium'
                } ${
                  isCollapsed && !mobile 
                    ? 'opacity-0 w-0 overflow-hidden' 
                    : 'opacity-100'
                }`}>
                  {item.label}
                </span>
                
                {/* Priority indicator for important functions */}
                {isPriority && !active && mobile && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                )}
                
                {/* Active indicator for mobile */}
                {active && mobile && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !mobile && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Logout Button at Bottom */}
        <div className={`${mobile ? 'px-4 pb-8' : isCollapsed ? 'px-2 pb-4' : 'px-4 pb-6'} border-t border-gray-100 pt-4`}>
          <button 
            onClick={handleSignOut}
            className={`group relative w-full flex items-center transition-all duration-200 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 active:bg-red-100 ${
              isCollapsed && !mobile 
                ? 'p-3 justify-center mx-1' 
                : mobile
                  ? 'px-4 py-3.5'
                  : 'px-3 py-2.5'
            }`}
            title={isCollapsed && !mobile ? 'Logout' : undefined}
          >
            <FaSignOutAlt className={`transition-all duration-200 flex-shrink-0 ${
              isCollapsed && !mobile 
                ? 'text-lg' 
                : mobile
                  ? 'mr-4 text-lg'
                  : 'mr-3 text-base'
            } text-gray-500 group-hover:text-red-600`} />
            
            <span className={`font-medium text-sm transition-all duration-300 ${
              isCollapsed && !mobile 
                ? 'opacity-0 w-0 overflow-hidden' 
                : 'opacity-100'
            }`}>
              Logout
            </span>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !mobile && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Logout
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-white shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes size={18} className="text-gray-700" />
        ) : (
          <FaBars size={18} className="text-gray-700" />
        )}
      </button>
      
      {/* Mobile sidebar overlay - Only show when mobile menu is actually open */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-25 transition-opacity duration-300"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Desktop collapse toggle button */}
      <button 
        className="hidden lg:flex fixed top-4 z-30 w-9 h-9 rounded-r-xl bg-white shadow-md border border-l-0 border-gray-200 hover:bg-gray-50 hover:shadow-lg active:scale-95 transition-all duration-300 items-center justify-center backdrop-blur-sm"
        style={{ 
          left: isCollapsed ? '64px' : '240px'
        }}
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <FaChevronRight size={14} className="text-gray-600" />
        ) : (
          <FaChevronLeft size={14} className="text-gray-600" />
        )}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-sm border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'lg:w-16' : 'lg:w-60'
        } w-80 sm:w-72`}
      >
        {/* Logo/Brand Section - Minimal */}
        <div className={`h-16 sm:h-14 border-b border-gray-100 flex items-center transition-all duration-300 ${
          isCollapsed ? 'lg:px-2 lg:justify-center' : 'px-6 lg:px-4'
        }`}>
          {isCollapsed ? (
            <div className="hidden lg:flex w-8 h-8 bg-gray-900 rounded-lg items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{title.charAt(0)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">{title.charAt(0)}</span>
              </div>
              <div className="lg:block hidden">
                <span className="font-semibold text-gray-900 text-sm tracking-tight">{title}</span>
              </div>
            </div>
          )}
          {/* Mobile always shows full logo */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{title.charAt(0)}</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">{title}</span>
          </div>
        </div>
        
        {/* Navigation - Non-scrollable, fixed height with better responsiveness */}
        <nav className="h-[calc(100vh-64px)] sm:h-[calc(100vh-56px)] flex flex-col py-6 sm:py-4 overflow-hidden">
          <NavItems mobile={isMobileMenuOpen} />
        </nav>
      </aside>
    </>
  );
}