import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { HStack } from "$:styled-system/jsx";
import { Tooltip } from "$/components/ui/compositions";

interface Props {
	num: ReactNode;
	label: string;
	icon: ComponentType<LucideProps>;
}
const CountIndicator = ({ num, label, icon: Icon }: Props) => {
	return (
		<Tooltip render={() => label}>
			<HStack gap={1}>
				<Icon size={12} />
				<pre>{num}</pre>
			</HStack>
		</Tooltip>
	);
};

export default CountIndicator;
