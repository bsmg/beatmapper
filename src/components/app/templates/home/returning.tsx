import { stack, vstack } from "$:styled-system/patterns";

import { Stack, styled } from "$:styled-system/jsx";
import { CreateMapForm, ImportMapForm } from "$/components/app/forms";
import { Button, Dialog, Heading } from "$/components/ui/compositions";
import { SongDataTable } from "../tables";

function ReturningHome() {
	return (
		<Stack gap={4}>
			<Heading rank={1}>Select map to edit</Heading>
			<Contents>
				<MainColumn>
					<SongDataTable />
				</MainColumn>
				<SideColumn>
					<Dialog title="Create new song" description="Build a new map from scratch, using music from your computer" unmountOnExit render={(ctx) => <CreateMapForm dialog={ctx} />}>
						<Button variant="solid" size="md">
							Create new song
						</Button>
					</Dialog>
					<Dialog title="Import existing map" description="Edit an existing map by selecting it from your computer" unmountOnExit render={(ctx) => <ImportMapForm dialog={ctx} />}>
						<Button variant="solid" size="md">
							Import existing map
						</Button>
					</Dialog>
				</SideColumn>
			</Contents>
		</Stack>
	);
}

const Contents = styled("div", {
	base: stack.raw({
		direction: { base: "column-reverse", md: "row" },
		align: { base: "center", md: "flex-start" },
		gap: 4,
	}),
});

const MainColumn = styled("div", {
	base: stack.raw({
		gap: 2,
		flex: 6,
		width: "100%",
	}),
});

const SideColumn = styled("div", {
	base: vstack.raw({
		colorPalette: "slate",
		layerStyle: "fill.surface",
		gap: 2,
		flex: 2,
		padding: 4,
		borderRadius: "sm",
		minWidth: "280px",
	}),
});

export default ReturningHome;
