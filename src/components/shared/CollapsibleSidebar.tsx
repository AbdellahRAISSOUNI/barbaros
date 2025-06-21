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
  
  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {sections.map((section, sectionIndex) => (
        <div key={section.title} className={`px-2 lg:px-4 py-2 ${sectionIndex > 0 ? 'mt-8' : ''}`}>
          <p className={`text-xs uppercase tracking-wider text-gray-500 transition-all duration-300 ${
            isCollapsed && !mobile ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
          }`}>
            {section.title}
          </p>
          <div className={`space-y-1 transition-all duration-300 ${
            isCollapsed && !mobile ? 'mt-2' : 'mt-3'
          }`}>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exactMatch);
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                    isCollapsed && !mobile 
                      ? 'px-3 py-3 justify-center' 
                      : 'px-4 py-3'
                  } ${
                    active
                      ? 'bg-gradient-to-r from-black to-gray-800 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={closeMobileMenu}
                  title={isCollapsed && !mobile ? item.label : undefined}
                >
                  <Icon className={`transition-all duration-200 flex-shrink-0 ${
                    isCollapsed && !mobile 
                      ? 'text-xl' 
                      : 'mr-3 text-lg'
                  } ${
                    active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                  }`} />
                  
                  <span className={`font-medium transition-all duration-300 ${
                    isCollapsed && !mobile 
                      ? 'opacity-0 w-0 overflow-hidden' 
                      : 'opacity-100'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !mobile && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Logout Button */}
      <div className={`px-2 lg:px-4 py-2 mt-8 border-t border-gray-200 ${
        isCollapsed && !mobile ? 'pt-4' : 'pt-6'
      }`}>
        <button 
          onClick={handleSignOut}
          className={`group relative w-full flex items-center rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
            isCollapsed && !mobile 
              ? 'px-3 py-3 justify-center' 
              : 'px-4 py-3'
          }`}
          title={isCollapsed && !mobile ? 'Logout' : undefined}
        >
          <FaSignOutAlt className={`transition-all duration-200 flex-shrink-0 ${
            isCollapsed && !mobile 
              ? 'text-xl' 
              : 'mr-3 text-lg'
          } text-gray-600 group-hover:text-red-600`} />
          
          <span className={`font-medium transition-all duration-300 ${
            isCollapsed && !mobile 
              ? 'opacity-0 w-0 overflow-hidden' 
              : 'opacity-100'
          }`}>
            Logout
          </span>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && !mobile && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              Logout
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
  
  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      
      {/* Mobile sidebar overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      />
      
      {/* Desktop collapse toggle button */}
      <button 
        className="hidden lg:block fixed top-4 z-30 p-2 rounded-r-xl bg-white shadow-lg border border-l-0 border-gray-200 hover:bg-gray-50 transition-all duration-300"
        style={{ 
          left: isCollapsed ? '73px' : '249px',
          transform: 'translateX(0)'
        }}
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <FaChevronRight size={16} className="text-gray-600" />
        ) : (
          <FaChevronLeft size={16} className="text-gray-600" />
        )}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64`}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'lg:p-4 lg:text-center' : ''
        }`}>
          <div className={`transition-all duration-300 ${
            isCollapsed ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden' : 'opacity-100'
          }`}>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          
          {/* Collapsed logo */}
          <div className={`transition-all duration-300 ${
            isCollapsed ? 'lg:opacity-100 lg:block' : 'lg:opacity-0 lg:hidden'
          } hidden lg:flex lg:justify-center lg:items-center`}>
            <div className="w-8 h-8 bg-gradient-to-r from-black to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{title.charAt(0)}</span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={`mt-6 pb-24 lg:pb-6 transition-all duration-300 ${
          isCollapsed ? 'lg:overflow-visible' : 'overflow-y-auto'
        }`}>
          <NavItems mobile={isMobileMenuOpen} />
        </nav>
      </aside>
    </>
  );
}