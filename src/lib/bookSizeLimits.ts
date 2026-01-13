import { BookSize } from '@/hooks/useVaults';

export const MAX_IMAGES = 3;

// Character limits based on book size - scaled proportionally to printable area
// Base is 9x9" which has the original limits
export const getCharacterLimits = (bookSize: BookSize = '9x9') => {
  switch (bookSize) {
    case '12x12':
      // 12x12 has ~78% more printable area than 9x9
      return {
        noImages: 2200,
        withImages: 950,
      };
    case '9x9':
      // Base size - original limits
      return {
        noImages: 1700,
        withImages: 750,
      };
    case 'a4':
      // A4 (210x297mm) has ~67% more area than 9x9 (229x229mm)
      return {
        noImages: 1900,
        withImages: 850,
      };
    case 'a5':
      // A5 (148x210mm) has ~41% less area than 9x9
      return {
        noImages: 1200,
        withImages: 500,
      };
    default:
      return {
        noImages: 1700,
        withImages: 750,
      };
  }
};

export const getBookSizeLabel = (bookSize: BookSize): string => {
  switch (bookSize) {
    case '9x9':
      return '9×9" Square';
    case '12x12':
      return '12×12" Square';
    case 'a4':
      return 'A4 Portrait';
    case 'a5':
      return 'A5';
    default:
      return bookSize;
  }
};
