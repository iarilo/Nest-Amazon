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
    return this.prismaService.category.create({
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
      },
    });
  }


 

  //Все категории
  async getAll() {
    return this.prismaService.category.findMany({
      select: {
        ...returnCategoryObject,
        products:{
          select:ReturnProductObjectFullest}
      }
    });
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


