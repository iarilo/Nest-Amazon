import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/auth.config';
import { JwtStrategy } from './srategy/auth.strategy';
import { RolesModule } from 'src/roles/roles.module';
import { RolesService } from 'src/roles/roles.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthPassword } from 'src/guards/authPassword.guards';


@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    AuthenticationGuard,
    AuthorizationGuard,
    AuthPassword

    ],
    imports:[
      ConfigModule,
      JwtModule.registerAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory: getJwtConfig,// шифрует для  acsses token  ключ из .env
        
      }),
      RolesModule 
    ],
    exports:[AuthService,JwtModule]
  
})
export class AuthModule {}
