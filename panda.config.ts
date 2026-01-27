import { defineConfig, definePlugin } from "@pandacss/dev";

import { default as beatmapper } from "./src/styles/preset";

const removePandaTokens = definePlugin({
	name: "remove-colors",
	hooks: {
		"preset:resolved": ({ utils, preset, name }) => {
			if (name === "@pandacss/preset-panda") return utils.omit(preset, ["theme.tokens.colors", "theme.semanticTokens.colors"]);
			return preset;
		},
	},
});

export default defineConfig({
	preflight: true,
	include: ["./src/**/*.{js,jsx,ts,tsx}"],
	importMap: "$:styled-system",
	outdir: "styled-system",
	presets: ["@pandacss/preset-base", "@pandacss/preset-panda", beatmapper({})],
	plugins: [removePandaTokens],
	jsxFramework: "react",
	jsxStyleProps: "none",
	shorthands: false,
});
