import { mineUrl } from "$/assets";
import type { App } from "$/types";
import { memo } from "react";
import BaseNote, { type BaseNoteProps } from "./base";

function BombNote({ size = 1, ...rest }: Omit<BaseNoteProps<App.IBombNote>, "path">) {
	return <BaseNote {...rest} path={mineUrl} position={rest.position} size={size} metalness={0.75} roughness={0.4} />;
}

export default memo(BombNote);
