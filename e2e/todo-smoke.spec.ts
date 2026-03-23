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
});
