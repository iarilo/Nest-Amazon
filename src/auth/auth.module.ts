import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/auth.config';
import { JwtStrategy } from './srategy/auth.strategy';


@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy
    ],
    imports:[
      ConfigModule,
      JwtModule.registerAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory: getJwtConfig
      }),
     
    ]
  
})
export class AuthModule {}
