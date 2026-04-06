import { Document } from 'mongoose';

export interface IUser extends Document {
  nome: string;
  email: string;
  senha: string;
  compararSenha(senhaInformada: string): Promise<boolean>;
}