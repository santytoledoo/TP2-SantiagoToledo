import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  contenido: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ required: true })
  autor: string;

  @Prop({ default: '' })
  autorUsername: string;

  @Prop({ default: '' })
  autorId: string;

  @Prop({ default: '' })
  autorFoto: string;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);