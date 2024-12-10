import { Type } from 'class-transformer'
import {
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
	MinLength,
	ValidateNested,
} from 'class-validator'
import { CreateRoleDto, Permissions } from 'src/roles/dto'

export class UserDto {
	@IsOptional()
	@IsString()
	name: string

	@IsString()
	email: string

	@IsOptional()
	@IsString()
	avatarPath: string

	@IsOptional()
	@IsString()
	phone: string

	@IsOptional()
	@MinLength(6, { message: 'длина пароля не меньше 6 символов' })
	@IsString()
	password: string
}

export class RequestUserDto {
	@IsNumber()
	id: number

	@IsOptional()
	@IsString({ each: true })
	name: string

	@IsEmail()
	email: string

	@IsOptional()
	@IsString()
	avatarPath: string

	@IsOptional()
	@IsString()
	phone: string

	@IsString({ each: true })
	password: string

	@IsNumber()
	roleId: number

	@ValidateNested()
	@Type(() => Permissions)
	role: CreateRoleDto[]
}

export class UserTokenDto {
	@ValidateNested()
	@Type(() => RequestUserDto)
	userToken: RequestUserDto
}

export class SortUserRoleDto {
	@IsNumber()
	id: number

	@IsString()
	name: string

	@IsNumber()
	roleId: number

	@ValidateNested()
	@Type(() => Permissions)
	role: CreateRoleDto
}
