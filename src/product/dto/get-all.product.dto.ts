import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/pagination/pagination.dto";

// 1) Сортировка по  enum EnumProductSort
// 2) Поиск по ключевому слову 
// 3) Пагинация


// Отвечает за сортировку
export enum EnumProductSort{
    HIGH_PRICE = "high-price",  // Сортировка по высокой цене
    LOW_PRICE  = "low-price",  //  Сортировка по низкой цене 
    NEWEST  = "newest",        //  Сортировка по новой цене 
    OLDEST = "oldest"          // Сортировка по старой цене 
};

export class GetAllProductDto extends PaginationDto {

@IsOptional() 
@IsEnum(EnumProductSort)    
sort?: EnumProductSort; // Сортировка

@IsOptional()
@IsString()
searchTerm?: string // Поиск по ключевому слову

};