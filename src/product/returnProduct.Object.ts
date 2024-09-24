import { Prisma } from '@prisma/client';
import { returnCategoryObject } from 'src/category/return-category.object';
import { ReturnReviewObject } from 'src/review/return_review.Object';

// Один отдельно взятый товар
export const ReturnProductObject: Prisma.ProductSelect = {
  id: true,
  createAt: true,
  name: true,
  slug: true,
  descrition: true,
  prise: true,
  images: true,
  category: { select: returnCategoryObject },
  reviews: { select: ReturnReviewObject },
};

// Все данные о товаре

export const ReturnProductObjectFullest: Prisma.ProductSelect = {
  ...ReturnProductObject,
 
};
