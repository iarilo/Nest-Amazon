import { IsOptional, IsString, MinLength } from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  avatarPath: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @MinLength(6, { message: 'длина пароля не меньше 6 символов' })
  @IsString()
  password: string;
}
