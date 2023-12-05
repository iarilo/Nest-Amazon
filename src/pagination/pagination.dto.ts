import { IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  page?: string;// текущая страница

  @IsString()
  @IsOptional()
  perPage?: string; // Сколько элементов на странице страницу
}

// export class OrderByWithPagination extends PaginationDto {
//   @IsString()
//   @IsOptional()
//   orderBy?: 'desc' | 'asc';
// }
