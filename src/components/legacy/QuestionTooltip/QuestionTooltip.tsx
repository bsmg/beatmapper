import { HelpCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { styled } from "$:styled-system/jsx";
import { Tooltip } from "$/components/ui/compositions";

interface Props extends Omit<ComponentProps<typeof Tooltip>, "render"> {}

const QuestionTooltip = ({ children, ...rest }: Props) => {
	return (
		<Tooltip {...rest} interactive render={() => children}>
			<IconWrapper>
				<HelpCircleIcon size={14} />
			</IconWrapper>
		</Tooltip>
	);
};

const IconWrapper = styled("div", {
	base: {
		paddingLeft: "0.5rem",
		color: "fg.muted",
		cursor: "help",
	},
});

export default QuestionTooltip;
