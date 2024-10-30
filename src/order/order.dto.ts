import { EnumOrderStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'

export class OrderDto {
    @IsOptional()
	@IsEnum(EnumOrderStatus)
	status: EnumOrderStatus

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemsDto)
	items: OrderItemsDto[]
}

export class OrderItemsDto {
	@IsNumber()
	quantity: number

	@IsNumber()
	price: number

	@IsNumber()
	productId: number
}
