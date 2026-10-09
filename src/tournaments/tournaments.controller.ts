import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/dto/register.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  async findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN)
  async create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Post(':id/generate-fixture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN)
  async generateFixture(
    @Param('id') id: string,
    @Body('club_ids') clubIds: string[],
    @Body('start_date') startDate?: string,
  ) {
    return this.tournamentsService.generateRoundRobinFixture(
      id,
      clubIds,
      startDate ? new Date(startDate) : new Date(),
    );
  }
}
