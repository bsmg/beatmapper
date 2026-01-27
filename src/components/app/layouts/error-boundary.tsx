import { Presence } from "@ark-ui/react/presence";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

import { AnchorLink, Button, Clipboard, Heading } from "$/components/ui/compositions";
import { Container, Stack, styled, Text, Wrap } from "$:styled-system/jsx";

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
						<Text textStyle={"paragraph"}>{error.message}</Text>
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
								<Text textStyle={"paragraph"}>If this error was a false positive, you can click the following buttons to revalidate the route and retry any loader operations.</Text>
								<Wrap gap={1}>
									<Button variant="subtle" size="sm" onClick={() => reset()}>
										Reset
									</Button>
									<Button variant="subtle" size="sm" onClick={() => router.invalidate()}>
										Invalidate
									</Button>
								</Wrap>
							</Stack>
							<Text textStyle={"paragraph"}>
								If you're still encountering issues, please <AnchorLink href="https://github.com/bsmg/beatmapper/issues/new?template=bug.md">fill out a bug report</AnchorLink> on the repository.
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
