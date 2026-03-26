import type { ThreeElements } from "@react-three/fiber";

import type { Expand } from "./utils";

type SwizzledTransforms = {
	[K in "position" | "rotation" | "scale" as `${K}-${"x" | "y" | "z"}`]?: number;
};

export type ThreeProps<T extends keyof ThreeElements> = Expand<ThreeElements[T] & SwizzledTransforms>;

// biome-ignore lint/suspicious/noExplicitAny: vendored from unstorage
export type MaybeDefined<T> = T extends any ? T : any;
