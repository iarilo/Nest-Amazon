import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthRefrehTokenDto } from './dto/auth.refreshToken.dto';
import { NewUser } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('registr')
  async RegistrUser(@Body() dto: AuthDto) {
    return this.authService.registrUser(dto);
  };

  // Логин
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async Login(@Body() dto: NewUser){
    return this.authService.login(dto)
  }

  // acssesToken
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/access-tocen')
  async GetNewToken(@Body() dto:AuthRefrehTokenDto) {
    return this.authService.getNewToken(dto)
  }


  //Показать всех пользователе
  // @Get('all')
  // async AllUser() {
  //   return this.authService.allUser();
  // }

  // Удалить
  @Delete(':id')
  async DeleteUssr(@Param('id') id: string) {
    return this.authService.deleteUser(+id);
  }

  // Обновление
  @Patch(':id')
  async Update(@Param('id') id: string, @Body() dto: AuthDto) {
    return this.authService.updateUser(+id, dto);
  };

  //Поиск по id
  @Get(':id')
  async FindOne(@Param('id') id: string){
  return this.authService.findOne(+id)
  }

  

}
