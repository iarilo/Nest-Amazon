import { CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import  {AuthGuard} from "@nestjs/passport"


/* !!!!!  Настройка авторизации с проверкой token автоматически через 
     AuthGuard   библиотеки  "@nestjs/passport"  !!!! */
@Injectable()
 export class AuthPassword extends AuthGuard('jwt') implements CanActivate {
    constructor(private jwtService: JwtService){
        super()
    }
    async canActivate(context: ExecutionContext):  Promise<boolean>  {
        console.log('AuthPassword')
        const canActivate = await super.canActivate(context)
        if(canActivate){
            const request = context.switchToHttp().getRequest()
            //console.log('request.user - AuthPassword =',request.user)
            return request.user
        } 
        return true
    }

 }