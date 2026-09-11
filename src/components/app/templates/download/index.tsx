import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { ExportMapForm } from "$/components/app/forms";
import { Show } from "$/components/ui/atoms";
import { Heading } from "$/components/ui/compositions";
import { downloadMapFiles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectDemo } from "$/store/selectors";
import { Stack, Text } from "$:styled-system/jsx";

function Download() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isDemo = useAppSelector((state) => selectDemo(state, sid));

	const demoBlocker = useMemo(() => import.meta.env.PROD && isDemo, [isDemo]);

	return (
		<Stack gap={4}>
			<Heading rank={1}>Download Map</Heading>
			<Show when={!demoBlocker} fallback={<Text textStyle={"paragraph"}>Unfortunately, the demo map is not available for download.</Text>}>
				<ExportMapForm onSubmit={(options) => dispatch(downloadMapFiles({ songId: sid, options }))} />
			</Show>
		</Stack>
	);
}

export default Download;
