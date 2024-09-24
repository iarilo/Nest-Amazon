import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReturnReviewObject } from './return_review.Object';
import { ReviewDto } from './review_dto';


// @Injectable()
// export class ReviewService {}


@Injectable()
export class ReviewService {
  constructor(private readonly prismaServer: PrismaService) {}

  async createReview(id: number, dto: ReviewDto, productId: number) {
     return this.prismaServer.review.create({
      // Указываю поля review
      data: {
        ...dto,
        // Подсоединяю product к productId
        // connect соединять
        product: { 
          connect: { id: productId },
        },
        //  Подсоединяю  newuser к userId
        // connect соединять
        newuser: {
          connect: {
            id: id,
          },
        },
      },
    });


  }

  async allReview() {
    // orderBy    упорядочить
    return this.prismaServer.review.findMany({
      orderBy: { createAt: 'desc' },
      select: ReturnReviewObject,
    });
  }

  // Получение среднего отзова
  async getAverageValueByProductId(productId: number) {
    // where где
    return this.prismaServer.review
      .aggregate({
    // Ищю по productId
        where: { productId },
    //   _avg: подбирает среднее значение рейтинга    
        _avg: { rating: true },
      }) // data._avg  получает число 
      .then((data) => data._avg);
  };

 
};


