import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logStartup } from "./config/logger.js";

const start = async (): Promise<void> => {
  const app = createApp();

  try {
    await app.listen({ host: "0.0.0.0", port: env.port });
    logStartup(app.log, env.port);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
