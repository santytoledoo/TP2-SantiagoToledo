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
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly jwtService: JwtService,
  ) {}

  private extraerUsuarioToken(authHeader?: string): { sub: string; rol?: string } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido.');
    }
    const token = authHeader.slice(7).trim();
    try {
      const payload: any = this.jwtService.verify(token);
      if (!payload?.sub) {
        throw new UnauthorizedException('Token inválido.');
      }
      return { sub: String(payload.sub), rol: payload.rol };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }
  }

  private extraerUsuarioTokenOpcional(authHeader?: string): { sub?: string; rol?: string } | undefined {
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    try {
      return this.jwtService.verify(authHeader.slice(7).trim());
    } catch {
      return undefined;
    }
  }

  @Post()
  crear(@Body() body: any) {
    return this.publicacionesService.crear(body);
  }

  @Get()
  obtenerTodas(
    @Query() query: any,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioToken = this.extraerUsuarioTokenOpcional(authHeader);
    return this.publicacionesService.obtenerTodas(query, usuarioToken?.sub);
  }

  @Get('compartidas')
  listarCompartidasConmigo(@Headers('authorization') authHeader?: string) {
    const usuarioToken = this.extraerUsuarioToken(authHeader);
    return this.publicacionesService.listarCompartidasConmigo(usuarioToken.sub);
  }

  @Get('destinatarios-compartir')
  listarDestinatariosCompartir(@Headers('authorization') authHeader?: string) {
    const usuarioToken = this.extraerUsuarioToken(authHeader);
    return this.publicacionesService.listarDestinatariosCompartir(usuarioToken.sub);
  }

  @Post(':id/guardar')
  guardarPublicacion(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioToken = this.extraerUsuarioToken(authHeader);
    return this.publicacionesService.guardarPublicacion(id, usuarioToken.sub);
  }

  @Post(':id/quitar-guardado')
  quitarGuardadoPublicacion(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioToken = this.extraerUsuarioToken(authHeader);
    return this.publicacionesService.quitarGuardadoPublicacion(id, usuarioToken.sub);
  }

  @Post(':id/compartir')
  compartirPublicacion(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioToken = this.extraerUsuarioToken(authHeader);
    const destinoId = body?.destinatarioId || body?.usuarioId || body?.paraUsuarioId;
    return this.publicacionesService.compartirPublicacion(id, usuarioToken.sub, destinoId);
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
  obtenerPorId(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioToken = this.extraerUsuarioTokenOpcional(authHeader);
    return this.publicacionesService.obtenerPorId(id, usuarioToken?.sub);
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
    const usuarioToken = this.extraerUsuarioTokenOpcional(authHeader);
    return this.publicacionesService.eliminar(id, usuarioToken);
  }
}