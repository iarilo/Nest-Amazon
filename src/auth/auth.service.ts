import { BadRequestException, Delete, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registrUser(dto: AuthDto) {
    const oldUser = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (oldUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const newUser = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        avatarPath: dto.avatarPath,
        phone: dto.phone,
        password: await hash(dto.password),
      },
    });

    const token = await this.issueTokens(newUser.id);

    return { ...token, user: this.returnUserFilds(newUser) };
  }
  //Получаю token
  private async issueTokens(userId: number) {
    const data = { id: userId };
    const accesToken = this.jwt.sign(data, { expiresIn: '1h' });
    const refreshToken = this.jwt.sign(data, { expiresIn: '30d' });
    // return [accesToken, refreshToken];
    return [{ accesToken: accesToken }, { refreshToken: refreshToken }];
  }
  // Вывожу  только необходимые поля
  private returnUserFilds(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }

  //Показать всех пользователей
  async allUser() {
    return this.prismaService.user.findMany();
  }

  // Удалить
  async deleteUser(id: number) {
    return this.prismaService.user.delete({ where: { id } });
  }

  // Обновление
  async updateUser(id: number, dto: AuthDto) {
    return this.prismaService.user.update({
      where: { id },
      data: dto,
    });
  }

  //Поиск по id
  async findOne(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }
}
