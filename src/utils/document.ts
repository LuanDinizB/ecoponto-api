import { cpf, cnpj } from 'cpf-cnpj-validator';

export type TipoDocumento = 'CPF' | 'CNPJ';

export const validarDocumento = (
  documento: string
): { valido: boolean; tipo: TipoDocumento | null } => {
  if (cpf.isValid(documento)) return { valido: true, tipo: 'CPF' };
  if (cnpj.isValid(documento)) return { valido: true, tipo: 'CNPJ' };
  return { valido: false, tipo: null };
};

export const isCooperativa = (documento: string): boolean => {
  return cnpj.isValid(documento);
};