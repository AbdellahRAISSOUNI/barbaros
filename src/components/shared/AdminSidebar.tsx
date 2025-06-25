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
  FaCalendarCheck,
  FaHistory,
  FaFileAlt
} from 'react-icons/fa';

export function AdminSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Navigation',
      items: [
        {
          href: '/admin',
          icon: FaChartLine,
          label: 'Dashboard',
          exactMatch: true
        },
        {
          href: '/admin/scanner',
          icon: FaQrcode,
          label: 'QR Scanner'
        },
        {
          href: '/admin/clients',
          icon: FaUsers,
          label: 'Client Management'
        },
        {
          href: '/admin/barbers',
          icon: FaUserTie,
          label: 'Barber Management'
        },
        {
          href: '/admin/reservations',
          icon: FaCalendarCheck,
          label: 'Booking System'
        },
        {
          href: '/admin/services',
          icon: FaCut,
          label: 'Service Management'
        },
        {
          href: '/admin/rewards',
          icon: FaGift,
          label: 'Loyalty Rewards'
        },
        {
          href: '/admin/achievements',
          icon: FaTrophy,
          label: 'Achievement System'
        },
        {
          href: '/admin/leaderboard',
          icon: FaMedal,
          label: 'Performance Board'
        },
        {
          href: '/admin/history',
          icon: FaHistory,
          label: 'Visit Records'
        },
        {
          href: '/admin/reports',
          icon: FaFileAlt,
          label: 'Analytics & Reports'
        },
        {
          href: '/admin/settings',
          icon: FaCog,
          label: 'System Settings'
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