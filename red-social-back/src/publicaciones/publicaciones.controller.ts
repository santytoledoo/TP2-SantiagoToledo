import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  crear(@Body() body: any) {
    return this.publicacionesService.crear(body);
  }

  @Get()
  obtenerTodas(@Query() query: any) {
    return this.publicacionesService.obtenerTodas(query);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.publicacionesService.toggleLike(id, body.userId);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.publicacionesService.eliminar(id);
  }
}