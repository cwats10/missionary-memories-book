import { BookSize } from '@/hooks/useVaults';

export const MAX_IMAGES = 3;

// Character limits for 12x12" premium format
export const getCharacterLimits = (_bookSize?: BookSize) => {
  return {
    noImages: 2200,
    withImages: 950,
  };
};

export const getBookSizeLabel = (_bookSize?: BookSize): string => {
  return '12×12" Premium Square';
};
