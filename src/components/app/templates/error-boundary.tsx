import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

import { Show } from "$/components/ui/atoms";
import { AnchorLink, Button, Clipboard, Heading } from "$/components/ui/compositions";
import { css } from "$:styled-system/css";
import { Container, Float, Stack, styled, Text, Wrap } from "$:styled-system/jsx";

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
							<StackWrapper>
								{error.stack}
								<Float placement="top-end" offset={"2"} className={css({ position: "sticky", alignSelf: "flex-start" })}>
									<Clipboard value={error.stack}>
										{(Indicator) => (
											<Button variant="subtle" size="icon" colorPalette="red">
												<Indicator size={18} />
											</Button>
										)}
									</Clipboard>
								</Float>
							</StackWrapper>
						)}
					</Stack>
					<Show when={interactive}>
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
					</Show>
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
		position: "relative",
		display: "flex",
		padding: 2,
		colorPalette: "red",
		layerStyle: "fill.surface",
		fontFamily: "monospace",
		fontSize: "15px",
		overflowX: "auto",
	},
});

export default ErrorBoundary;
