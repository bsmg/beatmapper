import type { LucideProps } from "lucide-react";
import type { ComponentType, PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { Text, Tooltip } from "$/components/ui/compositions";

interface Props extends PropsWithChildren {
	label: string;
	icon: ComponentType<LucideProps>;
}
function StatusBarIndicator({ label, icon: Icon, children }: Props) {
	return (
		<Tooltip render={() => label}>
			<Wrapper>
				<Icon size={12} />
				<Text fontFamily="monospace" fontSize={"14px"}>
					{children}
				</Text>
			</Wrapper>
		</Tooltip>
	);
}

const Wrapper = styled("div", {
	base: hstack.raw({
		cursor: "help",
		gap: 1,
	}),
});

export default StatusBarIndicator;
