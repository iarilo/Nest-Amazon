import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorators';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {};

  @Auth()
  @Get('main')
  async GetMain(@CurrentUser('id') id: number){
  return this.statisticsService.getMain(id)
  };
};
