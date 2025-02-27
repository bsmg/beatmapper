import type { ComponentProps, ReactNode } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import QuestionTooltip from "../QuestionTooltip";

interface Props extends ComponentProps<"input"> {
	label: ReactNode;
	moreInfo?: string;
}

const TextInput = ({ label, required, moreInfo, ...delegated }: Props) => {
	return (
		<Label>
			<LabelText>
				<span>
					{label}
					{required && <Asterisk />}
				</span>
				{moreInfo && <QuestionTooltip>{moreInfo}</QuestionTooltip>}
			</LabelText>
			<Input required={required} {...delegated} />
		</Label>
	);
};

const Input = styled.input`
  width: 100%;
  height: 36px;
  padding: 0;
  /* border-radius: 6px; */
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  font-size: 16px;
  outline: none;

  &:focus {
    border-bottom: 2px solid ${token.var("colors.pink.500")};
  }

  ::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    color: ${token.var("colors.slate.500")};
  }
`;

const Label = styled.label`
  display: block;
`;

const LabelText = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: ${token.var("colors.gray.100")};
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
`;

const Asterisk = styled.span`
  display: inline-block;
  color: ${token.var("colors.red.300")};
  padding-left: 4px;

  &:before {
    content: '*';
  }
`;

export default TextInput;
