export type ReelStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'READY'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'REJECTED'
  | 'EXPIRED';

export type ReelVertical = 'FOOD' | 'DAIRY' | 'SERVICES' | 'REAL_ESTATE';

export type ReelTargetType = 'RESTAURANT' | 'PRODUCT' | 'SERVICE' | 'VENDOR' | 'PROPERTY';

export interface AdminReelTarget {
  type?: ReelTargetType;
  refId?: string;
}

export interface AdminReelCta {
  label?: string;
  overridden?: boolean;
}

export interface AdminReelListItem {
  id: string;
  thumbnail?: string;
  vertical?: ReelVertical;
  target?: AdminReelTarget;
  status: ReelStatus;
  views?: number;
  likesCount?: number;
  caption?: string;
  description?: string;
  processing?: { stage?: string; progress?: number; error?: string };
  publishAt?: string;
  createdAt?: string;
}

export interface AdminReelReport {
  id: string;
  reelId: any;
  reporterId: any;
  reason: 'SPAM' | 'INAPPROPRIATE' | 'MISLEADING' | 'COPYRIGHT' | 'OTHER';
  details?: string;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  createdAt?: string;
}

export interface AdminReelAnalytics {
  reelId: string;
  status: ReelStatus;
  views: number;
  completed: number;
  completionRate: number;
  likes: number;
  saves: number;
  shares: number;
  comments: number;
}

export type ReportDecision = 'REVIEWING' | 'DISMISS' | 'HIDE_REEL' | 'REMOVE_REEL';
