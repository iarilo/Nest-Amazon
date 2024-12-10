import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto';
import { hash } from 'argon2';


@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  async createRole(@Body() roleDto: CreateRoleDto){
   return this.rolesService.createRole(roleDto)
   }

   @Get('all')
   async getAllRole(){
    return this.rolesService.allRole()
   }
  
   @Get(":id")
     async getByRoleId(@Param("id") id:string){
     return await this.rolesService.getRoleById(+id)
   }  


   @Delete(':id')
   async deleteRole(@Param('id' ) id:string ){
   return await this.rolesService.deleteRole(+id)
   }



}
