import { 
  Controller,Get, UsePipes,Post,Body,HttpCode,
    ValidationPipe, Query,Param,Delete,Put
   } from '@nestjs/common';
import { ProductService } from './product.service';
import { GetAllProductDto } from './dto/get-all.product.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { ProductDto } from './dto/product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {};

  
//Создания
@UsePipes(new ValidationPipe)
@HttpCode(200)
@Auth()
@Post('create')
async create(@Body() dto: ProductDto){
return this.productService.createProduct(dto)
}

// @UsePipes(new ValidationPipe)
// @HttpCode(200)
// @Auth()
// @Post()
// async create(){
// return this.productService.createProduct()
// }


// Все
@UsePipes(new ValidationPipe())
@Get('all')
// Данные от ? знака и до & в http:// строке 
async getAll(@Query() queryDto: GetAllProductDto){
return this.productService.allProduct(queryDto)
}

//По id
@Get(':id')
async getByid(@Param('id') id: string){
  return this.productService.byid(+id)
}

// Обновления
@UsePipes(new ValidationPipe())
@HttpCode(200)
@Auth()
@Put(':id')
async update(@Param('id') id: string, @Body() dto: ProductDto){
return this.productService.updateProduct(+id,dto)
}


// По slug
@Get('by-slug/:slug')
async getSlug(@Param('slug') slug: string){
  return this.productService.bySlug(slug)
}

// По  категории
@Get('by-category/:categorySlug')
async getCategory(@Param('categorySlug') categorySlug: string){
return this.productService.byCategory(categorySlug)
}

// По похожим товарам
@Get('similar/:id')
async getSimilar(@Param('id') id: string){
return this.productService.getSimiliar(+id)
}

// Удаление
@HttpCode(200)
@Auth()
@Delete(':id')
async delete(@Param('id') id: string){
  return this.productService.deleteProduct(+id)
}

};
// интенсив онлайв кинотеатр  Роли:(администратор, пользователь ,гость, )
// 2:34
