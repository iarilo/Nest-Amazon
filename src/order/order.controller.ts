import { Body, Controller, Delete, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { OrderDto } from './order.dto';
import { PaymentStatusDto } from './payment-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get('all')
  @Auth()
  getAll(@CurrentUser('id') userId: number) {
    return this.orderService.orderAll(userId);
  }


  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('create')
  @Auth()
   placeOrder( 
    @Body() dto:OrderDto,
    @CurrentUser('id') userId: number
  ){
  return this.orderService.placeOrder(dto,userId)
  }

  @Delete(':id')
  @Auth()
  deleteOrder ( @Param('id') id: string){
   return this.orderService.deleteOrder(+id)
  }

  @HttpCode(200)
  @Post('status')
  async updateStatus (@Body() orderId:string){
   return this.orderService.updateStatus(orderId)
  }

}
