import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>
  ) {}

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

    // Obtener siempre la foto y datos más recientes de cada autor
    const userModel = this.publicacionModel.db.models['Usuario'];
    const autorIds = [
      ...new Set(
        data
          .map((p: any) => (p.autorId ? p.autorId.toString() : ''))
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

    const dataActualizada = data.map((p: any) => {
      const plain = typeof p.toObject === 'function' ? p.toObject() : { ...p };
      const u = plain.autorId ? mapaUsuarios.get(plain.autorId.toString()) : null;
      if (u) {
        plain.autor = `${u.nombre} ${u.apellido}`.trim();
        plain.autorUsername = u.username;
        plain.autorFoto = u.fotoPerfil || '';
      }
      return plain;
    });

    return {
      data: dataActualizada,
      total,
      page,
      totalPages,
    };
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
    return await this.publicacionModel.findByIdAndDelete(id);
  }
}