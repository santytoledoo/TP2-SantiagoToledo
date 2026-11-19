import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>
  ) {}

  private formatearUsuario(usuario: any) {
    return {
      id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      username: usuario.username,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion || '',
      fotoPerfil: usuario.fotoPerfil || '',
    };
  }

  async registrar(dto: any) {
    const existeCorreo = await this.usuarioModel.findOne({ correo: dto.correo });
    if (existeCorreo) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    const existeUsername = await this.usuarioModel.findOne({ username: dto.username });
    if (existeUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const nuevoUsuario = new this.usuarioModel({
      ...dto,
      password: hashedPassword,
    });

    const guardado = await nuevoUsuario.save();

    return {
      status: 201,
      message: 'Usuario creado exitosamente',
      access_token: 'jwt-token-simulado',
      usuario: this.formatearUsuario(guardado),
    };
  }

  async login(credenciales: any) {
    const identificador = credenciales.identificador || credenciales.correo;

    if (!identificador || !credenciales.password) {
      throw new BadRequestException('Debes ingresar tu correo/usuario y contraseña.');
    }

    const usuario = await this.usuarioModel.findOne({
      $or: [{ correo: identificador }, { username: identificador }],
    });

    if (!usuario) {
      throw new UnauthorizedException('El usuario o correo no existe.');
    }

    const esPasswordValida = await bcrypt.compare(credenciales.password, usuario.password);
    if (!esPasswordValida) {
      throw new UnauthorizedException('La contraseña ingresada es incorrecta.');
    }

    return {
      access_token: 'jwt-token-simulado',
      usuario: this.formatearUsuario(usuario),
    };
  }

  async obtenerPerfil(id: string) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return this.formatearUsuario(usuario);
  }

  async actualizarPerfil(id: string, datos: any) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (datos.correo && datos.correo !== usuario.correo) {
      const correoOcupado = await this.usuarioModel.findOne({ correo: datos.correo, _id: { $ne: id } });
      if (correoOcupado) {
        throw new BadRequestException('Ese correo electrónico ya pertenece a otra cuenta.');
      }
    }

    if (datos.username && datos.username !== usuario.username) {
      const usernameOcupado = await this.usuarioModel.findOne({ username: datos.username, _id: { $ne: id } });
      if (usernameOcupado) {
        throw new BadRequestException('Ese nombre de usuario ya está en uso.');
      }
    }

    usuario.nombre = datos.nombre ?? usuario.nombre;
    usuario.apellido = datos.apellido ?? usuario.apellido;
    usuario.correo = datos.correo ?? usuario.correo;
    usuario.username = datos.username ?? usuario.username;
    usuario.fechaNacimiento = datos.fechaNacimiento ?? usuario.fechaNacimiento;
    usuario.descripcion = datos.descripcion ?? usuario.descripcion;
    if (datos.fotoPerfil !== undefined) {
      usuario.fotoPerfil = datos.fotoPerfil;
    }

    const actualizado = await usuario.save();

    // Sincronizar foto, nombre y username en todas sus publicaciones del muro
    const pubModel = this.usuarioModel.db.models['Publicacion'];
    if (pubModel) {
      const nombreCompleto = `${actualizado.nombre} ${actualizado.apellido}`.trim();
      await pubModel.updateMany(
        { $or: [{ autorId: id.toString() }, { autorId: actualizado._id }] },
        {
          $set: {
            autor: nombreCompleto,
            autorUsername: actualizado.username,
            autorFoto: actualizado.fotoPerfil || '',
          },
        },
      );
    }

    return {
      message: 'Perfil actualizado correctamente',
      usuario: this.formatearUsuario(actualizado),
    };
  }
}