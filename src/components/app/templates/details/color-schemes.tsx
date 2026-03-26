import { useDialog } from "@ark-ui/react/dialog";
import { useParams } from "@tanstack/react-router";

import { ColorScheme } from "$/components/app/compositions";
import { For } from "$/components/ui/atoms";
import { AlertDialogProvider, Button, Heading, Switch } from "$/components/ui/compositions";
import { removeColorScheme, updateColorScheme } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorSchemeIds, selectColorSchemes } from "$/store/selectors";
import { HStack, Stack, styled, Text, Wrap } from "$:styled-system/jsx";

function ColorSchemeDetails() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const colorSchemeOverrides = useAppSelector((state) => selectColorSchemes(state, sid));
	const colorSchemeIds = useAppSelector((state) => selectColorSchemeIds(state, sid));

	const deleteAlert = useDialog({ role: "alertdialog" });

	return (
		<Stack gap={2}>
			<For each={colorSchemeIds}>
				{(colorSchemeId) => (
					<ColorSchemeWrapper gap={1}>
						<HStack gap={2}>
							<Heading rank={3}>{colorSchemeId}</Heading>
							<AlertDialogProvider value={deleteAlert} render={() => <Text textStyle={"paragraph"}>Are you sure you want to do this? This action cannot be undone.</Text>} onSubmit={() => dispatch(removeColorScheme({ songId: sid, colorSchemeId }))}>
								<Button variant="subtle" size="sm" colorPalette="red">
									Delete
								</Button>
							</AlertDialogProvider>
						</HStack>
						<ColorScheme key={colorSchemeId} colorScheme={colorSchemeOverrides[colorSchemeId]} onColorChange={(element, color) => dispatch(updateColorScheme({ songId: sid, colorSchemeId, changes: { [element]: color } }))} />
						<Wrap gap={4} rowGap={2} justify={"center"}>
							<Switch label={"Show Note Color Overrides"} checked={!!colorSchemeOverrides[colorSchemeId].overrideNotes} onCheckedChange={(details) => dispatch(updateColorScheme({ songId: sid, colorSchemeId, changes: { overrideNotes: details.checked } }))} />
							<Switch label={"Show Light Color Overrides"} checked={!!colorSchemeOverrides[colorSchemeId].overrideLights} onCheckedChange={(details) => dispatch(updateColorScheme({ songId: sid, colorSchemeId, changes: { overrideLights: details.checked } }))} />
						</Wrap>
					</ColorSchemeWrapper>
				)}
			</For>
		</Stack>
	);
}

const ColorSchemeWrapper = styled(Stack, {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
		padding: 3,
	},
});

export default ColorSchemeDetails;
