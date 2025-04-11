import type { PropsWithChildren } from "react";

import { VStack } from "$:styled-system/jsx";
import { Heading, Text } from "$/components/ui/compositions";

interface Props extends PropsWithChildren {
	label: string;
}

const LabeledNumber = ({ label, children }: Props) => {
	return (
		<VStack gap={0}>
			<Heading rank={4}>{label}</Heading>
			<Text color={"fg.default"} fontFamily={"monospace"}>
				{children}
			</Text>
		</VStack>
	);
};

export default LabeledNumber;
