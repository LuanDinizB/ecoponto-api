import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPontoColeta extends Document {
  nome: string;
  endereco: string;
  horario: string;
  tags: string[];
  cooperativa: Types.ObjectId;
}

const PontoColetaSchema = new Schema<IPontoColeta>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    endereco: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true,
    },
    horario: {
      type: String,
      required: [true, 'Horário é obrigatório'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length > 0,
        message: 'Informe ao menos uma tag (ex: plástico, vidro)',
      },
    },
    cooperativa: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PontoColeta = mongoose.model<IPontoColeta>(
  'PontoColeta',
  PontoColetaSchema
);
