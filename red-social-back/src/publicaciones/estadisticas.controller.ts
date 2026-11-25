import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';
import { Comentario } from './schemas/comentario.schema';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  private construirFiltroFecha(desde?: string, hasta?: string) {
    const rango: any = {};
    if (desde) {
      rango.$gte = new Date(`${desde}T00:00:00.000Z`);
    }
    if (hasta) {
      rango.$lte = new Date(`${hasta}T23:59:59.999Z`);
    }
    return Object.keys(rango).length > 0 ? { createdAt: rango } : {};
  }

  // 1. Cantidad de publicaciones realizadas por cada usuario en un lapso de tiempo
  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filtroFecha = this.construirFiltroFecha(desde, hasta);

    const agrupado = await this.publicacionModel
      .aggregate([
        { $match: { activo: { $ne: false }, ...filtroFecha } },
        {
          $group: {
            _id: { $ifNull: ['$autorId', '$autor'] },
            autorFallback: { $first: '$autor' },
            usernameFallback: { $first: '$autorUsername' },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { cantidad: -1 } },
      ])
      .exec();

    const userModel = this.publicacionModel.db.models['Usuario'];
    const idsValidos = agrupado
      .map((item) => String(item._id || ''))
      .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

    const mapaUsuarios = new Map<string, any>();
    if (userModel && idsValidos.length > 0) {
      const usuarios = await userModel
        .find({ _id: { $in: idsValidos } })
        .select('nombre apellido username')
        .lean()
        .exec();
      usuarios.forEach((u: any) => mapaUsuarios.set(u._id.toString(), u));
    }

    const detalle = agrupado.map((item) => {
      const u = mapaUsuarios.get(String(item._id));
      const nombre = u
        ? `${u.nombre} ${u.apellido}`.trim()
        : item.autorFallback || 'Usuario';
      const username = u?.username || item.usernameFallback || '';
      return {
        usuario: username ? `${nombre} (@${username})` : nombre,
        cantidad: item.cantidad,
      };
    });

    return {
      labels: detalle.map((d) => d.usuario),
      data: detalle.map((d) => d.cantidad),
      detalle,
    };
  }

  // 2. Cantidad de comentarios realizados en un lapso de tiempo
  @Get('comentarios-por-tiempo')
  async comentariosPorTiempo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filtroFecha = this.construirFiltroFecha(desde, hasta);

    const agrupado = await this.comentarioModel
      .aggregate([
        { $match: { activo: { $ne: false }, ...filtroFecha } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    const total = agrupado.reduce((acc, cur) => acc + cur.cantidad, 0);

    return {
      labels: agrupado.map((item) => item._id),
      data: agrupado.map((item) => item.cantidad),
      total,
    };
  }

  // 3. Cantidad de comentarios en cada publicación en un lapso de tiempo
  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filtroFecha = this.construirFiltroFecha(desde, hasta);

    const agrupado = await this.comentarioModel
      .aggregate([
        { $match: { activo: { $ne: false }, ...filtroFecha } },
        {
          $group: {
            _id: '$publicacionId',
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { cantidad: -1 } },
        { $limit: 10 },
      ])
      .exec();

    const idsValidos = agrupado
      .map((item) => String(item._id || ''))
      .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

    const pubs =
      idsValidos.length > 0
        ? await this.publicacionModel
            .find({ _id: { $in: idsValidos } })
            .select('titulo contenido')
            .lean()
            .exec()
        : [];

    const mapaPubs = new Map<string, any>();
    pubs.forEach((p: any) => mapaPubs.set(p._id.toString(), p));

    const detalle = agrupado.map((item) => {
      const pub = mapaPubs.get(String(item._id));
      const textoBase = pub?.titulo || pub?.contenido || `Publicación ${String(item._id).slice(-5)}`;
      const etiqueta = textoBase.length > 28 ? `${textoBase.slice(0, 28)}...` : textoBase;
      return {
        publicacionId: item._id,
        titulo: etiqueta,
        cantidad: item.cantidad,
      };
    });

    return {
      labels: detalle.map((d) => d.titulo),
      data: detalle.map((d) => d.cantidad),
      detalle,
    };
  }
}