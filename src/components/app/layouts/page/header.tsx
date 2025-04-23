import { Link } from "@tanstack/react-router";
import { DotIcon } from "lucide-react";

import { stack } from "$:styled-system/patterns";

import { Container, styled } from "$:styled-system/jsx";
import { Logo } from "$/components/app/compositions";
import { Interleave } from "$/components/ui/atoms";
import { Text } from "$/components/ui/compositions";

function EditorPageHeader() {
	return (
		<Wrapper>
			<InnerWrapper>
				<SectionWrapper>
					<Logo />
				</SectionWrapper>
				<SectionWrapper>
					<Interleave separator={({ index }) => <DotIcon key={index} />}>
						<Text asChild textStyle={"link"}>
							<Link to="/docs/$" params={{ _splat: "intro" }}>
								Documentation
							</Link>
						</Text>
					</Interleave>
				</SectionWrapper>
			</InnerWrapper>
		</Wrapper>
	);
}

const Wrapper = styled("header", {
	base: {
		minHeight: "header",
		backgroundColor: "bg.default",
		borderBottomWidth: "sm",
		borderColor: "border.default",
		paddingBlock: 1.5,
		paddingBlockEnd: { mdDown: 3 },
	},
});

const InnerWrapper = styled(Container, {
	base: stack.raw({
		direction: { base: "column", md: "row" },
		align: "center",
		justify: "space-between",
		gap: { base: 2, md: 1 },
	}),
});

const SectionWrapper = styled("div", {
	base: stack.raw({
		gap: 1,
		justify: { base: "start", _last: "end" },
		align: { base: "center", md: { base: "start", _last: "end" } },
	}),
});

export default EditorPageHeader;
