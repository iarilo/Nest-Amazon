import { Body, Controller, Get, HttpCode, Param, Patch, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { UserDto, UserTokenDto } from './dto/user.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {};

  @UseGuards(AuthenticationGuard,AuthorizationGuard )
@Get('profile')
//@Auth()
// async getProfile(@CurrentUser('id') id: number){
async getProfile(@Req() req:UserTokenDto){
  const {id} = req.userToken
  return this.userService.byId(id)
}

// Обновление профиля (Обновляю весь профиль)
@UsePipes(new ValidationPipe())
@HttpCode(200)
@Auth()
@Put('profile')
async getNewTokens(@CurrentUser('id') id: number, @Body() dto: UserDto){
  return this.userService.updateProfile(id, dto)
}

// Получение и удаление из избранного (Обновляю только поле favorits)
@HttpCode(200)
@Auth()
@Patch('profile/favorites/:productId')
async toggleFavorite( 
  @CurrentUser('id') id: number,
  @Param('productId') productId:string 
  ){
    
return this.userService.toggleFavorite(id, +productId)
};


@Get('product')
@Auth()
async productUser(@CurrentUser('id') id: number){
  return this.userService.userProduct(id)
}

@UseGuards(AuthenticationGuard,AuthorizationGuard )
@Get('userTest')
async reqUserTest(@Req() req){
  return this.userService.userTest(req)
  //console.log('reqUserTest - req =',req)
}


}



