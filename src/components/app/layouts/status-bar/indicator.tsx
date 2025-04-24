import type { LucideProps } from "lucide-react";
import type { ComponentType, PropsWithChildren } from "react";

import { HStack } from "$:styled-system/jsx";
import { Text, Tooltip } from "$/components/ui/compositions";

interface Props extends PropsWithChildren {
	label: string;
	icon: ComponentType<LucideProps>;
}
function StatusBarIndicator({ label, icon: Icon, children }: Props) {
	return (
		<Tooltip render={() => label}>
			<HStack gap={1}>
				<Icon size={12} />
				<Text fontFamily="monospace" fontSize={"14px"}>
					{children}
				</Text>
			</HStack>
		</Tooltip>
	);
}

export default StatusBarIndicator;
