import { stack, vstack } from "$:styled-system/patterns";

import { styled } from "$:styled-system/jsx";
import { CreateMapForm, ImportMapForm } from "$/components/app/forms";
import { SongsDataTable } from "$/components/app/templates/tables";
import { Button, Dialog, Heading } from "$/components/ui/compositions";

function ReturningHome() {
	return (
		<Wrapper>
			<Heading rank={1}>Select map to edit</Heading>
			<Contents>
				<MainColumn>
					<SongsDataTable />
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
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: stack.raw({
		gap: 4,
		align: { base: "center", md: "flex-start" },
	}),
});

const Contents = styled("div", {
	base: stack.raw({
		width: "100%",
		direction: { base: "column-reverse", md: "row" },
		align: { base: "center", md: "flex-start" },
		gap: 4,
	}),
});

const MainColumn = styled("div", {
	base: stack.raw({
		gap: 2,
		width: "100%",
	}),
});

const SideColumn = styled("div", {
	base: vstack.raw({
		colorPalette: "slate",
		layerStyle: "fill.surface",
		gap: 2,
		padding: 4,
		borderRadius: "sm",
		minWidth: "280px",
	}),
});

export default ReturningHome;
