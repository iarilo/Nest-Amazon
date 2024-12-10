import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { AuthService } from 'src/auth/auth.service'

// https://www.youtube.com/watch?v=w_ASqSZKhMQ
// !!!!!  Настройка авторизации в ручную  !!!!

@Injectable()
// CanActivate  это интерфейс с встроенным методом  canActivate
export class AuthenticationGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private authService: AuthService,
	) {}

	// extractTokenFromHeader получает token из headers.authorization
	private extractTokenFromHeader(request: Request): string | undefined {
		return request.headers.authorization?.split(' ')[1]
	}

	// canActivate метод содержащий в себе функцию context
	async canActivate(
		/* context: массив функций и методов которые  предоставляет доступ к сведениям о текущем  запросе .*/
		context: ExecutionContext,
	): Promise<boolean> {
		/* request: массив методов и функций , а также содержит token  в  authorization  и cookie в hedars, которые получаю методом  getRequest()*/
		const request = context.switchToHttp().getRequest()
		const token = this.extractTokenFromHeader(request)

		//  console.log('guard =',guard)
		//console.log('request -AuthenticationGuard  =',request)

		//console.log('AuthenticationGuard')

		if (!token) {
			throw new UnauthorizedException('token не найден в AuthenticationGuard ')
		}

		try {
			const payload = this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET,
			})

			const data = await this.authService.addPrismaRole(payload.id)
			request.userToken = data
			//console.log('Data = ',data)
		} catch (e) {
			Logger.error(e.message)
			throw new UnauthorizedException(
				'Неверный Token после проверки token в AuthenticationGuard',
			)
		}
		/* return:  Значение, указывающее, разрешено ли текущему запросу
       продолжиться*/

		return true
	}
}
