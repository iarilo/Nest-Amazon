import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { returnCategoryObject } from './return-category.object';
import { CategoryDto } from './categoryDto';
import { generateSlug } from 'src/utils/generate-slug';
import { ReturnProductObjectFullest } from 'src/product/returnProduct.Object';

// @Injectable()
// export class CategoryService {}



@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}


  // Создание категории
  async createCategory(dto: CategoryDto) {
  
  // Получаем максимальный порядок текущих категорий
    const maxOrder = await this.prismaService.category.aggregate({
      _max: {
        order: true,
      },
    });

    const newOrder = dto.order ?? (maxOrder._max.order ?? 0) + 1; // Устанавливаем порядок
      return this.prismaService.category.create({
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
        order: newOrder,
      },
    });

  }


  //Все категории
  async getAll() {
     const categoryesAll = await  this.prismaService.category.findMany({
      select: {
        ...returnCategoryObject,
        products:{
          select:ReturnProductObjectFullest}
      }
    });

  /*  
  // Определяем порядок приоритетов
  const priorityOrder = {
    toys: 1, // высший приоритет
    sport: 2, // высокий приоритет
    footwear: 3, // средний приоритет
    clothes: 4, // низкий приоритет
  };

  // Сортируем категории по приоритетам
  categoryesAll.sort((a, b) => {
    return (priorityOrder[a.name] || Infinity) - (priorityOrder[b.name] || Infinity);
  });

  */
   //console.log('categoryesAll=', categoryesAll);
     return categoryesAll

  }

  // Поиск по slug
  async slugCategory(slug: string) {
    const categorySlug = await this.prismaService.category.findUnique({
      where: { slug },
      select: returnCategoryObject,
    });
    if (!categorySlug) {
      throw new NotFoundException('Такого slug нет');
    }
    return categorySlug;
  }

  // Поиск категории
  async byId(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      select: returnCategoryObject,
    });
    if (!category) {
      throw new NotFoundException('Такой категории нет');
    }
    return category;
  }

  // Обновление категорий
  async updateCategory(id: number, dto: CategoryDto) {
    const update = await this.prismaService.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
      },
    });
  

  
return  update

  };

  // Удаление категорий
  async deleteCategory(id: number) {
    return this.prismaService.category.delete({
      where: { id },
    });
  }
}


