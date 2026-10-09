import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('tournament/:id/standings')
  async getStandings(@Param('id') tournamentId: string) {
    return this.statsService.getStandings(tournamentId);
  }

  @Get('tournament/:id/top-scorers')
  async getTopScorers(@Param('id') tournamentId: string) {
    return this.statsService.getTopScorers(tournamentId);
  }
}
