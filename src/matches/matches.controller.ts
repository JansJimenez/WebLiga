import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AddGoalDto } from './dto/add-goal.dto';
import { AddCardDto } from './dto/add-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/dto/register.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post(':id/validate-lineup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.DELEGADO, UserRoleEnum.ARBITRO)
  async validateLineup(
    @Param('id') id: string,
    @Body('player_ids') playerIds: string[],
  ) {
    return this.matchesService.validateLineup(id, playerIds);
  }

  @Post(':id/goals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ARBITRO)
  async addGoal(@Param('id') id: string, @Body() addGoalDto: AddGoalDto) {
    return this.matchesService.addGoal(id, addGoalDto);
  }

  @Post(':id/cards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ARBITRO)
  async addCard(@Param('id') id: string, @Body() addCardDto: AddCardDto) {
    return this.matchesService.addCard(id, addCardDto);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ARBITRO)
  async closeMatch(@Param('id') id: string) {
    return this.matchesService.closeMatch(id);
  }
}
