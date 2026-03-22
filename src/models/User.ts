import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  nome: string;
  email: string;
  telefone: string;
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
    cooperativa: {
      type: Boolean,
      default: false,
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      select: false, // Não retornar senha na consulta
    },
  },
  {
    timestamps: true,
  }
);


UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

UserSchema.methods.compararSenha = async function (
  senhaInformada: string
): Promise<boolean> {
  return bcrypt.compare(senhaInformada, this.senha);
};

export const User = mongoose.model<IUser>('User', UserSchema);
