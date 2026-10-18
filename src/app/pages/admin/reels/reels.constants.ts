import { ReelStatus, ReelTargetType, ReelVertical } from 'src/app/interfaces/admin.reels.interface';

export const REEL_STATUSES: ReelStatus[] = [
  'DRAFT',
  'PROCESSING',
  'READY',
  'SCHEDULED',
  'PUBLISHED',
  'PAUSED',
  'REJECTED',
  'EXPIRED',
];

export const REEL_VERTICALS: ReelVertical[] = ['FOOD', 'DAIRY', 'SERVICES', 'REAL_ESTATE'];

export const REEL_TARGETS_BY_VERTICAL: Record<ReelVertical, ReelTargetType[]> = {
  FOOD: ['RESTAURANT', 'PRODUCT'],
  DAIRY: ['PRODUCT'],
  SERVICES: ['SERVICE', 'VENDOR'],
  REAL_ESTATE: ['PROPERTY'],
};

const CTA_MATRIX: Record<string, string> = {
  'FOOD+PRODUCT': 'ORDER NOW',
  'FOOD+RESTAURANT': 'ORDER NOW',
  'DAIRY+PRODUCT': 'SUBSCRIBE',
  'SERVICES+SERVICE': 'BOOK NOW',
  'SERVICES+VENDOR': 'BOOK NOW',
  'REAL_ESTATE+PROPERTY': 'VIEW PROPERTY',
};

export function suggestReelCta(vertical: ReelVertical, targetType: ReelTargetType): string {
  return CTA_MATRIX[`${vertical}+${targetType}`] || 'VIEW MORE';
}

export function isTargetAllowed(vertical: ReelVertical, targetType: ReelTargetType): boolean {
  return (REEL_TARGETS_BY_VERTICAL[vertical] || []).includes(targetType);
}
