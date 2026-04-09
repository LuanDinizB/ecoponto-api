import cloudinary from '../config/cloudinary';
import logger from '../config/logger';

export const uploadImagem = async (
  buffer: Buffer,
  pasta: string = 'ecopontos'
): Promise<string | null> => {
  try {
    const resultado = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: pasta,
            fetch_format: 'auto',
            quality: 'auto',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    logger.info({ url: resultado.secure_url }, 'Imagem enviada ao Cloudinary com sucesso');
    return resultado.secure_url;
  } catch (error) {
    logger.error({ err: error }, 'Erro ao fazer upload da imagem para o Cloudinary');
    return null;
  }
};

export const deletarImagem = async (url: string): Promise<void> => {
  try {
    const partes = url.split('/');
    const arquivo = partes[partes.length - 1].split('.')[0];
    const pasta = partes[partes.length - 2];
    const publicId = `${pasta}/${arquivo}`;

    await cloudinary.uploader.destroy(publicId);
    logger.info({ publicId }, 'Imagem deletada do Cloudinary com sucesso');
  } catch (error) {
    logger.error({ err: error }, 'Erro ao deletar imagem do Cloudinary');
  }
};