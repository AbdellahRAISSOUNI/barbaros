'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { 
  FaChartLine, 
  FaQrcode, 
  FaHistory,
  FaUser,
  FaTrophy,
  FaMedal
} from 'react-icons/fa';

export function BarberSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Navigation',
      items: [
        {
          href: '/barber',
          icon: FaChartLine,
          label: 'Dashboard',
          exactMatch: true
        },
        {
          href: '/barber/scanner',
          icon: FaQrcode,
          label: 'Scanner'
        },
        {
          href: '/barber/history',
          icon: FaHistory,
          label: 'History'
        },
        {
          href: '/barber/achievements',
          icon: FaTrophy,
          label: 'Rewards'
        },
        {
          href: '/barber/profile',
          icon: FaUser,
          label: 'Profile'
        }
      ]
    }
  ];

  return (
    <>
    <CollapsibleSidebar 
      title="Barbaros"
      subtitle="Barber Dashboard"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
      <MobileBottomNav userType="barber" />
    </>
  );
} 