import type { PropsWithChildren, ReactNode } from "react";

import { VStack } from "$:styled-system/jsx";
import { Heading } from "$/components/ui/compositions";

interface Props extends PropsWithChildren {
	label: ReactNode;
}
function ActionPanelGroup({ label, children }: Props) {
	return (
		<VStack gap={1.5}>
			<Heading rank={3}>{label}</Heading>
			<VStack gap={2}>{children}</VStack>
		</VStack>
	);
}

export default ActionPanelGroup;
