import { HomeIcon, BookOpenIcon, CheckSquareIcon, BarChartIcon } from '../shared/icons';

export const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon, roles: ['student', 'teacher', 'admin'] },
  { href: '/courses', label: 'Classes', icon: BookOpenIcon, roles: ['student', 'teacher', 'admin'] },
  { href: '/history', label: 'History', icon: CheckSquareIcon, roles: ['student'] },
  { href: '/analytics', label: 'Analytics', icon: BarChartIcon, roles: ['teacher', 'admin'] },
];