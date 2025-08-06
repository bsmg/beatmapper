import type { PropsWithChildren, ReactNode } from "react";

import { Heading } from "$/components/ui/compositions";
import { VStack } from "$:styled-system/jsx";

interface Props extends PropsWithChildren {
	label: ReactNode;
}
function ActionPanelGroupRoot({ label, children }: Props) {
	return (
		<VStack gap={1.5}>
			<Heading rank={3}>{label}</Heading>
			<VStack gap={2}>{children}</VStack>
		</VStack>
	);
}

export default ActionPanelGroupRoot;
