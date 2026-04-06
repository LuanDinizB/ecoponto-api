import mongoose, { Schema } from 'mongoose';
import { IPontoColeta, IHorarioDia } from '../types/pontoColeta';

const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;

const HorarioDiaSchema = new Schema<IHorarioDia>(
  {
    aberto: { type: Boolean, required: true },
    inicio: { type: String },
    fim:    { type: String },
  },
  { _id: false }
);

const horarioSchema = Object.fromEntries(
  dias.map(dia => [dia, { type: HorarioDiaSchema, required: false }])
);

const PontoColetaSchema = new Schema<IPontoColeta>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    cep: {
      type: String,
      required: [true, 'CEP é obrigatório'],
      trim: true,
    },
    logradouro: {
      type: String,
      required: [true, 'Logradouro é obrigatório'],
      trim: true,
    },
    numero: {
      type: String,
      trim: true,
    },
    bairro: {
      type: String,
      required: [true, 'Bairro é obrigatório'],
      trim: true,
    },
    cidade: {
      type: String,
      required: [true, 'Cidade é obrigatória'],
      trim: true,
    },
    uf: {
      type: String,
      required: [true, 'UF é obrigatória'],
      trim: true,
      uppercase: true,
      maxlength: [2, 'UF deve ter 2 caracteres'],
    },
    endereco: {
      type: String,
      trim: true,
    },
    lat: { type: Number },
    lng: { type: Number },
    horario: horarioSchema,
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length > 0,
        message: 'Informe ao menos uma tag (ex: plástico, vidro)',
      },
    },
    imagem: {
      type: String,
      trim: true,
    },
    cooperativa: {
      type: String,
      ref: 'Cooperative',
      required: true,
    },
  },
  { timestamps: true }
);

export const PontoColeta = mongoose.model<IPontoColeta>(
  'PontoColeta',
  PontoColetaSchema
);