import { Document, Types } from 'mongoose';

export interface IHorarioDia {
  aberto: boolean;
  inicio?: string;
  fim?: string;
}

export interface IHorario {
  seg?: IHorarioDia;
  ter?: IHorarioDia;
  qua?: IHorarioDia;
  qui?: IHorarioDia;
  sex?: IHorarioDia;
  sab?: IHorarioDia;
  dom?: IHorarioDia;
}

export interface IPontoColeta extends Document {
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  endereco: string;
  lat?: number;
  lng?: number;
  horario: IHorario;
  tags: string[];
  imagem?: string;
  cooperativa: String;
}