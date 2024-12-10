import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateRoleDto } from './dto'
import {Permission} from "@prisma/client"

@Injectable()
export class RolesService {
	constructor(private readonly prismaServer: PrismaService) {}

	async createRole(roleDto: CreateRoleDto) {
		const { name, permissions } = roleDto

		console.log('permissions - RolesService =', permissions)

		const createdRole = await this.prismaServer.role.create({
			data: {
				name: name,
				permissions: {
					create: permissions.map((ell:Permission) => ({
						resource: ell.resource, //При необходимости используйте перечисление Prisma напрямую
						actions: {
              // set: набор
							set: ell.actions, // Передать действия как массив
						},
					})),
				},
			},
			select: {
				id:true,
				name: true,
				permissions: true,
				//newuser :true
			},
		})

		//console.log('createdRole =', createdRole)
		return createdRole
	}


	async allRole (){
	return await this.prismaServer.role.findMany({
		select:{
			id:true,
			name:true,
			permissions:true
		}
	})	
	}


  async getRoleById(id: number){
    const roleId = await this.prismaServer.role.findUnique({
      where:{id:id},
	  select:{
		id:true,
		name:true,
		permissions:true
	}
    })
    return roleId
  }

  async deleteRole(id: number) {
  return await this.prismaServer.role.delete({
	where:{id}
  })
  }



}
