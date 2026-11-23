import { useParams } from "@tanstack/react-router";
import { NoteJumpSpeed } from "bsmap";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectBpm, selectCurrentJumpSpeed, selectJumpOffset, selectJumpSpeed } from "$/store/selectors";

export function useNoteJumpSpeed() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const bpm = useAppSelector((state) => selectBpm(state, sid));
	const jumpSpeed = useAppSelector((state) => selectJumpSpeed(state, sid, bid));
	const jumpOffset = useAppSelector((state) => selectJumpOffset(state, sid, bid));

	const currentJumpSpeed = useAppSelector((state) => selectCurrentJumpSpeed(state, sid, bid));

	const { beatDepth, surfaceDepth } = useMemo(() => {
		const njs = NoteJumpSpeed.create(bpm, jumpSpeed, jumpOffset);

		const jd = njs.jd;
		const rt = njs.reactionTime;

		njs.value = currentJumpSpeed;

		if (currentJumpSpeed < jumpSpeed) {
			njs.offset = njs.calcOffsetFromHjd(njs.calcHjdFromJd(jd));
		} else if (currentJumpSpeed > jumpSpeed) {
			njs.offset = njs.calcOffsetFromRt(rt);
		} else {
			njs.offset = jumpOffset;
		}

		return {
			beatDepth: njs.calcDistance(bpm / 60),
			surfaceDepth: njs.jd,
		};
	}, [bpm, jumpSpeed, jumpOffset, currentJumpSpeed]);

	return { currentJumpSpeed, beatDepth, surfaceDepth };
}
