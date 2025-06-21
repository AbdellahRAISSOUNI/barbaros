'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { 
  FaUsers, 
  FaQrcode, 
  FaChartLine, 
  FaCog, 
  FaCut,
  FaGift
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
          href: '/admin/clients',
          icon: FaUsers,
          label: 'Clients'
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