import { Container, HStack, styled } from "$:styled-system/jsx";
import { center, stack } from "$:styled-system/patterns";
import { Interleave } from "$/components/ui/atoms";
import { Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";
import { DotIcon } from "lucide-react";
import Logo from "../Logo";

const Footer = () => {
	return (
		<Wrapper>
			<InnerWrapper>
				<SectionWrapper>
					<Logo size="mini" />
					<HStack gap={0}>
						<Interleave separator={() => <DotIcon />}>
							<Text textStyle={"link"} color={"fg.default"}>
								<Link to="/docs/$" params={{ _splat: "privacy" }}>
									Privacy
								</Link>
							</Text>
							<Text textStyle={"link"} color={"fg.default"}>
								<Link to="/docs/$" params={{ _splat: "content-policy" }}>
									Content Policy
								</Link>
							</Text>
						</Interleave>
					</HStack>
				</SectionWrapper>
				<SectionWrapper>
					<div>
						A side-project by <ExternalLink href="https://twitter.com/JoshWComeau">Josh Comeau</ExternalLink>. Maintained by <ExternalLink href="https://bsmg.wiki/">BSMG</ExternalLink>.
					</div>
					<div>© 2019-present, All rights reserved.</div>
					<Text color={"fg.subtle"} fontSize={"14px"}>
						Not affiliated with Beat Games™ or Beat Saber™.
					</Text>
				</SectionWrapper>
			</InnerWrapper>
		</Wrapper>
	);
};

const Wrapper = styled("footer", {
	base: center.raw({
		width: "100%",
		minHeight: "footer",
		fontSize: "14px",
		fontWeight: 300,
		backgroundColor: "bg.default",
		color: "fg.muted",
		borderTopWidth: "sm",
		borderColor: "border.default",
	}),
});

const InnerWrapper = styled(Container, {
	base: stack.raw({
		width: "100%",
		direction: { base: "column", md: "row" },
		justify: "space-between",
		gap: { base: 2, md: 1 },
		paddingBlock: 1.5,
	}),
});

const SectionWrapper = styled("div", {
	base: stack.raw({
		gap: 1,
		justify: { base: "start", _last: "end" },
		align: { base: "center", md: { base: "start", _last: "end" } },
	}),
});

const ExternalLink = styled("a", {
	base: {
		textStyle: "link",
		color: "fg.default",
	},
});

export default Footer;
