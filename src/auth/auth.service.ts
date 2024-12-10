import {
	BadRequestException,
	Delete,
	Injectable,
	NotFoundException,
	//Response,
	UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AuthDto } from './dto/auth.dto'
import { hash, verify } from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { NewUser } from '@prisma/client'
import { AuthRefrehTokenDto } from './dto/auth.refreshToken.dto'
import { RolesService } from 'src/roles/roles.service'
import {
	RequestUserDto,
	SortUserRoleDto,
	UserTokenDto,
} from 'src/user/dto/user.dto'
import { ro } from '@faker-js/faker'

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwt: JwtService,
		private readonly rolesService: RolesService,
	) {}
	// -------------------------------------------------------

	async addPrismaRole(userId: number) {
		const userWithRole = await this.prismaService.newUser.findUnique({
			where: {
				id: userId,
			},
			include: {
				role: {
					select: {
						id: true,
						name: true,
						permissions: true,
					},
				},
			},

			/* 
		   include:{
			   role:{
				   select:{
					   id:true,
					   name:true,
					   permissions:true
				   }
			   }
		   }
		   
		   include: {
			   role: {
				 where: { // ваши фильтры для роли  }
			   },
			 }
	  */
		})

		return userWithRole
	}

	//Поиск пользователя
	async OldUser(dto: AuthDto) {
		const user = await this.prismaService.newUser.findUnique({
			where: {
				email: dto.email,
			},
		})
		return user
	}

	// Вывожу  только необходимые поля
	private returnUserFilds(user: NewUser) {
		return {
			id: user.id,
			email: user.email,
		}
	}

	private returnRoleFilds(userRole: SortUserRoleDto) {
		return {
			userId: userRole.id,
			nameRole: userRole.role.name,
			roleId: userRole.roleId,
			role: userRole.role,
		}
	}

	// Показываю нужные поля и токены
	async Resultat(id: number, user: NewUser) {
		const token = await this.issueTokens(id)
		const userRole = await this.addPrismaRole(id)
		if (userRole.role === null) {
			return { ...token, userI: this.returnUserFilds(user) }
		}

		return {
			...token,
			userI: this.returnUserFilds(user),
			role: this.returnRoleFilds(userRole),
		}
		//return { accesToken:token[0],refreshToken:token[1],user: this.returnUserFilds(user) }
	}

	//-----------------------------------------------------------

	//Регистрация
	async registrUser(dto: AuthDto) {
		//Поиск пользователя
		const oldUser = await this.OldUser(dto)
		if (oldUser) {
			throw new BadRequestException('Пользователь с таким email уже существует')
		}

		const user = await this.prismaService.newUser.create({
			data: {
				name: dto.name,
				email: dto.email,
				avatarPath: dto.avatarPath,
				phone: dto.phone,
				password: await hash(dto.password),
			},
		})
		// Показываю нужные поля и токены
		return this.Resultat(user.id, user)
	}

	// ----------------------------------------------------------

	//Создаю token
	private async issueTokens(userId: number) {
		const data = { id: userId }
		const accesToken = this.jwt.sign(data, { expiresIn: '1d' })
		//const accesToken = this.jwt.sign(data, { expiresIn: 300 })
		const refreshToken = this.jwt.sign(data, { expiresIn: '30d' })
		return [{ accesToken: accesToken }, { refreshToken: refreshToken }]
	}

	// ---------------------------------------------------------------
	// Получаю токен по id

	async tokenById(id: number) {
		return this.issueTokens(id)
	}

	//Валидация пользователя

	private async validateUser(dto: AuthDto) {
		// Получаю пользователя
		//Поиск пользователя
		const User = await this.OldUser(dto)
		if (!User) {
			throw new NotFoundException('Пользователь не найден')
		}
		//--------------------------------------------------------------------
		// Проверяю пароль     verify from 'argon2'
		const isValid = await verify(User.password, dto.password)
		if (!isValid) {
			throw new UnauthorizedException('Пароль не подходит')
		}

		return User
	}
	//-------------------------------------------------------------------
	//login
	async login(dto: NewUser) {
		const userlogin = await this.validateUser(dto)
		// Показываю нужные поля и токены

		return this.Resultat(userlogin.id, userlogin)
	}

	// --------------------------------------------------------------------
	// acssesToken
	async getNewToken(dto: AuthRefrehTokenDto) {
		// Проверяю токен , получаю id
		const result = await this.jwt.verifyAsync(dto.refreshToken)
		if (!result) {
			throw new UnauthorizedException('Не прошёл token')
		}

		//Получаю user по id
		const user = await this.prismaService.newUser.findUnique({
			where: { id: result.id },
		})

		//Возврощаю token
		// Показываю нужные поля и токены
		return this.Resultat(user.id, user)
	}

	// ----------------------------------------------------

	//Показать всех пользователей
	async allUser() {
		return this.prismaService.newUser.findMany({
			include: {
				role: {
					select: {
						id: true,
						name: true,
						permissions: true,
					},
				},
			},
		})
	}

	// Удалить
	async deleteUser(id: number) {
		return this.prismaService.newUser.delete({ where: { id } })
	}

	// Обновление
	async updateUser(id: number, dto: AuthDto) {
		return this.prismaService.newUser.update({
			where: { id },
			data: dto,
		})
	}

	//Поиск по id
	async findOne(id: number) {
		return this.prismaService.newUser.findUnique({ where: { id } })
	}
	//  admin
	// Получение прав пользователя
	/* 
   Сравниваю роль user с ролями из  AuthorizationGuard
 1) получаю пользователя по id
 2) получаю роль по  индификатору roleId из newUser
 */

	async getUserPermissions(userId: number) {
		// получаю пользователя по id
		const user = await this.prismaService.newUser.findUnique({
			where: { id: userId },
		})

		if (!user) throw new BadRequestException()
		/// получаю роль по  индификатору roleId из newUser
		const role = await this.rolesService.getRoleById(user.roleId)
		//const role = await this.rolesService.getRoleById(user.id)
		return role.permissions
	}
}
