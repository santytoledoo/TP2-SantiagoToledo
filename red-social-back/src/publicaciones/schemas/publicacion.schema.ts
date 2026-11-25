import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface CompartidoRegistro {
  deUsuarioId: string;
  deUsuarioNombre: string;
  deUsuarioUsername: string;
  paraUsuarioId: string;
  fecha: Date;
}

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  contenido: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ required: true })
  autor: string;

  @Prop({ default: '' })
  autorUsername: string;

  @Prop({ default: '' })
  autorId: string;

  @Prop({ default: '' })
  autorFoto: string;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  guardadosPor: string[];

  @Prop({ type: [Object], default: [] })
  compartidos: CompartidoRegistro[];

  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);