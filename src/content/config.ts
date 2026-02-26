import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const changelog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/changelog" }),
  schema: z.object({
    date: z.string(),
    version: z.string().optional(),
    title: z.string(),
    description: z.string(),
    tag: z.enum(["milestone", "feature", "integration", "infra"]),
    items: z.array(z.string()),
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { changelog, docs };
