import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registro')
  async registrar(@Body() body: any) {
    return this.authService.registrar(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Get('perfil/:id')
  async obtenerPerfil(@Param('id') id: string) {
    return this.authService.obtenerPerfil(id);
  }

  @Put('perfil/:id')
  async actualizarPerfil(@Param('id') id: string, @Body() body: any) {
    return this.authService.actualizarPerfil(id, body);
  }
}