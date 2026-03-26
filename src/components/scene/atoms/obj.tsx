import type { Assign } from "@ark-ui/react";
import { Clone } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import type { ComponentProps } from "react";
import type { Group } from "three";
import { OBJLoader } from "three/addons";

export function useOBJ(path: string): Group {
	return useLoader(OBJLoader, path);
}

useOBJ.preload = (path: string) => useLoader.preload(OBJLoader, path);
useOBJ.clear = (input: string | string[]) => useLoader.clear(OBJLoader, input);

export interface ObjProps {
	path: Parameters<typeof useOBJ>[0];
}
export function Obj({ path, ...props }: Assign<Omit<ComponentProps<typeof Clone>, "object">, ObjProps>) {
	const obj = useOBJ(path);
	const object = obj.children[0];
	return <Clone {...props} object={object} />;
}
