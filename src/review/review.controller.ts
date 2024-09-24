import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from './review_dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';


// @Controller('review')
// export class ReviewController {}


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UsePipes(new ValidationPipe())
  @Get()
  async AllReview() {
    return this.reviewService.allReview();
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post('leave/:productId')
  async CreateReview(
    @CurrentUser('id') id: number,
    @Body() dto: ReviewDto,
    @Param() paramId: string,
  ) {
     const idNumber = Object.values(paramId)
     return this.reviewService.createReview(id, dto, +idNumber);
  }

  @Get('avarege-by-product/:productId')
  async getAvaregeByProduct(@Param('productId') productId: string) {
    return this.reviewService.getAverageValueByProductId(+productId);
  }

}


