import { expect, test } from "@playwright/test";

test.describe("Todo App E2E Smoke", () => {
  test("loads the app and shows the heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Manage your tasks" })).toBeVisible();
  });

  test("creates a todo and displays it in the list", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill("E2E smoke test todo");
    await page.getByRole("button", { name: "Add todo" }).click();

    await expect(page.getByText("E2E smoke test todo")).toBeVisible();
  });

  test("completes a todo and shows completion styling", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill("Toggle this todo");
    await page.getByRole("button", { name: "Add todo" }).click();

    await expect(page.getByText("Toggle this todo")).toBeVisible();

    await page.getByRole("button", { name: "Mark complete" }).first().click();

    await expect(page.getByRole("button", { name: "Mark active" }).first()).toBeVisible();
  });

  test("deletes a todo and removes it from the list", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill("Delete this todo");
    await page.getByRole("button", { name: "Add todo" }).click();

    await expect(page.getByText("Delete this todo")).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).first().click();

    await expect(page.getByText("Delete this todo")).not.toBeVisible();
  });

  test("persists a todo across page refresh (FR9)", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("What needs to get done?");
    const uniqueText = `Persist test ${Date.now()}`;
    await input.fill(uniqueText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(uniqueText)).toBeVisible();

    await page.reload();

    await expect(page.getByText(uniqueText)).toBeVisible();
  });
});

test.describe("Responsive layout (FR12)", () => {
  const viewports = [
    { name: "mobile", width: 375, height: 667 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    test(`renders correctly at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      await expect(page.getByRole("heading", { name: "Manage your tasks" })).toBeVisible();

      const input = page.getByPlaceholder("What needs to get done?");
      await expect(input).toBeVisible();
      await expect(page.getByRole("button", { name: "Add todo" })).toBeVisible();

      await input.fill(`${vp.name} viewport test`);
      await page.getByRole("button", { name: "Add todo" }).click();
      await expect(page.getByText(`${vp.name} viewport test`)).toBeVisible();

      const inputBox = await input.boundingBox();
      expect(inputBox).not.toBeNull();
      expect(inputBox!.width).toBeGreaterThan(0);
      expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(vp.width);
    });
  }
});
