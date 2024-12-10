import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { NewUser } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common/decorators";


/* Когда клиент отправляет запрос с JWT в заголовке (например, Authorization: Bearer <token>), стратегия проверяет этот токен.
Если токен валиден, метод validate будет вызван с данными из токена (в частности, с id пользователя).
Метод validate найдет соответствующего пользователя в базе данных (через Prisma) и вернет объект пользователя, который будет доступен для других частей приложения (например, для авторизации или для работы с данными пользователя).
Таким образом, JwtStrategy помогает реализовать механизм аутентификации пользователей в NestJS с использованием JWT, извлекаемого из заголовков HTTP-запросов.
*/

// **********************************

/* ConfigService: Сервис, который помогает извлекать значения конфигураций из конфигурационных файлов или переменных окружения (например, JWT_SECRET).
PassportStrategy: Абстрактный класс, который позволяет создавать стратегии аутентификации с использованием Passport в NestJS.*/
@Injectable()
export class  JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ){
        super({
            // ExtractJwt помогает извлечь токен из запроса
            // Strategy — это базовая стратегия для работы с JWT.
            /* jwtFromRequest: Здесь используется метод ExtractJwt.fromAuthHeaderAsBearerToken(),
             который извлекает JWT из заголовка запроса в формате Authorization: Bearer <token>.*/
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            /* ignoreExpiration: Устанавливается в true, что означает, что истечение срока действия токена не будет автоматически проверяться. Обычно это делается, чтобы можно было самим проверять срок действия токена в другом месте приложения.*/
            ignoreExpiration:true,
            /* secretOrKey: В этом параметре указывается секретный ключ для подписи JWT. Он извлекается через configService.get('JWT_SECRET').*/
            secretOrKey: configService.get('JWT_SECRET')
            
        });
    };

    async validate({id}: Pick<NewUser,'id'>){
     return this.prisma.newUser.findUnique( {where:{id: +id}})
    }; 
    
   
}