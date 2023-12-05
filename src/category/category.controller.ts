import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { CategoryDto } from './categoryDto';


// @Controller('category')
// export class CategoryController {}
 
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Создание категории
  @HttpCode(200)
  @Auth()
  @Post('create')
  async CreateCategory(@Body() dto: CategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // Поиск по slug
  @Auth()
  @Get('by-slug/:slug')
  async GetBySlug(@Param('slug') slug: string) {
    return this.categoryService.slugCategory(slug);
  }

  // Поиск категории
  @Get(':id')
  async SearchCategory(@Param('id') id: string) {
    return this.categoryService.byId(+id);
  }

  //Все категории
  @Get()
  async AllCategory() {
    return this.categoryService.getAll();
  }

  // Обновление категорий
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Put(':id')
  async UpdateCategory(
    @Param('id') id: string,
    @Body() dto: CategoryDto,
  ) {
    return this.categoryService.updateCategory(+id, dto);
  }

  // Удаление категорий
  @HttpCode(200)
  @Auth()
  @Delete(':id')
  async DeleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(+id);
  }
}



// 1:58