import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'usuarios' })
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

  @Prop({ default: '' })
  fechaNacimiento: string;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: '' })
  fotoPerfil: string;

  @Prop({ default: 'usuario' })
  rol: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: 0 })
  loginsCount: number;

  @Prop({ default: 0 })
  visitasPerfilCount: number;

  @Prop({ type: [String], default: [] })
  visitantesIds: string[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);