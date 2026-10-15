import type { ComponentProps } from "react";

import { Match, Switch } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectAnySelectedEvents } from "$/store/selectors";
import { HStack, styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { DefaultEventGridControls, EditModeEventGridControls, LightColorEventGridControls, LightEffectEventGridControls, LockEventGridControls, SelectionEventGridControls } from "./controls-groups";

function EventGridControls({ ...rest }: ComponentProps<typeof Wrapper>) {
	const areEventsSelected = useAppSelector(selectAnySelectedEvents);

	return (
		<Wrapper {...rest} onWheel={(ev) => ev.stopPropagation()}>
			<HStack gap={4} justify={"flex-start"}>
				<EditModeEventGridControls />
				<LightColorEventGridControls />
				<LightEffectEventGridControls />
				<LockEventGridControls />
			</HStack>
			<HStack gap={4} justify={"flex-end"}>
				<Switch>
					<Match when={areEventsSelected}>
						<SelectionEventGridControls />
						<DefaultEventGridControls />
					</Match>
					<Match when={!areEventsSelected}>
						<DefaultEventGridControls />
					</Match>
				</Switch>
			</HStack>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: hstack.raw({
		padding: 2,
		minHeight: "80px",
		justify: "space-between",
		gap: 4,
		borderBlockWidth: "sm",
		borderColor: "border.muted",
		backdropFilter: "blur(4px)",
		userSelect: "none",
		overflowX: "auto",
		_scrollbar: { display: "none" },
	}),
});

export default EventGridControls;
