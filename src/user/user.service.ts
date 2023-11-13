import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import { ReturnUserObject } from './return.user.Object';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  //Получаю профиль
  //  Prisma.NewUserSelect даёт возможность получать поля которых сейчас нет
  async byId(id: number, selectObject: Prisma.NewUserSelect = {}) {
    // Поиск  user по id
    const user = await this.prismaService.newUser.findUnique({
      // Поиск  user по id
      where: { id },
      // Разворачиваю связи и указываю  поля
      select: {
    //  Поля для  NewUser    
        ...ReturnUserObject,
        favorites: {
            //  Поля для favorites 
          select: {
            id: true,
            name: true,
            slug: true,
            descrition: true,
            prise: true,
            images: true,
          },
        },
        ...selectObject
      },

      //  include  Разворачиваю связи ( внедрён в select )
    });

    if (!user) {
        throw new Error('Отсутствует пользователь (UserService - byId ) ')
    }
    return user
  }

  // Обновление профиля

  async updateProfile(id: number, dto: UserDto) {}

  // Получение и удаление из избранного

  async toggleFavorite(id: number, productId: string) {}
}
