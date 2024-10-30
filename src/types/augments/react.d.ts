import type { BufferGeometryNode } from "@react-three/fiber";
import type { ReactNode } from "react";
import type { TextGeometry } from "three-stdlib";

declare module "@react-three/fiber" {
	export interface ThreeElements {
		/** requires `{@link extend}` */
		textGeometry: BufferGeometryNode<TextGeometry, typeof TextGeometry>;
	}
}

declare module "react-tippy" {
	export interface TooltipProps {
		children: ReactNode;
	}
}
