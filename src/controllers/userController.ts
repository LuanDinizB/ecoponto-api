import { Request, Response } from 'express';
import { User } from '../models/User';

export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await User.findById(req.usuarioId);
    if (!usuario) {
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    res.status(200).json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      cooperativa: usuario.cooperativa,
    });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const atualizarPerfil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, telefone } = req.body;

    const atualizado = await User.findByIdAndUpdate(
      req.usuarioId,
      { nome, telefone },
      { new: true, runValidators: true }
    );

    if (!atualizado) {
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: {
        id: atualizado._id,
        nome: atualizado.nome,
        email: atualizado.email,
        telefone: atualizado.telefone,
        cooperativa: atualizado.cooperativa,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const alterarSenha = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      res
        .status(400)
        .json({ mensagem: 'Senha atual e nova senha são obrigatórias.' });
      return;
    }

    if (novaSenha.length < 6) {
      res
        .status(400)
        .json({ mensagem: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const usuario = await User.findById(req.usuarioId).select('+senha');
    if (!usuario) {
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    const senhaCorreta = await usuario.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      res.status(401).json({ mensagem: 'Senha atual incorreta.' });
      return;
    }

    usuario.senha = novaSenha;
    await usuario.save();

    res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const deletarConta = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuario = await User.findByIdAndDelete(req.usuarioId);
    if (!usuario) {
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};
