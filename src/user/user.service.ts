import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RequestUserDto, UserDto, UserTokenDto } from './dto/user.dto';
import { ReturnUserObject } from './return.user.Object';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  //Получаю профиль
  //  Prisma.NewUserSelect даёт возможность получать поля которых сейчас нет

   async byId(id: number, selectObject: Prisma.NewUserSelect = {}) {
  //async byId(req:UserTokenDto, selectObject: Prisma.NewUserSelect = {}) {
    // Поиск  user по id
   
    const user = await this.prismaService.newUser.findUnique({
      // Поиск
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
            descrition: true,
            prise: true,
            images: true,
            slug: true,
            category:{
              select:{
                slug:true
              
            
          }
        },
        reviews: true,
      }
    },
    role:true, 
        
        ...selectObject,
      },

      //  include  Разворачиваю связи ( внедрён в select )
      //  include: {favorites: true}
    });

    if (!user) {
      throw new Error('Отсутствует пользователь (UserService - byId ) ');
    }

    //console.log('User Profile =',user)
    return user;
  }


  // ====================================
  /*
  async byId(id: number, selectObject: Prisma.NewUserSelect = {}) {
    // Поиск  user по id
    const user = await this.prismaService.newUser.findUnique({
      // Поиск
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
        review: {
          select:{
            rating:true,
            text: true   
          }
        },
        
        ...selectObject,
      },

      //  include  Разворачиваю связи ( внедрён в select )
      //  include: {favorites: true}
    });

    if (!user) {
      throw new Error('Отсутствует пользователь (UserService - byId ) ');
    }
    return user;
  }
    */

  // ====================================================

  // Обновление профиля
  async updateProfile(id: number, dto: UserDto) {
    // Проверяю существование user по email
    const isSameUser = await this.prismaService.newUser.findUnique({
      where: {
        email: dto.email,
      },
    });

    //  isSameUser все поля user
    //  isSameUser.id    id  поле user

    // Если user такой существует то тогда пишу ошибку
    // Логический оператор И (&&) со значением  true или false
    if (isSameUser && id != isSameUser.id) {
      throw new BadRequestException('такой email существует');
    }
    // Получаю user методом byId
    const user = await this.byId(id);

   // Обновляю методом update, по id и в данных(data) полям присваиваю значения из dto
    return this.prismaService.newUser.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        avatarPath: dto.avatarPath,
        phone: dto.phone,
        //password: dto.password ? await hash(dto.password) : user.password,
        password: dto.password
          ? await hash(isSameUser.password)
          : user.password,
      },
    });
  }

  // Получение и удаление из избранного
  async toggleFavorite(id: number, productId: number) {
    // Ищю user
    const user = await this.byId(id);
    // Если user нет то тогда вывожу ошибку
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    };

    // Проверяю методом some наличия товара в избранном (favorites) где product.id равен productId
    const isExist = user.favorites.some((product) => product.id == productId);

    //Обновляю продукт
    // 1) нахожу user по id
    await this.prismaService.newUser.update({
      where: { id: user.id },
      // 2) В данных перезаписываю favorites
      data: {
        favorites: {
          // Если в избранном товара нет, то тогда не подслючаю productId , а если есть то подключаю
          [isExist ? 'disconnect' : 'connect']: { id: productId },
        },
      },
    });

    return {message: 'Продукт добавлен'};
  };

  async userProduct(id: number){
    return this.prismaService.newUser.findUnique({
      where:{
        id
      },
      include:{
        favorites: true
      }
    })
  }

  async userTest(req:UserTokenDto){
    const{id} = req.userToken
    console.log('Req - id =',id)
  
return {message:'Пользователь из req получен ',ID: id, requestUser:req.userToken}
  }

};



