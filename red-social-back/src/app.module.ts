import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://santiagovtoledo_db_user:5di9DSr1s1qxAha8@cluster0.tdzwk3m.mongodb.net/red-social?retryWrites=true&w=majority',
    ),
    AuthModule,
    PublicacionesModule,
    UsuariosModule,
  ],
})
export class AppModule {}