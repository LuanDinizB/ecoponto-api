import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-loki",
    options: {
      host: process.env.LOKI_HOST,
      basicAuth: {
        username: process.env.LOKI_USER,
        password: process.env.LOKI_PASSWORD
      },
      labels: {
        app: "ecoponto-api"
      },
    }
  }
});

export default logger;