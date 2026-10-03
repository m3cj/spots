import { PiCalendarBlank, PiCalendarBlankFill, PiMapTrifold, PiMapTrifoldFill, PiSquaresFour, PiSquaresFourFill, PiUser, PiUserFill } from 'react-icons/pi';

// The four tabs from DESIGN-SYSTEM §5.3. `match` decides which routes keep a tab highlighted.
export const NAV_ITEMS = [
  { to: '/', label: 'Map', icon: PiMapTrifold, activeIcon: PiMapTrifoldFill, match: (path) => path === '/' },
  {
    to: '/spots',
    label: 'Spots',
    icon: PiSquaresFour,
    activeIcon: PiSquaresFourFill,
    match: (path) => path.startsWith('/spots') || path.startsWith('/spot/'),
  },
  {
    to: '/events',
    label: 'Events',
    icon: PiCalendarBlank,
    activeIcon: PiCalendarBlankFill,
    match: (path) => path.startsWith('/events') || path.startsWith('/event/'),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: PiUser,
    activeIcon: PiUserFill,
    match: (path) => path.startsWith('/profile'),
  },
];
