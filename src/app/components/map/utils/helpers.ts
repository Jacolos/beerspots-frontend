// src/app/components/map/utils/helpers.ts
export const getReviewsCount = (count: number) => {
    if (count === 1) return '1 opinia';
    if (count === 0) return '0 opinii';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return `${count} opinie`;
    return `${count} opinii`;
  };