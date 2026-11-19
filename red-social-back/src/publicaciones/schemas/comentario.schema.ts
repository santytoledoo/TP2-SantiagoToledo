import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ required: true })
  publicacionId: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ required: true })
  autorId: string;

  @Prop({ required: true })
  autor: string;

  @Prop({ default: '' })
  autorUsername: string;

  @Prop({ default: '' })
  autorFoto: string;

  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);