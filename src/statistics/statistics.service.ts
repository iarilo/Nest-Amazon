import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StatisticsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userServer: UserService
        ){};
// Получаю user

async getMain(userId: number){
   const user = await this.userServer.byId(userId,{
    orders:{select:{items: true}},
    review: true  
   });
  

return [
    {
        name: 'Order',
        value: user.orders.length
    },
    {
        name: 'Reviews',
        value: user.review.length
    },
    {
        name: 'Favorites',
        value: user.favorites.length
    },{
        name: 'Total amount',
        value: 1000
    }
]
};

};
