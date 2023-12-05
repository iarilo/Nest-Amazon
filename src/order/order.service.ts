import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrderService {
constructor(private readonly prisma: PrismaService){};

async orderAll(userId: number){
return this.prisma.order.findMany({
    // Получение всех товаров по  userId
    //    where: проверяет по
    where:{
        id: userId
    },
    //  orderBy: Сортирует по
    orderBy:{
        createAt:'desc'
    }
})
};

};
