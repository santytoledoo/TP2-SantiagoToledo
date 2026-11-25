import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('usuarios')
@UseGuards(AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listarTodos() {
    return this.usuariosService.listarTodos();
  }

  @Post()
  crearUsuario(@Body() body: any) {
    return this.usuariosService.crearUsuario(body);
  }

  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }

  @Post(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }

  @Post(':id')
  rehabilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }
}