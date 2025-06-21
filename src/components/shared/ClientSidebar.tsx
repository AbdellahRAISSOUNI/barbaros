'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { 
  FaCalendarAlt, 
  FaHistory, 
  FaCog, 
  FaQrcode, 
  FaHome, 
  FaGift
} from 'react-icons/fa';

export function ClientSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Dashboard',
      items: [
        {
          href: '/client',
          icon: FaHome,
          label: 'Home',
          exactMatch: true
        }
      ]
    },
    {
      title: 'Loyalty',
      items: [
        {
          href: '/client/history',
          icon: FaHistory,
          label: 'Visit History'
        },
        {
          href: '/client/rewards',
          icon: FaGift,
          label: 'My Rewards'
        },
        {
          href: '/client/qrcode',
          icon: FaQrcode,
          label: 'My QR Code'
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          href: '/client/profile',
          icon: FaCog,
          label: 'Profile'
        }
      ]
    }
  ];

  return (
    <CollapsibleSidebar 
      title="Barbaros"
      subtitle="Client Dashboard"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
  );
} 