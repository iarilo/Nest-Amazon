import { IsString } from "class-validator";

export class AuthRefrehTokenDto{
    @IsString()
    refreshToken: string
};