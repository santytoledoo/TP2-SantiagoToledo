import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  crear(@Body() body: any) {
    return this.publicacionesService.crear(body);
  }

  @Get()
  obtenerTodas(@Query() query: any) {
    return this.publicacionesService.obtenerTodas(query);
  }

  @Get(':id/comentarios')
  obtenerComentarios(@Param('id') id: string, @Query() query: any) {
    return this.publicacionesService.obtenerComentarios(id, query);
  }

  @Post(':id/comentarios')
  crearComentario(@Param('id') id: string, @Body() body: any) {
    return this.publicacionesService.crearComentario(id, body);
  }

  @Put(':id/comentarios/:comentarioId')
  editarComentarioEnPublicacion(
    @Param('comentarioId') comentarioId: string,
    @Body() body: any,
  ) {
    return this.publicacionesService.editarComentario(comentarioId, body);
  }

  @Put('comentarios/:comentarioId')
  editarComentario(@Param('comentarioId') comentarioId: string, @Body() body: any) {
    return this.publicacionesService.editarComentario(comentarioId, body);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Body('userId') userId: string) {
    return this.publicacionesService.toggleLike(id, userId);
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let usuarioToken: { sub?: string; rol?: string } | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        usuarioToken = this.jwtService.verify(authHeader.slice(7).trim());
      } catch {
        usuarioToken = undefined;
      }
    }
    return this.publicacionesService.eliminar(id, usuarioToken);
  }
}