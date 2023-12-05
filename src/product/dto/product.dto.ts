import { Prisma } from "@prisma/client";
import { ArrayMinSize, IsNumber, IsOptional, IsString } from "class-validator";

export class ProductDto implements Prisma.ProductUpdateInput {
  @IsString()  
  name: string;

  @IsOptional()
  @IsString()
  descrition: string;

  @IsNumber()
  prise: number  

  @IsString({each: true}) // Каждый элемент в нутри массива
  @ArrayMinSize(1)        // Минимальное количество
  images: string[]

  @IsNumber()
  categoryId: number
}