import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import * as bcrypt from 'bcrypt';

const EXPIRACION_TOKEN_SEGUNDOS = 180; // 3 minutos

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private jwtService: JwtService,
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
      loginsCount: usuario.loginsCount || 0,
      visitasPerfilCount: usuario.visitasPerfilCount || 0,
    };
  }

  private generarToken(usuario: any): string {
    const payload = {
      sub: usuario._id.toString(),
      correo: usuario.correo,
      username: usuario.username,
      rol: usuario.rol || 'usuario',
    };
    return this.jwtService.sign(payload, { expiresIn: EXPIRACION_TOKEN_SEGUNDOS });
  }

  private limpiarToken(rawToken?: string): string {
    if (!rawToken) return '';
    return rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim();
  }

  private extraerUserIdDeToken(rawToken?: string): string | null {
    const token = this.limpiarToken(rawToken);
    if (!token) return null;
    try {
      const payload: any = this.jwtService.verify(token);
      return payload?.sub ? String(payload.sub) : null;
    } catch {
      const decoded: any = this.jwtService.decode(token);
      return decoded?.sub ? String(decoded.sub) : null;
    }
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
      rol: dto.rol === 'administrador' ? 'administrador' : 'usuario',
      activo: true,
      password: hashedPassword,
      loginsCount: 1,
      visitasPerfilCount: 0,
      visitantesIds: [],
    });

    const guardado = await nuevoUsuario.save();
    const access_token = this.generarToken(guardado);

    return {
      status: 201,
      message: 'Usuario creado exitosamente',
      access_token,
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

    if (usuario.activo === false) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra deshabilitada. No estás autorizado para ingresar.',
      );
    }

    usuario.loginsCount = (usuario.loginsCount || 0) + 1;
    await usuario.save();

    const access_token = this.generarToken(usuario);

    return {
      access_token,
      usuario: this.formatearUsuario(usuario),
    };
  }

  async autorizar(rawToken?: string) {
    const token = this.limpiarToken(rawToken);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.usuarioModel.findById(payload.sub);
      if (!usuario || usuario.activo === false) {
        throw new UnauthorizedException('Usuario deshabilitado o no encontrado.');
      }

      return {
        valido: true,
        usuario: this.formatearUsuario(usuario),
      };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }
  }

  async refrescar(rawToken?: string) {
    const token = this.limpiarToken(rawToken);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.usuarioModel.findById(payload.sub);
      if (!usuario || usuario.activo === false) {
        throw new UnauthorizedException('Usuario deshabilitado o no encontrado.');
      }

      const nuevoPayload = {
        sub: usuario._id.toString(),
        correo: usuario.correo,
        username: usuario.username,
        rol: usuario.rol || 'usuario',
      };

      const access_token = this.jwtService.sign(nuevoPayload, { expiresIn: EXPIRACION_TOKEN_SEGUNDOS });

      return {
        access_token,
        usuario: this.formatearUsuario(usuario),
      };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }
  }

  async obtenerPerfil(id: string, rawToken?: string, visitanteQueryId?: string) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const visitanteId = this.extraerUserIdDeToken(rawToken) || visitanteQueryId || null;
    if (visitanteId && String(visitanteId) !== String(usuario._id)) {
      usuario.visitasPerfilCount = (usuario.visitasPerfilCount || 0) + 1;
      await usuario.save();
    }

    return this.formatearUsuario(usuario);
  }

  async registrarVisitaPerfil(id: string, rawToken?: string, visitanteBodyId?: string) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const visitanteId = this.extraerUserIdDeToken(rawToken) || visitanteBodyId || null;
    if (visitanteId && String(visitanteId) !== String(usuario._id)) {
      usuario.visitasPerfilCount = (usuario.visitasPerfilCount || 0) + 1;
      await usuario.save();
    }

    return {
      visitasPerfilCount: usuario.visitasPerfilCount || 0,
    };
  }

  async actualizarPerfil(id: string, datos: any) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (datos.correo && datos.correo !== usuario.correo) {
      const correoOcupado = await this.usuarioModel.findOne({
        correo: datos.correo,
        _id: { $ne: id },
      });
      if (correoOcupado) {
        throw new BadRequestException('Ese correo electrónico ya pertenece a otra cuenta.');
      }
    }

    if (datos.username && datos.username !== usuario.username) {
      const usernameOcupado = await this.usuarioModel.findOne({
        username: datos.username,
        _id: { $ne: id },
      });
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
    const nombreCompleto = `${actualizado.nombre} ${actualizado.apellido}`.trim();

    const pubModel = this.usuarioModel.db.models['Publicacion'];
    if (pubModel) {
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

    const comModel = this.usuarioModel.db.models['Comentario'];
    if (comModel) {
      await comModel.updateMany(
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