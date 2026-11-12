import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async registrar(usuario: any) {
    // Aquí iría la validación y guardado en Mongoose (Sprint 1)
    // Hashear contraseña con bcrypt
    return { status: 201, message: 'Usuario creado exitosamente' };
  }

  async login(credenciales: any) {
    // Validación contra la BD (Sprint 1)
    if (credenciales.correo === 'test@test.com' && credenciales.password === '1234') {
      return { 
        access_token: 'jwt-token-simulado',
        usuario: { id: '1', nombre: 'Test', perfil: 'usuario' } 
      };
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }
}
