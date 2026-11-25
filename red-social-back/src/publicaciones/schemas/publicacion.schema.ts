import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
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

  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);