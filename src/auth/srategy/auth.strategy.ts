import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { NewUser } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common/decorators";

@Injectable()
export class  JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:true,
            secretOrKey: configService.get('JWT_SECRET')
            
        });
    };

    async validate({id}: Pick<NewUser,'id'>){
     return this.prisma.newUser.findUnique( {where:{id: +id}})
    }; 
    
   
}