import { useParams } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectBpm, selectJumpOffset, selectJumpSpeed } from "$/store/selectors";

export function useNoteJumpSpeed() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const bpm = useAppSelector((state) => selectBpm(state, sid));
	const jumpSpeed = useAppSelector((state) => selectJumpSpeed(state, sid, bid));
	const jumpOffset = useAppSelector((state) => selectJumpOffset(state, sid, bid));

	const { beatDepth, surfaceDepth } = useMemo(() => {
		const njs = NoteJumpSpeed.create(bpm, jumpSpeed, jumpOffset);

		return {
			beatDepth: njs.calcDistance(bpm / 60),
			surfaceDepth: njs.jd,
		};
	}, [bpm, jumpSpeed, jumpOffset]);

	return { beatDepth, surfaceDepth };
}
