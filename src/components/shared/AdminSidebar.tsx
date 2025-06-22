'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { 
  FaUsers, 
  FaQrcode, 
  FaChartLine, 
  FaCog, 
  FaCut,
  FaGift,
  FaUserTie,
  FaTrophy,
  FaMedal,
  FaCalendarCheck
} from 'react-icons/fa';

export function AdminSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Management',
      items: [
        {
          href: '/admin',
          icon: FaChartLine,
          label: 'Dashboard',
          exactMatch: true
        },
        {
          href: '/admin/reservations',
          icon: FaCalendarCheck,
          label: 'Reservations'
        },
        {
          href: '/admin/clients',
          icon: FaUsers,
          label: 'Clients'
        },
        {
          href: '/admin/barbers',
          icon: FaUserTie,
          label: 'Barbers'
        },
        {
          href: '/admin/services',
          icon: FaCut,
          label: 'Services'
        },
        {
          href: '/admin/rewards',
          icon: FaGift,
          label: 'Rewards'
        },
        {
          href: '/admin/achievements',
          icon: FaTrophy,
          label: 'Achievements'
        },
        {
          href: '/admin/leaderboard',
          icon: FaMedal,
          label: 'Leaderboard'
        },
        {
          href: '/admin/scanner',
          icon: FaQrcode,
          label: 'Scanner'
        },
        {
          href: '/admin/reports',
          icon: FaChartLine,
          label: 'Reports'
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          href: '/admin/settings',
          icon: FaCog,
          label: 'Settings'
        }
      ]
    }
  ];

  return (
    <CollapsibleSidebar 
      title="Barbaros"
      subtitle="Admin Dashboard"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
  );
} 