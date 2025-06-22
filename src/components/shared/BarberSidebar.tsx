'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { 
  FaChartLine, 
  FaQrcode, 
  FaCut,
  FaHistory,
  FaUser,
  FaTrophy,
  FaMedal
} from 'react-icons/fa';

export function BarberSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Dashboard',
      items: [
        {
          href: '/barber',
          icon: FaChartLine,
          label: 'Overview',
          exactMatch: true
        },
        {
          href: '/barber/scanner',
          icon: FaQrcode,
          label: 'QR Scanner'
        },
        {
          href: '/barber/visits',
          icon: FaCut,
          label: 'My Visits'
        },
        {
          href: '/barber/history',
          icon: FaHistory,
          label: 'Work History'
        }
      ]
    },
    {
      title: 'Profile',
      items: [
        {
          href: '/barber/profile',
          icon: FaUser,
          label: 'My Profile'
        },
        {
          href: '/barber/achievements',
          icon: FaTrophy,
          label: 'Achievements'
        },
        {
          href: '/barber/leaderboard',
          icon: FaMedal,
          label: 'Leaderboard'
        }
      ]
    }
  ];

  return (
    <CollapsibleSidebar 
      title="Barbaros"
      subtitle="Barber Dashboard"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
  );
} 