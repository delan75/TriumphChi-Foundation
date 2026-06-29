import type { LucideIcon } from 'lucide-react';
import { BarChart3, ClipboardCheck, HandCoins, Inbox, Settings2, ShieldCheck, UserCog, UserRound, UsersRound } from 'lucide-react';

export interface StaffNavigationItem {
  key: 'dashboard' | 'applications' | 'beneficiaries' | 'funding' | 'contacts' | 'reports' | 'users' | 'profile' | 'settings';
  icon: LucideIcon;
  path: string;
  permission?: string;
  group: 'overview' | 'operations' | 'account';
}

export const staffNavigation: StaffNavigationItem[] = [
  {
    key: 'dashboard',
    icon: BarChart3,
    path: '/staff',
    group: 'overview',
  },
  {
    key: 'applications',
    icon: ClipboardCheck,
    path: '/staff/applications',
    permission: 'applications.view',
    group: 'operations',
  },
  {
    key: 'beneficiaries',
    icon: UsersRound,
    path: '/staff/beneficiaries',
    permission: 'beneficiaries.view',
    group: 'operations',
  },
  {
    key: 'funding',
    icon: HandCoins,
    path: '/staff/funding',
    permission: 'funds.view',
    group: 'operations',
  },
  {
    key: 'contacts',
    icon: Inbox,
    path: '/staff/contacts',
    permission: 'contact_messages.view',
    group: 'operations',
  },
  {
    key: 'reports',
    icon: ShieldCheck,
    path: '/staff/reports',
    permission: 'impact_updates.view',
    group: 'operations',
  },
  {
    key: 'users',
    icon: UserCog,
    path: '/staff/users',
    permission: 'users.view',
    group: 'account',
  },
  {
    key: 'profile',
    icon: UserRound,
    path: '/staff/profile',
    group: 'account',
  },
  {
    key: 'settings',
    icon: Settings2,
    path: '/staff/settings',
    group: 'account',
  },
];
