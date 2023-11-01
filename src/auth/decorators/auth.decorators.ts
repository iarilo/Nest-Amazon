import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Отвечает за авторизацию, не авторизованный пользователь не сможет зайти
export const Auth = () => UseGuards(AuthGuard('jwt')) 