/// <reference types="vite/client" />

declare const version: string;

interface ImportMetaEnv {
	VITE_ENABLE_DEVTOOLS: boolean;
}

declare module "virtual:pwa-register" {
	import type { RegisterSWOptions } from "vite-plugin-pwa/types";

	export type { RegisterSWOptions };

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
