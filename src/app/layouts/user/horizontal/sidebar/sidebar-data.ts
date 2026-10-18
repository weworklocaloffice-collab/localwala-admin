import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'home',
    iconName: 'tablerHome',
    route: '/',
  },
  {
    displayName: 'privacy',
    iconName: 'tablerLockSquare',
    route: '/pages/privacy-policy',
  },
  {
    displayName: 'help_and_support',
    iconName: 'tablerHelpCircle',
    route: '/help-support',
  },
  {
    displayName: 'contact',
    iconName: 'tablerAddressBook',
    route: '/contact-us',
  },
  {
    displayName: 'about',
    iconName: 'tablerInfoCircle',
    route: '/pages/about-us',
  },
];
