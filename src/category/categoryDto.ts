import { IsNumber, IsString } from "class-validator";

export class CategoryDto {
    @IsString()
    name: string
    @IsNumber()
    order?: number; // поле для порядка, не обязательно
}