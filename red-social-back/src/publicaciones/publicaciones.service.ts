import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

  private enriquecerPublicacion(plain: any, usuarioId?: string) {
    const guardadosPor = Array.isArray(plain.guardadosPor) ? plain.guardadosPor : [];
    const compartidos = Array.isArray(plain.compartidos) ? plain.compartidos : [];
    return {
      ...plain,
      guardadosPor,
      compartidos,
      cantidadGuardados: guardadosPor.length,
      cantidadCompartidos: compartidos.length,
      guardadaPorMi: usuarioId ? guardadosPor.includes(String(usuarioId)) : false,
    };
  }

  private async hidratarAutores(items: any[], usuarioId?: string) {
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
      return this.enriquecerPublicacion(plain, usuarioId);
    });
  }

  async crear(dto: any) {
    const nuevaPublicacion = new this.publicacionModel({
      ...dto,
      guardadosPor: [],
      compartidos: [],
      activo: true,
    });
    return await nuevaPublicacion.save();
  }

  async obtenerTodas(
    query: { page?: string; limit?: string; orden?: string; autorId?: string; guardadosUsuarioId?: string },
    usuarioTokenId?: string,
  ) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '5', 10));
    const skip = (page - 1) * limit;

    const filtro: any = { activo: { $ne: false } };
    if (query.autorId) {
      filtro.autorId = query.autorId;
    }
    const uidGuardados = query.guardadosUsuarioId || usuarioTokenId;
    if (query.guardadosUsuarioId && uidGuardados) {
      filtro.guardadosPor = String(uidGuardados);
    }

    const total = await this.publicacionModel.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit) || 1;

    let data: any[] = [];

    if (query.orden === 'likes') {
      data = await this.publicacionModel
        .aggregate([
          { $match: filtro },
          { $addFields: { cantidadLikes: { $size: { $ifNull: ['$likes', []] } } } },
          { $sort: { cantidadLikes: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ])
        .exec();
    } else if (query.orden === 'guardados') {
      data = await this.publicacionModel
        .aggregate([
          { $match: filtro },
          { $addFields: { cantidadGuardados: { $size: { $ifNull: ['$guardadosPor', []] } } } },
          { $sort: { cantidadGuardados: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ])
        .exec();
    } else if (query.orden === 'compartidos') {
      data = await this.publicacionModel
        .aggregate([
          { $match: filtro },
          { $addFields: { cantidadCompartidos: { $size: { $ifNull: ['$compartidos', []] } } } },
          { $sort: { cantidadCompartidos: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ])
        .exec();
    } else {
      data = await this.publicacionModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    const dataActualizada = await this.hidratarAutores(data, usuarioTokenId);

    return {
      data: dataActualizada,
      total,
      page,
      totalPages,
    };
  }

  async obtenerPorId(id: string, usuarioTokenId?: string) {
    const pub = await this.publicacionModel
      .findOne({ _id: id, activo: { $ne: false } })
      .exec();
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada o dada de baja.');
    }
    const [hidratada] = await this.hidratarAutores([pub], usuarioTokenId);
    return hidratada;
  }

  async guardarPublicacion(id: string, usuarioId: string) {
    const pub = await this.publicacionModel.findOne({ _id: id, activo: { $ne: false } });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    const uid = String(usuarioId);
    if (!Array.isArray(pub.guardadosPor)) {
      pub.guardadosPor = [];
    }
    if (!pub.guardadosPor.includes(uid)) {
      pub.guardadosPor.push(uid);
      await pub.save();
    }
    const [hidratada] = await this.hidratarAutores([pub], uid);
    return {
      message: 'Publicación guardada.',
      guardada: true,
      publicacion: hidratada,
    };
  }

  async quitarGuardadoPublicacion(id: string, usuarioId: string) {
    const pub = await this.publicacionModel.findOne({ _id: id, activo: { $ne: false } });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }
    const uid = String(usuarioId);
    pub.guardadosPor = (pub.guardadosPor || []).filter((item) => String(item) !== uid);
    await pub.save();
    const [hidratada] = await this.hidratarAutores([pub], uid);
    return {
      message: 'Publicación quitada de guardados.',
      guardada: false,
      publicacion: hidratada,
    };
  }

  async listarDestinatariosCompartir(usuarioId: string) {
    const userModel = this.publicacionModel.db.models['Usuario'];
    if (!userModel) return [];

    const usuarios = await userModel
      .find({ activo: { $ne: false }, _id: { $ne: usuarioId } })
      .select('nombre apellido username fotoPerfil')
      .lean()
      .exec();

    return (usuarios as any[]).map((u) => ({
      id: String(u._id),
      nombre: u.nombre,
      apellido: u.apellido,
      username: u.username,
      fotoPerfil: u.fotoPerfil || '',
      nombreCompleto: `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.username,
    }));
  }

  async compartirPublicacion(id: string, emisorId: string, destinatarioId: string) {
    if (!destinatarioId) {
      throw new BadRequestException('Debés indicar el usuario destinatario.');
    }

    const pub = await this.publicacionModel.findOne({ _id: id, activo: { $ne: false } });
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const userModel = this.publicacionModel.db.models['Usuario'];
    const emisor: any = userModel ? await userModel.findById(emisorId).lean().exec() : null;
    const destinatario: any = userModel ? await userModel.findById(destinatarioId).lean().exec() : null;

    if (!destinatario || destinatario.activo === false) {
      throw new NotFoundException('El usuario destinatario no existe o está deshabilitado.');
    }

    const registro = {
      deUsuarioId: String(emisorId),
      deUsuarioNombre: emisor
        ? `${emisor.nombre || ''} ${emisor.apellido || ''}`.trim() || emisor.username
        : 'Usuario',
      deUsuarioUsername: emisor?.username || '',
      paraUsuarioId: String(destinatarioId),
      fecha: new Date(),
    };

    if (!Array.isArray(pub.compartidos)) {
      pub.compartidos = [];
    }
    pub.compartidos.push(registro);
    await pub.save();

    const [hidratada] = await this.hidratarAutores([pub], emisorId);
    return {
      message: `Publicación compartida con @${destinatario.username || destinatario.nombre}.`,
      publicacion: hidratada,
    };
  }

  async listarCompartidasConmigo(usuarioId: string) {
    const uid = String(usuarioId);
    const pubs = await this.publicacionModel
      .find({
        activo: { $ne: false },
        'compartidos.paraUsuarioId': uid,
      })
      .sort({ createdAt: -1 })
      .exec();

    const hidratadas = await this.hidratarAutores(pubs, uid);

    return hidratadas.map((pub: any) => {
      const compartidosParaMi = (pub.compartidos || []).filter(
        (c: any) => String(c.paraUsuarioId) === uid,
      );
      return {
        ...pub,
        compartidosConmigo: compartidosParaMi,
      };
    });
  }

  async toggleLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findOne({ _id: id, activo: { $ne: false } });
    if (!pub) return null;

    const index = pub.likes.indexOf(userId);
    if (index > -1) {
      pub.likes.splice(index, 1);
    } else {
      pub.likes.push(userId);
    }

    return await pub.save();
  }

  async eliminar(id: string, usuarioToken?: { sub?: string; rol?: string }) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    if (usuarioToken) {
      const esAdmin = usuarioToken.rol === 'administrador';
      const esAutor = pub.autorId === usuarioToken.sub;
      if (!esAdmin && !esAutor) {
        throw new ForbiddenException('No tenés permisos para dar de baja esta publicación.');
      }
    }

    await this.publicacionModel.findByIdAndUpdate(id, { $set: { activo: false } });
    await this.comentarioModel.updateMany(
      { publicacionId: id },
      { $set: { activo: false } },
    );

    return { message: 'Publicación y comentarios dados de baja correctamente.' };
  }

  async obtenerComentarios(publicacionId: string, query: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '5', 10));
    const skip = (page - 1) * limit;

    const filtro = { publicacionId, activo: { $ne: false } };
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
    const pub = await this.publicacionModel.findOne({
      _id: publicacionId,
      activo: { $ne: false },
    });
    if (!pub) {
      throw new NotFoundException('La publicación no existe o fue dada de baja.');
    }

    const nuevoComentario = new this.comentarioModel({
      publicacionId,
      mensaje: dto.mensaje,
      autorId: dto.autorId,
      autor: dto.autor,
      autorUsername: dto.autorUsername || '',
      autorFoto: dto.autorFoto || '',
      modificado: false,
      activo: true,
    });

    const guardado = await nuevoComentario.save();
    const [hidratado] = await this.hidratarAutores([guardado]);
    return hidratado;
  }

  async editarComentario(comentarioId: string, dto: any) {
    const comentario = await this.comentarioModel.findOne({
      _id: comentarioId,
      activo: { $ne: false },
    });
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