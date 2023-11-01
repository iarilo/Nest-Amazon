import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { NewUser } from "@prisma/client";


// Получает текущие данные, текущего пользователя 
// newUser  из  PrismaService и  стратегии 
export const CurrentUser = createParamDecorator(
    (data: keyof NewUser, ctx: ExecutionContext) => {
     const request = ctx.switchToHttp().getRequest();
     const user = request.newUser;
     console.log('Data-CurrentUser: ', data)
     return data ? user[data] : user;   
    })