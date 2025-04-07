import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    authorImg: z.string(),
    date: z.string(),
  }),
});

export const collections = {
  blog,
};
