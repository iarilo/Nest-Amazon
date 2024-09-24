import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
	ReturnProductObject,
	ReturnProductObjectFullest,
} from './returnProduct.Object'
import { ProductDto } from './dto/product.dto'
import { generateSlug } from 'src/utils/generate-slug'
import { PaginationService } from 'src/pagination/pagination.service'
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto'
import { Prisma } from '@prisma/client'
import { CategoryService } from 'src/category/category.service'

@Injectable()
export class ProductService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService,
		private readonly category: CategoryService,
	) {}

	async createProduct(dto: ProductDto) {
		const category = await this.category.byId(dto.categoryId)
		if (!category) {
			throw new NotFoundException('Такая категория отсутствует')
		}

		const product = await this.prisma.product.create({
			data: {
				name: dto.name,
				slug: generateSlug(dto.name),
				descrition: dto.descrition,
				prise: dto.prise,
				images: dto.images,
				category: {
					connect: { id: category.id },
				},
			},
		})
		return product
	}

	// ...................................................

	async allProduct(dto: GetAllProductDto = {}) {
		const { sort, searchTerm } = dto
		
		//searchTerm:   Поиск по ключевому слову

		// prismaSort Массив, куда дабавляется сортировка
		const prismaSort: Prisma.ProductOrderByWithRelationInput[] = []

		if (sort === EnumProductSort.HIGH_PRICE) {
			prismaSort.push({ prise: 'desc' })
		} else if (sort === EnumProductSort.LOW_PRICE) {
			prismaSort.push({ prise: 'asc' })
		} else if (sort === EnumProductSort.NEWEST) {
			prismaSort.push({ createAt: 'desc' })
		} else {
			prismaSort.push({ createAt: 'asc' })
		}

		// Поиск по ключевому слову
		const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
			? // searchTerm ? {} : {}
			  {
					// OR Или
					OR: [
						{
							// По категории
							category: {
								name: {
									contains: searchTerm, //   contains:  содержит
									mode: 'insensitive', // Поиск в любом регистре
								},
							},
						},
						{
							// По названию товара
							name: {
								contains: searchTerm,
								mode: 'insensitive',
							},
						},
						{
							// По описанию   товара
							descrition: {
								contains: searchTerm,
								mode: 'insensitive', //Режим
							},
						},
					],
			  }
			: {}

		// perPage?: string; // На страницу  из PaginationDto
		const { perPage, skip } = this.paginationService.getPagination(dto)

		// Встраиваю все данные в товары
		const products = await this.prisma.product.findMany({
			where: prismaSearchTermFilter, // Поиск по ключевому слову
			orderBy: prismaSort, //сортировкак по enum
			skip: skip, // Сколько элементов надо пройти что-бы вывести на нужный элемент
			take: perPage, // Текущая страница
			// take: Передача отрицательного значения, запрос меняет порядок на обратный
			select: ReturnProductObject,
		})

		return {
			products,
			length: await this.prisma.product.count({
				// count  число
				where: prismaSearchTermFilter, // количество элементов
			}),
		}
	}
	// .....................................................
	async byid(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: ReturnProductObjectFullest,
		})
		if (!product) {
			throw new NotFoundException('Такой продукт отсутствует')
		}
		return product
	}

	// .......................................................

	async updateProduct(id: number, dto: ProductDto) {
		//const{ name,descrition,prise,images,categoryId} = dto
		return this.prisma.product.update({
			where: { id },
			data: {
				name: dto.name,
				slug: generateSlug(dto.name),
				descrition: dto.descrition,
				prise: dto.prise,
				images: dto.images,
				category: {
					connect: { id: dto.categoryId },
				},
			},
		})
	}

	// ......................................................

	async bySlug(slug: string) {
		const slugProduct = await this.prisma.product.findUnique({
			where: { slug },
			select: ReturnProductObjectFullest,
		})
		if (!slugProduct) {
			throw new NotFoundException('Такой продукт по slug отсутствует')
		}
		return slugProduct
	}

	//  .......................................................

	async byCategory(categorySlug: string) {
		const productCategory = await this.prisma.product.findMany({
			where: {
				category: {
					slug: categorySlug,
				},
			},
			select: ReturnProductObjectFullest,
		})
		if (!productCategory) {
			throw new NotFoundException('Такая категория отсутствует')
		}
		return productCategory
	}
	//  .......................................................

	async getSimiliar(id: number) {
		// Текущий продукт
		const currentProduct = await this.byid(id)

		if (!currentProduct) {
			throw new NotFoundException('Такой продукт отсутствует')
		}

		const products = await this.prisma.product.findMany({
			// поиск по имени категории
			where: {
				category: {
					name: currentProduct.category.name,
				}, // Исключаю  текущий  товар
				NOT: {
					id: currentProduct.id,
				},
			},
			//  orderBy:  Сортирует по .
			orderBy: {
				createAt: 'desc',
			},

			select: ReturnProductObject,
		})
		//  Товар с полями
		return products
	}

	//  ........................................................

	async deleteProduct(id: number) {
		try {
			await this.prisma.review.deleteMany({
				where: { productId: id },
			})
			return this.prisma.product.delete({
				where: { id: id },
			})
		} catch (error) {
			console.error('Не удалось удалить продукт:', error)
			throw new Error(
				'Удаление продукта не удалось. Проверьте наличие связанных записей.',
			)
		}
	}
}

// 2: 27
