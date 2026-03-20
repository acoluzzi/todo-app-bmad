const parsePort = (value: string | undefined): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 3001;
  }

  return parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.BACKEND_PORT)
};
