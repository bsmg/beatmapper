import type { BufferGeometryNode } from "@react-three/fiber";
import type { TextGeometry } from "three-stdlib";

declare module "csstype" {
	export interface Properties {
		[index: `--${string}`]: string | number | undefined;
	}
}

declare module "@react-three/fiber" {
	export interface ThreeElements {
		/** requires `{@link extend}` */
		textGeometry: BufferGeometryNode<TextGeometry, typeof TextGeometry>;
	}
}
