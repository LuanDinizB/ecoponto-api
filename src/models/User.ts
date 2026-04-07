import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user';

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
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'A senha deve ter no mínimo 6 caracteres'],
      select: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
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