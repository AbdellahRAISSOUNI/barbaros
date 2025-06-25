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
      title: 'Navigation',
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
          label: 'Reservations'
        },
        {
          href: '/client/reservations/new',
          icon: FaCalendarPlus,
          label: 'New Booking'
        },
        {
          href: '/client/qrcode',
          icon: FaQrcode,
          label: 'QR Code'
        },
        {
          href: '/client/history',
          icon: FaHistory,
          label: 'History'
        },
        {
          href: '/client/rewards',
          icon: FaGift,
          label: 'Rewards'
        },
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