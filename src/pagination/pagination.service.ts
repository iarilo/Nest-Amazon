import { Injectable } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';

@Injectable()
export class PaginationService {

    getPagination(dto: PaginationDto, defaultPerPage = 30){
     const page = dto.page ? +dto.page : 1; // Преобразую строку в число, а если нет то указываю 1 
     const perPage = dto.perPage ? +dto.perPage : defaultPerPage; // Преобразую строку в число, а если нет то указываю дефолтное
     const skip = (page - 1) * perPage // Сколько элементов надо пройти что-бы вывести на нужный элемент
     return {perPage, skip}
    };

};
