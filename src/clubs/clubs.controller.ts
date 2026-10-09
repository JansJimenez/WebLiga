import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/dto/register.dto';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  async findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN)
  async create(@Body() body: any) {
    return this.clubsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.DELEGADO)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.clubsService.update(id, body);
  }
}
