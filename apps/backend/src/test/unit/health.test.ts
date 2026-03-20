import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "../../generated/prisma/client.js";
import { createApp } from "../../app.js";

describe("health endpoint", () => {
  it("returns backend health status", async () => {
    const mockPrismaClient = {
      $disconnect: vi.fn()
    } as unknown as PrismaClient;
    const app = createApp({ prismaClient: mockPrismaClient });
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await app.close();
    expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
  });
});
