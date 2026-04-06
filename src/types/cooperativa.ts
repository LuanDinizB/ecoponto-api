import { Document } from 'mongoose';

export interface ICooperative extends Document {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  senha: string;
  compararSenha(senhaInformada: string): Promise<boolean>;
}