import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";
import { Tooltip } from "$/components/ui/compositions";

interface Props {
	tooltip?: string;
	active?: boolean;
	icon: ComponentType<LucideProps>;
	children: (icon: ReactNode) => ReactNode;
}

const tooltipPositioning = { placement: "right" } as const;

const SidebarNavItem = ({ active, tooltip, icon: Icon, children: render, ...delegated }: Props) => {
	return (
		<Tooltip disabled={!tooltip} render={() => tooltip} positioning={tooltipPositioning}>
			<Wrapper>
				<ActiveIndicator data-active={active} />
				<LinkElem data-active={active} {...delegated}>
					{render(<Icon size={20} />)}
				</LinkElem>
			</Wrapper>
		</Tooltip>
	);
};

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

const Wrapper = styled("div", {
	base: {
		position: "relative",
		boxSize: "40px",
		cursor: "pointer",
	},
});

const LinkElem = styled("div", {
	base: center.raw({
		position: "absolute",
		inset: 0,
		borderRadius: "full",
		backgroundColor: { _hover: "bg.ghost" },
	}),
});

export default SidebarNavItem;
