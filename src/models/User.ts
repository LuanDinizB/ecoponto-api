import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { validarDocumento, isCooperativa } from '../utils/document';

export interface IUser extends Document {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  cooperativa: boolean;
  senha: string;
  compararSenha(senhaInformada: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
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
      required: [true, 'CPF ou CNPJ é obrigatório'],
      unique: true,
      trim: true,
      set: (valor: string) => valor.replace(/\D/g, ''),
      validate: {
        validator: (valor: string) => {
          const { valido } = validarDocumento(valor);
          return valido;
        },
        message: 'CPF ou CNPJ inválido',
      },
    },
    cooperativa: {
      type: Boolean,
      default: false,
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('documento')) {
    this.cooperativa = isCooperativa(this.documento);
  }

  if (this.isModified('senha')) {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
  }

  next();
});

UserSchema.methods.compararSenha = async function (
  senhaInformada: string
): Promise<boolean> {
  return bcrypt.compare(senhaInformada, this.senha);
};

export const User = mongoose.model<IUser>('User', UserSchema);