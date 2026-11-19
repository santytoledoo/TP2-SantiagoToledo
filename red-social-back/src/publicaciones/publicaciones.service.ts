import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';
import { Comentario } from './schemas/comentario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  private async hidratarAutores(items: any[]) {
    const userModel = this.publicacionModel.db.models['Usuario'];
    const autorIds = [
      ...new Set(
        items
          .map((item: any) => (item.autorId ? item.autorId.toString() : ''))
          .filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
      ),
    ];

    const mapaUsuarios = new Map<string, any>();
    if (userModel && autorIds.length > 0) {
      const usuarios = await userModel
        .find({ _id: { $in: autorIds } })
        .select('nombre apellido username fotoPerfil')
        .lean()
        .exec();
      usuarios.forEach((u: any) => mapaUsuarios.set(u._id.toString(), u));
    }

    return items.map((item: any) => {
      const plain = typeof item.toObject === 'function' ? item.toObject() : { ...item };
      const u = plain.autorId ? mapaUsuarios.get(plain.autorId.toString()) : null;
      if (u) {
        plain.autor = `${u.nombre} ${u.apellido}`.trim();
        plain.autorUsername = u.username;
        plain.autorFoto = u.fotoPerfil || '';
      }
      return plain;
    });
  }

  async crear(dto: any) {
    const nuevaPublicacion = new this.publicacionModel(dto);
    return await nuevaPublicacion.save();
  }

  async obtenerTodas(query: { page?: string; limit?: string; orden?: string; autorId?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '5', 10));
    const skip = (page - 1) * limit;

    const filtro: any = {};
    if (query.autorId) {
      filtro.autorId = query.autorId;
    }

    const total = await this.publicacionModel.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit) || 1;

    let data: any[] = [];

    if (query.orden === 'likes') {
      const pipeline: any[] = [
        { $match: filtro },
        { $addFields: { cantidadLikes: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { cantidadLikes: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
      data = await this.publicacionModel.aggregate(pipeline).exec();
    } else {
      data = await this.publicacionModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    const dataActualizada = await this.hidratarAutores(data);

    return {
      data: dataActualizada,
      total,
      page,
      totalPages,
    };
  }

  async obtenerPorId(id: string) {
    const pub = await this.publicacionModel.findById(id).exec();
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    const [hidratada] = await this.hidratarAutores([pub]);
    return hidratada;
  }

  async toggleLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) return null;

    const index = pub.likes.indexOf(userId);
    if (index > -1) {
      pub.likes.splice(index, 1);
    } else {
      pub.likes.push(userId);
    }

    return await pub.save();
  }

  async eliminar(id: string) {
    await this.comentarioModel.deleteMany({ publicacionId: id });
    return await this.publicacionModel.findByIdAndDelete(id);
  }

  async obtenerComentarios(publicacionId: string, query: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '5', 10));
    const skip = (page - 1) * limit;

    const filtro = { publicacionId };
    const total = await this.comentarioModel.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit) || 1;

    const comentarios = await this.comentarioModel
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const data = await this.hidratarAutores(comentarios);

    return {
      data,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async crearComentario(publicacionId: string, dto: any) {
    const nuevoComentario = new this.comentarioModel({
      publicacionId,
      mensaje: dto.mensaje,
      autorId: dto.autorId,
      autor: dto.autor,
      autorUsername: dto.autorUsername || '',
      autorFoto: dto.autorFoto || '',
      modificado: false,
    });

    const guardado = await nuevoComentario.save();
    const [hidratado] = await this.hidratarAutores([guardado]);
    return hidratado;
  }

  async editarComentario(comentarioId: string, dto: any) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    if (dto.autorId && comentario.autorId !== dto.autorId) {
      throw new ForbiddenException('Solo el autor puede editar este comentario.');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;

    const actualizado = await comentario.save();
    const [hidratado] = await this.hidratarAutores([actualizado]);
    return hidratado;
  }
}