import {
	Controller,
	Get,
	UsePipes,
	Post,
	Body,
	HttpCode,
	ValidationPipe,
	Query,
	Param,
	Delete,
	Put,
	UseGuards,
	Req,
} from '@nestjs/common'
import { ProductService } from './product.service'
import { GetAllProductDto } from './dto/get-all.product.dto'
import { Auth } from 'src/auth/decorators/auth.decorators'
import { ProductDto } from './dto/product.dto'
import { AuthPermissions } from 'src/auth/decorators/auth.decorators'
import {
	Resource as PrismaResource,
	Actions as PrismaActions,
} from '@prisma/client'
import { AuthenticationGuard } from 'src/guards/authentication.guard'
import { AuthorizationGuard } from 'src/guards/authorization.guard'
import { AuthPassword } from 'src/guards/authPassword.guards'

//@UseGuards(AuthenticationGuard,AuthorizationGuard )
//@UseGuards(AuthPassword,AuthorizationGuard  )
@Controller('product')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	//Создания
	@UsePipes(new ValidationPipe()) //
	@HttpCode(200)
	//@Auth()
	// @AuthPermissions([
	//   {
	//     id: 0,
	//     resource: PrismaResource.products,
	//     actions: [PrismaActions.create, PrismaActions.delete]
	//   }
	//  ])
	@Post('create')
	async create(@Body() dto: ProductDto) {
		return this.productService.createProduct(dto)
	}

	@UseGuards(AuthenticationGuard,AuthorizationGuard )
	@AuthPermissions([
		{
			id: 0,
			resource: PrismaResource.products,
			actions: [PrismaActions.create, PrismaActions.delete],
		},
	])
	@Get('test')
	async getTest(@Req() req) {
		// console.log('req =',req)
		// console.log('req.user =',req.user)
		// console.log('req.userToken =',req.userToken)

		return { message: 'Accessed Resource', userToken: req.userToken }
		//return { message: 'Accessed Resource', userToken: req.user }
	}

	// Все
	@UsePipes(new ValidationPipe())
	@Get('all')

	// Данные от ? знака и до & в http:// строке
	async getAll(@Query() queryDto: GetAllProductDto) {
		return this.productService.allProduct(queryDto)
	}

	//По id
	@Get(':id')
	async getByid(@Param('id') id: string) {
		return this.productService.byid(+id)
	}

	// Обновления
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	//@Auth()
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: ProductDto) {
		return this.productService.updateProduct(+id, dto)
	}

	// По slug
	@Get('by-slug/:slug')
	async getSlug(@Param('slug') slug: string) {
		return this.productService.bySlug(slug)
	}

	// По  категории
	@Get('by-category/:categorySlug')
	async getCategory(@Param('categorySlug') categorySlug: string) {
		return this.productService.byCategory(categorySlug)
	}

	// По похожим товарам
	@Get('similar/:id')
	async getSimilar(@Param('id') id: string) {
		return this.productService.getSimiliar(+id)
	}

	// Удаление
	@HttpCode(200)
	//@Auth()
	@Delete(':id')
	async delete(@Param('id') id: string) {
		return this.productService.deleteProduct(+id)
	}
}
// интенсив онлайв кинотеатр  Роли:(администратор, пользователь ,гость, )
// 2:34
