import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

const candidateEnvFiles = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];

for (const filePath of candidateEnvFiles) {
  if (existsSync(filePath)) {
    config({ path: filePath, override: false });
  }
}

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 3001;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("BACKEND_PORT must be an integer between 1 and 65535");
  }

  return parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.BACKEND_PORT)
};
