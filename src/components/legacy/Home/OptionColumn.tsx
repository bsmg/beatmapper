import type { LucideProps } from "lucide-react";
import type { ComponentType, PropsWithChildren } from "react";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";
import { Heading, Text } from "$/components/ui/compositions";

interface Props extends PropsWithChildren {
	icon: ComponentType<LucideProps>;
	title: string;
	description: string;
}
const OptionColumn = ({ icon: Icon, title, description, children }: Props) => {
	return (
		<Wrapper>
			<VStack gap={2}>
				<Icon size={24} />
				<Title rank={3}>{title}</Title>
				<Text>{description}</Text>
			</VStack>
			{children}
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: vstack.raw({
		gap: 4,
		flex: 1,
		textAlign: "center",
		color: "fg.muted",
		minWidth: "250px",
	}),
});

const Title = styled(Heading, {
	base: {
		color: "fg.default",
	},
});

export default OptionColumn;
