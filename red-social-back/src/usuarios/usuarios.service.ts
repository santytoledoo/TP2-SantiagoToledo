import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  private formatearUsuario(usuario: any) {
    return {
      id: usuario._id,
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      username: usuario.username,
      fechaNacimiento: usuario.fechaNacimiento || '',
      descripcion: usuario.descripcion || '',
      fotoPerfil: usuario.fotoPerfil || '',
      rol: usuario.rol || 'usuario',
      activo: usuario.activo !== false,
      createdAt: usuario.createdAt,
    };
  }

  async listarTodos() {
    const usuarios = await this.usuarioModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return usuarios.map((u) => this.formatearUsuario(u));
  }

  async crearUsuario(dto: any) {
    if (!dto.nombre || !dto.apellido || !dto.correo || !dto.username || !dto.password) {
      throw new BadRequestException('Faltan campos obligatorios para crear el usuario.');
    }

    const existeCorreo = await this.usuarioModel.findOne({ correo: dto.correo.trim() });
    if (existeCorreo) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    const existeUsername = await this.usuarioModel.findOne({ username: dto.username.trim() });
    if (existeUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const nuevo = new this.usuarioModel({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      correo: dto.correo.trim(),
      username: dto.username.trim(),
      password: hashedPassword,
      fechaNacimiento: dto.fechaNacimiento || '',
      descripcion: dto.descripcion?.trim() || '',
      fotoPerfil: dto.fotoPerfil || '',
      rol: dto.rol === 'administrador' ? 'administrador' : 'usuario',
      activo: true,
    });

    const guardado = await nuevo.save();
    return {
      message: 'Usuario creado exitosamente.',
      usuario: this.formatearUsuario(guardado),
    };
  }

  async deshabilitar(id: string) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      id,
      { $set: { activo: false } },
      { new: true },
    );

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return {
      message: 'Usuario deshabilitado correctamente.',
      usuario: this.formatearUsuario(usuario),
    };
  }

  async habilitar(id: string) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      id,
      { $set: { activo: true } },
      { new: true },
    );

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return {
      message: 'Usuario rehabilitado correctamente.',
      usuario: this.formatearUsuario(usuario),
    };
  }
}