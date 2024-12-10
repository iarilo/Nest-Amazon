import { IsNumber, IsString,MinLength } from "class-validator"
import { RequestUserDto } from "src/user/dto/user.dto"

export class AuthDto {
  @IsString()      
   name:       string  
  @IsString()      
  email:      string
  @IsString()       
  avatarPath: string
  @IsString()   
  phone:      string
  @MinLength(6,{message:'длина пароля не меньше 6 символов'})
  @IsString()         
  password:   string

 

}