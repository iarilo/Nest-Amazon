import { Controller, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  @Auth()
  getAll(@CurrentUser('id') userId: number) {
    return this.orderService.orderAll(userId);
  }
}
