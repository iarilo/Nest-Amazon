
import { ArrayUnique, IsEnum, IsNumber, IsString, ValidateNested,IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { Resource as PrismaResource, Actions as PrismaActions } from '@prisma/client';


export class CreateRoleDto  {
    @IsNumber()
	id:number 

	// @IsNotEmpty()  поле не может быть пустым
	@IsNotEmpty()
	@IsString({ each: true })
	name: string

    // @ValidateNested()  проверяет  вложенный DTO внутри основного класса DTO
	@ValidateNested()
	@Type(() => Permissions)
	permissions: Permissions[]
}

export class Permissions  {
	@IsEnum(PrismaResource)
	resource: PrismaResource

	@IsEnum(PrismaActions, { each: true })
	// ArrayUnique Запрещает дважды использовать одно и тоже действие
	@ArrayUnique()
	actions: PrismaActions[]
}
