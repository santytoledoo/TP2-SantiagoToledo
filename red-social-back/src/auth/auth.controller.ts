import { Controller, Post, Get, Put, Body, Param, Headers } from '@nestjs/common';
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

  @Post('autorizar')
  async autorizar(@Headers('authorization') authHeader?: string, @Body() body?: any) {
    const rawToken = authHeader || body?.token || body?.access_token;
    return this.authService.autorizar(rawToken);
  }

  @Post('refrescar')
  async refrescar(@Headers('authorization') authHeader?: string, @Body() body?: any) {
    const rawToken = authHeader || body?.token || body?.access_token;
    return this.authService.refrescar(rawToken);
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