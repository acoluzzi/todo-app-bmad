import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

test.describe("WCAG 2.1 AA Accessibility Audit", () => {
  test("empty state page has no accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("main#main-content");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    logViolations("Empty state", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("page with todos has no accessibility violations", async ({ page }) => {
    await page.goto("/");

    const todoText = `a11y-todo-${uid()}`;
    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill(todoText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(todoText).first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    logViolations("Page with todos", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("page with completed todo has no accessibility violations", async ({ page }) => {
    await page.goto("/");

    const todoText = `a11y-complete-${uid()}`;
    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill(todoText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(todoText).first()).toBeVisible();

    await page.getByRole("button", { name: "Mark complete" }).first().click();
    await expect(page.getByRole("button", { name: "Mark active" }).first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    logViolations("Completed todo state", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("form validation error state has no accessibility violations", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText("Enter a todo description.")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    logViolations("Form validation error", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("keyboard navigation follows logical tab order", async ({ page }) => {
    await page.goto("/");

    const todoText = `a11y-keyboard-${uid()}`;
    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill(todoText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(todoText).first()).toBeVisible();

    await input.focus();
    await expect(input).toBeFocused();

    await page.keyboard.press("Tab");
    const addButton = page.getByRole("button", { name: "Add todo" });
    await expect(addButton).toBeFocused();

    await page.keyboard.press("Tab");
    const toggleButton = page.getByRole("button", { name: /Mark (complete|active)/ }).first();
    await expect(toggleButton).toBeFocused();

    await page.keyboard.press("Tab");
    const deleteButton = page.getByRole("button", { name: "Delete" }).first();
    await expect(deleteButton).toBeFocused();
  });

  test("skip-to-content link works correctly", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");

    const mainContent = page.locator("main#main-content");
    await expect(mainContent).toBeVisible();
  });

  test("focus indicators are visible on interactive elements via keyboard", async ({ page }) => {
    await page.goto("/");

    const todoText = `a11y-focus-${uid()}`;
    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill(todoText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(todoText).first()).toBeVisible();

    // Tab to the input to trigger :focus-visible (keyboard navigation)
    await input.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");

    const inputStyles = await input.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { outline: style.outline, boxShadow: style.boxShadow };
    });
    const inputHasFocusIndicator =
      (inputStyles.outline !== "" && inputStyles.outline !== "none") ||
      (inputStyles.boxShadow !== "" && inputStyles.boxShadow !== "none");
    expect(inputHasFocusIndicator).toBe(true);

    // Tab to Add button and check its focus ring
    await page.keyboard.press("Tab");
    const addButton = page.getByRole("button", { name: "Add todo" });
    await expect(addButton).toBeFocused();

    const buttonStyles = await addButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { outline: style.outline, boxShadow: style.boxShadow };
    });
    const buttonHasFocusIndicator =
      (buttonStyles.outline !== "" && buttonStyles.outline !== "none") ||
      (buttonStyles.boxShadow !== "" && buttonStyles.boxShadow !== "none");
    expect(buttonHasFocusIndicator).toBe(true);
  });

  test("mobile viewport has no accessibility violations", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const todoText = `a11y-mobile-${uid()}`;
    const input = page.getByPlaceholder("What needs to get done?");
    await input.fill(todoText);
    await page.getByRole("button", { name: "Add todo" }).click();
    await expect(page.getByText(todoText).first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    logViolations("Mobile viewport", results.violations);
    expect(results.violations).toEqual([]);
  });
});

type AxeViolation = {
  id: string;
  impact?: string;
  description: string;
  helpUrl: string;
  nodes: { html: string; failureSummary?: string }[];
};

function logViolations(context: string, violations: AxeViolation[]) {
  if (violations.length === 0) return;

  console.log(`\n=== ${context}: ${violations.length} violation(s) ===`);
  for (const v of violations) {
    console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
    console.log(`    Help: ${v.helpUrl}`);
    for (const node of v.nodes) {
      console.log(`    Element: ${node.html}`);
      if (node.failureSummary) {
        console.log(`    Fix: ${node.failureSummary}`);
      }
    }
  }
}
