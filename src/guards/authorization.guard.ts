import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthService } from 'src/auth/auth.service'
import { PERMISSIONS_KEY } from 'src/auth/decorators/auth.decorators'
import { Permission } from '@prisma/client'

// AuthorizationGuard  сравнивает права доступа пользователя с правами доступа указаными в  маршруте  ProductController  декоратора  AuthPermissions
@Injectable()
export class AuthorizationGuard {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		//console.log('AuthorizationGuard')
		const request = context.switchToHttp().getRequest()

		//   console.log('request.userToken',request.user);
		//  console.log('request - userToken = ',request)


		 if (!request.userToken.id) {
			//if (!request.user.id) {
			throw new UnauthorizedException('User Id не найден в AuthorizationGuard')
		}

		// console.log('request.userToken',request.userToken);


/* Метод getAllAndOverride — это особенность Reflector, которая позволяет искать метаданные с конкретным ключом (в вашем случае PERMISSIONS_KEY) и возвращает все метаданные, связанные с этим ключом.

getAllAndOverride работает с массивами метаданных и пытается получить информацию сначала с уровня метода (метаданные, заданные непосредственно на обработчике), а затем с уровня класса (метаданные, заданные на классе контроллера).*/
		const routePermissions: Permission[] = this.reflector.getAllAndOverride(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		)
		//console.log('routePermissions',routePermissions);

		if (!routePermissions) {
			return true
		}

		try {
			const userPermissions = await this.authService.getUserPermissions(
				 request.userToken.id,
				//request.user.id,
			)
			//console.log('userPermissions',userPermissions);

			for (const route of routePermissions) {
				const userPermission = userPermissions.find(
					perm => perm.resource === route.resource,
				)

				if (!userPermission) throw new ForbiddenException()

				const allActionsAvailable = route.actions.every(requiredAction =>
					userPermission.actions.includes(requiredAction),
				)
				if (!allActionsAvailable) throw new ForbiddenException()
			}
		} catch (e) {
			throw new ForbiddenException()
		}
		return true
	}
}

// =============================================
/*
  @Injectable()
  export class AuthorizationGuard implements CanActivate {
    constructor(
      private reflector: Reflector, 
      private authService: AuthService ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
  
      const request = context.switchToHttp().getRequest();
  
      if (!request.userId) {
        throw new UnauthorizedException('User Id не найден в AuthorizationGuard');
      }
  
      const routePermissions: Permission[] = this.reflector.getAllAndOverride(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
      console.log(` разрешения маршрута ${routePermissions}`);
  
      if (!routePermissions) {
          return true;
      }
  
      try {
        const userPermissions = await this.authService.getUserPermissions(
          request.userId,
        );
  
        for (const routePermission of routePermissions) {
          const userPermission = userPermissions.find(
            (perm) => perm.resource === routePermission.resource,
          );
  
          if (!userPermission) throw new ForbiddenException();
  
          const allActionsAvailable = routePermission.actions.every(
            (requiredAction) => userPermission.actions.includes(requiredAction),
          );
          if (!allActionsAvailable) throw new ForbiddenException();
        }
      } catch (e) {
        throw new ForbiddenException();
      }
      return true;
    }
  }

  */
