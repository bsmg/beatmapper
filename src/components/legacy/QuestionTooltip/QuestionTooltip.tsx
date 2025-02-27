import { HelpCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

interface Props extends ComponentProps<typeof Tooltip> {}

const QuestionTooltip = ({ children, ...delegated }: Props) => {
	return (
		<Wrapper>
			<Tooltip interactive html={<HelpWrapper>{children}</HelpWrapper>} {...delegated}>
				<IconWrapper>
					<HelpCircleIcon size={14} />
				</IconWrapper>
			</Tooltip>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: inline;
  font-size: inherit;
  color: inherit;
`;

const HelpWrapper = styled.div`
  max-width: 150px;
  line-height: 1.4;
`;

const IconWrapper = styled.div`
  opacity: 0.4;
  padding-left: 0.5rem;
`;

export default QuestionTooltip;
