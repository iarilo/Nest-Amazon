import { SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Permission as decorPermission } from "@prisma/client";
import { AuthorizationGuard } from "src/guards/authorization.guard";


// Отвечает за авторизацию, не авторизованный пользователь не сможет зайти
export const Auth = () => UseGuards(AuthGuard('jwt')) 


/* PERMISSIONS_KEY, Эта строка которая будет использоваться как уникальный ключ для хранения и извлечения метаданных */
export const  PERMISSIONS_KEY = 'permissionsKey'


/* AuthPermissions  принимает из  Prisma, массив model Permission и записывает его с помощью  функции  SetMetadata  в методанные */
// SetMetadata принимает ключ permissionsKey и значение permission где Permissions {resource: PrismaResource,	actions: PrismaActions[]

export const AuthPermissions = (permissions:decorPermission[]) => SetMetadata(PERMISSIONS_KEY,permissions)