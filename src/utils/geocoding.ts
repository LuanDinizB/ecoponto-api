import logger from '../config/logger';

interface Coordenadas {
  lat: number;
  lng: number;
}

export const geocodificarEndereco = async (
  endereco: string
): Promise<Coordenadas | null> => {
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!apiKey) {
    logger.warn('OPENCAGE_API_KEY não definida — geocoding desabilitado');
    return null;
  }

  try {
    const query = encodeURIComponent(endereco);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}&language=pt&countrycode=br&limit=1`;

    const response = await fetch(url);
    const data = await response.json() as {
      results: { geometry: { lat: number; lng: number } }[];
      status: { code: number };
    };

    if (data.status.code !== 200 || data.results.length === 0) {
      logger.warn({ endereco }, 'Geocoding não retornou resultados');
      return null;
    }

    const { lat, lng } = data.results[0].geometry;
    logger.info({ endereco, lat, lng }, 'Geocoding realizado com sucesso');
    return { lat, lng };
  } catch (error) {
    logger.error({ err: error, endereco }, 'Erro ao realizar geocoding');
    return null;
  }
};