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


@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwt: JwtService,
	) {}
	// -------------------------------------------------------
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

	// Показываю нужные поля и токены
	async Resultat(id: number, user: NewUser) {
		const token = await this.issueTokens(id)
		 return {...token, userI: this.returnUserFilds(user) }
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
		// const accesToken = this.jwt.sign(data, { expiresIn: '1h' })
		const accesToken = this.jwt.sign(data, { expiresIn: 300 })
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
		return this.prismaService.newUser.findMany()
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
}
