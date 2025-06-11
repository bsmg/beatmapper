import { defineConfig } from "@pandacss/dev";

import { default as base } from "@pandacss/preset-base";
import { default as beatmapper } from "./src/styles/preset";

export default defineConfig({
	preflight: true,
	include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
	importMap: "$:styled-system",
	outdir: "styled-system",
	presets: [base, beatmapper({})],
	jsxFramework: "react",
	jsxStyleProps: "none",
	shorthands: false,
});
