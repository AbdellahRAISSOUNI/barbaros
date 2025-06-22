'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaHistory, FaQrcode, FaGift, FaCalendarAlt, FaCalendarPlus } from 'react-icons/fa';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/client', icon: FaUser },
  { name: 'My Reservations', href: '/client/reservations', icon: FaCalendarAlt },
  { name: 'New Reservation', href: '/client/reservations/new', icon: FaCalendarPlus },
  { name: 'Visit History', href: '/client/history', icon: FaHistory },
  { name: 'My QR Code', href: '/client/qrcode', icon: FaQrcode },
  { name: 'Rewards', href: '/client/rewards', icon: FaGift },
  { name: 'Profile', href: '/client/profile', icon: FaUser },
];

export default function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <Link href="/client" className="text-white text-xl font-bold">
          Barbaros Client
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out mb-1 ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-150 ease-in-out ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 