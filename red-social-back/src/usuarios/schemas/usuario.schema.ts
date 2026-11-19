import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Usuario extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: string;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: '' })
  fotoPerfil: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);