import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { cnpj } from 'cpf-cnpj-validator';
import { ICooperative } from '../types/cooperativa';

const CooperativeSchema = new Schema<ICooperative>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
    },
    telefone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    documento: {
      type: String,
      required: [true, 'CNPJ é obrigatório'],
      unique: true,
      trim: true,
      set: (valor: string) => valor.replace(/\D/g, ''),
      validate: {
        validator: (valor: string) => cnpj.isValid(valor),
        message: 'CNPJ inválido',
      },
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      select: false,
    },
  },
  { timestamps: true }
);

CooperativeSchema.pre('save', async function (next) {
  if (this.isModified('senha')) {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
  }
  next();
});

CooperativeSchema.methods.compararSenha = async function (
  senhaInformada: string
): Promise<boolean> {
  return bcrypt.compare(senhaInformada, this.senha);
};

export const Cooperative = mongoose.model<ICooperative>(
  'Cooperative',
  CooperativeSchema
);