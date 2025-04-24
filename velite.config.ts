import { defineCollection, defineConfig, s } from "velite";

import { join } from "node:path";
import { cwd } from "node:process";
import { default as rehypeExpressiveCode } from "rehype-expressive-code";
import { default as rehypeSlug } from "rehype-slug";
import { default as remarkGfm } from "remark-gfm";

const mdx = s.mdx({
	remarkPlugins: [[remarkGfm]],
	rehypePlugins: [[rehypeSlug], [rehypeExpressiveCode, { themes: ["github-light-default", "github-dark-default"], styleOverrides: { frames: { shadowColor: "transparent" } } }]],
});

function resolveId(path: string, collection: string) {
	const [...splat] = path.replace(join(cwd(), `src/content/${collection}`), "").split("\\");
	return splat.join("/").replace("/index", "").replace(".local", "").slice(1);
}

const docs = defineCollection({
	name: "Doc",
	pattern: "docs/**/*.mdx",
	schema: s.object({ title: s.string(), subtitle: s.string().optional(), category: s.nullable(s.string()).default(null), order: s.number().default(0), prev: s.string().optional(), next: s.string().optional(), code: mdx, tableOfContents: s.toc() }).transform((data, ctx) => {
		if (!ctx.meta.stem) return { id: "", ...data };
		return { id: resolveId(ctx.meta.stem, "docs"), ...data };
	}),
});

const prompts = defineCollection({
	name: "Prompt",
	pattern: "prompts/**/*.mdx",
	schema: s.object({ title: s.string(), code: mdx }).transform((data, ctx) => {
		if (!ctx.meta.stem) return { id: "", ...data };
		return { id: resolveId(ctx.meta.stem, "prompts"), ...data };
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
