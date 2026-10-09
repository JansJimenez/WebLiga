import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/dto/register.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async findAll(@Query('club_id') clubId?: string) {
    return this.playersService.findAll(clubId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Get(':id/digital-card')
  async getDigitalCard(@Param('id') id: string) {
    return this.playersService.generateDigitalCard(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.DELEGADO)
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }
}
