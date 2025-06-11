import { Presence } from "@ark-ui/react/presence";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

import { Container, Stack, Wrap, styled } from "$:styled-system/jsx";
import { Button, Heading, Text } from "$/components/ui/compositions";
import { Clipboard } from "$/components/ui/compositions/clipboard";
import { AnchorLink } from "$/components/ui/styled";

interface Props extends ErrorComponentProps {
	interactive?: boolean;
}
function ErrorBoundary({ error, interactive = true, reset }: Props) {
	const router = useRouter();

	return (
		<Wrapper>
			<Container>
				<Stack gap={3}>
					<Stack gap={2}>
						<Heading rank={1}>{error.name}</Heading>
						<Text>{error.message}</Text>
					</Stack>
					<Stack gap={2}>
						<Heading rank={3}>Stack Trace</Heading>
						{error.stack && (
							<Clipboard value={error.stack}>
								<StackWrapper>{error.stack}</StackWrapper>
							</Clipboard>
						)}
					</Stack>
					<Presence asChild present={interactive}>
						<Stack gap={3}>
							<Stack gap={1}>
								<Text>If this error was a false positive, you can click the following buttons to revalidate the route and retry any loader operations.</Text>
								<Wrap gap={1}>
									<Button variant="subtle" size="sm" onClick={() => reset()}>
										Reset
									</Button>
									<Button variant="subtle" size="sm" onClick={() => router.invalidate()}>
										Invalidate
									</Button>
								</Wrap>
							</Stack>
							<Text>
								If you're still encountering issues, please <AnchorLink href="https://github.com/bsmg/beatmapper/issues/new">fill out a bug report</AnchorLink> on the repository.
							</Text>
						</Stack>
					</Presence>
				</Stack>
			</Container>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	base: {
		paddingBlock: 4,
	},
});

const StackWrapper = styled("pre", {
	base: {
		padding: 2,
		colorPalette: "red",
		layerStyle: "fill.surface",
		fontFamily: "monospace",
		fontSize: "15px",
		overflowX: "auto",
	},
});

export default ErrorBoundary;
