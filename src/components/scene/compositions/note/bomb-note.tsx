import { mineUrl } from "$/assets";
import type { App } from "$/types";
import { memo } from "react";
import { useOBJ } from "../../atoms";
import BaseNote, { type BaseNoteProps } from "./base";

useOBJ.preload(mineUrl);

function BombNote({ size = 1, ...rest }: Omit<BaseNoteProps<App.IBombNote>, "path" | "children">) {
	return (
		<BaseNote {...rest} path={mineUrl} position={rest.position} size={size} metalness={0.75} roughness={0.4}>
			{() => null}
		</BaseNote>
	);
}

export default memo(BombNote);
