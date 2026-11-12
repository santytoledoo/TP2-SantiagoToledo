import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';

@Controller('publicaciones')
export class PublicacionesController {
  
  @Post()
  crearPublicacion(@Body() body: any) {
    // Título, mensaje, imagen (Sprint 2)
    return { status: 201, message: 'Publicación creada' };
  }

  @Get()
  obtenerPublicaciones(@Query('limit') limit: number, @Query('offset') offset: number, @Query('orden') orden: string) {
    // Listado paginado y ordenado por fecha o me gusta (Sprint 2)
    return [];
  }

  @Post(':id/like')
  darMeGusta(@Param('id') id: string) {
    return { message: 'Me gusta agregado' };
  }

  @Delete(':id/like')
  quitarMeGusta(@Param('id') id: string) {
    return { message: 'Me gusta quitado' };
  }

  @Delete(':id')
  eliminarPublicacion(@Param('id') id: string) {
    // Baja lógica (Sprint 2)
    return { message: 'Publicación eliminada lógicamente' };
  }
}
