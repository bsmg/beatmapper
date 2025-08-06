import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Text, Tooltip } from "$/components/ui/compositions";
import { styled } from "$:styled-system/jsx";
import { center, linkOverlay } from "$:styled-system/patterns";

const TOOLTIP_POSITIONING = { placement: "right" } as const;

interface Props {
	icon: ComponentType<LucideProps>;
	tooltip?: string;
	active?: boolean;
	children: (icon: ReactNode) => ReactNode;
}
function AppSidebarNavItem({ icon: Icon, tooltip, active, children, ...delegated }: Props) {
	return (
		<Tooltip disabled={!tooltip} render={() => <Text fontWeight={400}>{tooltip}</Text>} positioning={TOOLTIP_POSITIONING}>
			<Wrapper>
				<ActiveIndicator data-active={active} />
				<Contents data-active={active} {...delegated}>
					{children(
						<Overlay>
							<Icon size={20} />
						</Overlay>,
					)}
				</Contents>
			</Wrapper>
		</Tooltip>
	);
}

const Wrapper = styled("div", {
	base: {
		position: "relative",
		boxSize: "40px",
		cursor: "pointer",
	},
});

const ActiveIndicator = styled("div", {
	base: {
		position: "absolute",
		insetBlock: "4px",
		left: -1,
		width: "4px",
		colorPalette: "pink",
		backgroundColor: "colorPalette.700",
		borderRightRadius: "md",
		transitionProperty: "transform",
		transitionDuration: "fast",
		transform: { base: "translateX(-4px)", _active: "translateX(0)" },
	},
});

const Contents = styled("div", {
	base: center.raw({
		position: "absolute",
		inset: 0,
		borderRadius: "full",
		backgroundColor: { _hover: "bg.ghost" },
	}),
});

const Overlay = styled("div", {
	base: linkOverlay.raw(),
});

export default AppSidebarNavItem;
