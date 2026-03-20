import { z } from "zod";

export const createTodoSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description must be at least 1 character")
    .max(120, "Description must be at most 120 characters")
});

export const updateTodoSchema = z.object({
  is_completed: z.boolean()
});

export const todoIdParamSchema = z.object({
  id: z.string().uuid("Invalid todo ID format")
});

export type CreateTodoBody = z.infer<typeof createTodoSchema>;
export type UpdateTodoBody = z.infer<typeof updateTodoSchema>;
export type TodoIdParam = z.infer<typeof todoIdParamSchema>;
