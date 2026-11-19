import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://santiagovtoledo_db_user:santiago1234@cluster0.tdzwk3m.mongodb.net/red-social?retryWrites=true&w=majority',
    ),
    UsuariosModule,
    AuthModule,
    PublicacionesModule,
  ],
})
export class AppModule {}