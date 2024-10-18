import { Injectable } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';

@Injectable()
export class PaginationService {

    getPagination(dto: PaginationDto, defaultPerPage = 30){
      // page:текущая страница   
     const page = dto.page ? +dto.page : 1; // Преобразую строку в число, а если нет то указываю 1 
     // perPage: сколько элементов выводить на странице
     const perPage = dto.perPage ? +dto.perPage : defaultPerPage; // Преобразую строку в число, а если нет то указываю дефолтное
     // skip: номер кнопки
     const skip = (page - 1) * perPage // Сколько элементов надо пройти что-бы вывести на нужный элемент
    
     return {perPage, skip}
    };

};
