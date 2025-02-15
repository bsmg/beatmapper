import { defineCollection, defineConfig, s } from "velite";

import { default as rehypeSlug } from "rehype-slug";
import { default as remarkGfm } from "remark-gfm";

const mdx = s.mdx({
	remarkPlugins: [remarkGfm],
	rehypePlugins: [rehypeSlug],
});

function resolveId(path: string) {
	const base = path.split("\\");
	const basename = base[base.length - 1];
	if (basename.startsWith("index")) return base[base.length - 2];
	const [_, id, rest] = basename.split(".").reverse();
	if (id === "local") return rest;
	return id;
}

const docs = defineCollection({
	name: "Doc",
	pattern: "docs/**/*.mdx",
	schema: s.object({ title: s.string(), subtitle: s.string().optional(), category: s.nullable(s.string()).default(null), order: s.number().default(0), prev: s.string().optional(), next: s.string().optional(), code: mdx, tableOfContents: s.toc() }).transform((data, ctx) => {
		if (!ctx.meta.basename) return { id: "", ...data };
		return { id: resolveId(ctx.meta.basename), ...data };
	}),
});

const prompts = defineCollection({
	name: "Prompt",
	pattern: "prompts/**/*.mdx",
	schema: s.object({ title: s.string(), code: mdx }).transform((data, ctx) => {
		if (!ctx.meta.basename) return { id: "", ...data };
		return { id: resolveId(ctx.meta.basename), ...data };
	}),
});

export default defineConfig({
	root: "src/content",
	output: {
		clean: true,
	},
	collections: {
		docs: docs,
		prompts: prompts,
	},
});
