import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'dashboard',
    iconName: 'tablerChartPie2',
    route: '/support-team',
    isPrivate: false,
    key: 'dashboard'
  },
  {
    displayName: 'customers',
    iconName: 'tablerUsers',
    route: '/support-team/u/customer',
    isPrivate: false,
    key: 'customer'
  },
  {
    displayName: 'restaurants',
    iconName: 'tablerBuildingStore',
    route: '/support-team/u/restaurants',
    isPrivate: false,
    key: 'restaurants'
  },
  {
    displayName: 'deliveryman',
    iconName: 'tablerRun',
    route: '/support-team/u/deliveryman',
    isPrivate: false,
    key: 'deliveryman'
  },
  {
    displayName: 'agent_queue',
    iconName: 'tablerInbox',
    route: '/support-team/u/agent-queue',
    isPrivate: false,
    key: 'agent-queue'
  },
  {
    displayName: 'history_title',
    iconName: 'tablerMessage',
    route: '/support-team/u/chat-list',
    isPrivate: false,
    key: 'chat-list'
  },
  {
    displayName: 'canned_replies',
    iconName: 'tablerTemplate',
    route: '/support-team/u/canned-responses',
    isPrivate: false,
    key: 'canned-responses'
  },
  {
    displayName: 'team_queues',
    iconName: 'tablerUsers',
    route: '/support-team/u/team-queues',
    isPrivate: false,
    key: 'team-queues'
  },
];
