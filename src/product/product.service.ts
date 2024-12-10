import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
	ReturnProductObject,
	ReturnProductObjectFullest,
} from './returnProduct.Object'
import { ProductDto } from './dto/product.dto'
import { generateSlug } from 'src/utils/generate-slug'
import { PaginationService } from 'src/pagination/pagination.service'
import {
	EnumProductSort,
	EnumProductSortCategory,
	GetAllProductDto,
} from './dto/get-all.product.dto'
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
		const { sort, searchTerm, categorySort } = dto

		// console.log('sort = ',sort)
		// console.log('searchTerm = ',searchTerm)

		// sort: значение из enum для сортировки newest,igh-price и тд.
		// searchTerm: слово для поиска.
		//categorySort: все слаги категорий['clothes','footwear','toys','sport'] для поиска where в категориях

		/*
		//Пример типизации массива
		const searchCategory = [
		{ name: 'footwear' },{ name: 'toys' }] as Prisma.JsonArray
        */

		// Определяем параметры сортировки product
		const prismaSort: Prisma.ProductOrderByWithRelationInput = {
			prise:
				sort === EnumProductSort.HIGH_PRICE
					? 'desc'
					: sort === EnumProductSort.LOW_PRICE
					? 'asc'
					: sort === EnumProductSort.NEWEST
					? 'desc'
					: 'asc',
		}

		// Фильтрация по поисковому термину
		// ProductWhereInput  типизированный аналог схемы products
		// OR или
		// mode: 'insensitive'  игнорирует регистер
		// Поиск подстроки: contains проверяет, есть ли в указанном поле( name, description, slug и т. д.)
		//prismaSearchTermFilter объект с условиями фильтрации для поиска продуктов
		const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
			? {
					OR: [
						{
							category: { name: { contains: searchTerm, mode: 'insensitive' } },
						},
						{ name: { contains: searchTerm, mode: 'insensitive' } },
						{ descrition: { contains: searchTerm, mode: 'insensitive' } },
						{ slug: { contains: searchTerm, mode: 'insensitive' } },
					],
			  }
			: {}

		// Пагинация
		const { perPage, skip } = this.paginationService.getPagination(dto)

		/*
			// динамического формирования объекта where с фильтрацией по slug.
			//where: { name: typeCategory },
			where: {...(returnSortcategory ?{slug:{in:slug}}:{})},
           	// in — это оператор, который используется для проверки, содержится ли определенное значение в наборе значений.
			//categorySort: все слаги категорий
			// slug: поле из схемы category
			//...(categorySort ? { slug: { in: categorySort } } : {}),
		})
		*/

		// Определяем порядок приоритетов
		const priorityOrder = {
			toys: 1, // высший приоритет
			sport: 2, // высокий приоритет
			footwear: 3, // средний приоритет
			clothes: 4, // низкий приоритет
		}

		// Извлекаю категории вместе с их продуктами
		const categories = await this.prisma.category.findMany({
			//include: включает в себя
			include: {
				products: {
					where: prismaSearchTermFilter, // функция поиска
					orderBy: prismaSort, //функция сортировки
					select: ReturnProductObject, // Настройка в соответствии с требованиями
				},
			},
		})

		//Сортирую категории по приоритету
		/*
	 Метод sort принимает функцию сравнения, которая определяет порядок элементов.
     Для этого групе а присваивается slug первого элемента из массива приоритетов 
	 [a.slug] и если он соответствует категории из массива категорий,то тогда категория присваивается этой группе.Если слаг не найден в priorityOrder, мы присваиваем ему значение Infinity, что означает, что такие категории будут в конце отсортированного массива.Аналогично с групой b. сли група а меньше, групы b sort переместит элемент a перед элементом b, что соответствует более высокому приоритету.Если они равны, порядок не изменяется. 
	*/

		const sortedCategories = categories.sort((a, b) => {
			// По умолчанию Infinity(до бесконечности), если не найдено
			const priorityA = priorityOrder[a.slug] || Infinity
			const priorityB = priorityOrder[b.slug] || Infinity
			return priorityA - priorityB
		})

		// Сортировка продуктов в каждой категории
		// sortedCategories.forEach(category => {
		// 	category.products.sort((a, b) => {
		// 		if (sort === EnumProductSort.HIGH_PRICE) {
		// 			return b.prise - a.prise; // Сортировка по убыванию цены
		// 		} else if (sort === EnumProductSort.LOW_PRICE) {
		// 			return a.prise - b.prise; // Сортировка по возрастанию цены
		// 		} else if (sort === EnumProductSort.NEWEST) {
		// 			return new Date(b.createAt).getTime() - new Date(a.createAt).getTime(); // Сортировка по дате
		// 		} else {
		// 			return new Date(a.createAt).getTime() - new Date(b.createAt).getTime(); // Сортировка по старине
		// 		}
		// 	});
		// });

		//console.log('sortedCategories =', sortedCategories)

		// Разбиваю результат на страницы
		/* Метод  slice  используется для создания подмножества массива sortedCategories на основе параметров пагинации.Он принимает два аргумента: начальный индекс и конечный индекс,skip: Это начальный индекс, с которого следует начать извлечение элементов sortedCategories.perPage: Здесь указывается, сколько элементов вы хотите извлечь, начиная с skipи ндекса.Сейчас установлено  skip = 0 и perPage = 1.Поэтому будит загруженна первая категория.
		 */
		const paginatedCategories = sortedCategories.slice(skip, skip + perPage)

		// Получаем продукты с сортировкой по параметрам
		const products = await this.prisma.product.findMany({
			where: prismaSearchTermFilter,
			orderBy: prismaSort, //сортировкак по enum
			// skip: номер кнопки
			skip: skip, // Сколько элементов надо пройти что-бы вывести на нужный элемент
			take: perPage, // Текущая страница
			select: ReturnProductObject,
		})
		return {
			categories: paginatedCategories,
			products,
			// length: равен колличеству  продуктов
			length: await this.prisma.product.count({
				// count  число
				// length: равен колличеству  продуктов  в фильтре
				//where: prismaSearchTermFilter, // количество элементов
			}),
		}
	}

	/*
	async allProduct(dto: GetAllProductDto = {}) {
		const { sort, searchTerm } = dto

		//console.log('Server.product - dto =', dto)
		// console.log('Server.product - sort =',sort)
		// console.log('Server.category - sort =',categorySort)

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
					{// По категории
						category: {	name: {
									contains: searchTerm, //   contains:  содержит
									mode: 'insensitive', // Поиск в любом регистре
								},							
							  },
						},{	// По названию товара
							name: {
								contains: searchTerm,
								mode: 'insensitive',
							},
						},{	// По описанию   товара
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
		// Фильтрация по категории
		// if (category) {
		// 	// Убедитесь, что AND всегда является массивом
		// 	prismaSearchTermFilter.AND = [
		// 	  ...(prismaSearchTermFilter.AND || []), // Существующие условия, если они есть
		// 	  {
		// 		category: {
		// 		  name: category,
		// 		},
		// 	  },
		// 	];
		//   }

		console.log('Server.Product = ', products)

		return {
			products,
			length: await this.prisma.product.count({
				// count  число
				where: prismaSearchTermFilter, // количество элементов
			}),
		}
	}

	*/
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
