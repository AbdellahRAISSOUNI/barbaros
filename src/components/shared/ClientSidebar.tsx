'use client';

import { CollapsibleSidebar } from './CollapsibleSidebar';
import { 
  FaUser, 
  FaHistory, 
  FaQrcode, 
  FaGift, 
  FaCalendarAlt, 
  FaCalendarPlus,
  FaChartLine 
} from 'react-icons/fa';

export function ClientSidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const sections = [
    {
      title: 'Client Services',
      items: [
        {
          href: '/client',
          icon: FaChartLine,
          label: 'Dashboard',
          exactMatch: true
        },
        {
          href: '/client/reservations',
          icon: FaCalendarAlt,
          label: 'My Reservations'
        },
        {
          href: '/client/reservations/new',
          icon: FaCalendarPlus,
          label: 'New Reservation'
        },
        {
          href: '/client/history',
          icon: FaHistory,
          label: 'Visit History'
        },
        {
          href: '/client/qrcode',
          icon: FaQrcode,
          label: 'My QR Code'
        },
        {
          href: '/client/rewards',
          icon: FaGift,
          label: 'Rewards'
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          href: '/client/profile',
          icon: FaUser,
          label: 'Profile'
        }
      ]
    }
  ];

  return (
    <CollapsibleSidebar 
      title="Barbaros"
      subtitle="Client Portal"
      sections={sections}
      onCollapsedChange={onCollapsedChange}
    />
  );
}

export default ClientSidebar;