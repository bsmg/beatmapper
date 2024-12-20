import type { ComponentProps } from "react";
import { Icon } from "react-icons-kit";
import { x as checkedIcon } from "react-icons-kit/feather/x";
import styled from "styled-components";

interface Props extends ComponentProps<"input"> {}

const Checkbox = ({ checked, onChange, ...delegated }: Props) => {
	return (
		<Wrapper>
			<RealCheckbox checked={checked} onChange={onChange} {...delegated} type="checkbox" />
			<FakeCheckbox>
				<CheckIcon icon={checkedIcon} size={16} style={{ opacity: checked ? 1 : 0 }} />
			</FakeCheckbox>
		</Wrapper>
	);
};

const Wrapper = styled.span`
  position: relative;
  display: inline-block;
  margin: 6px;
`;

const RealCheckbox = styled.input`
  position: absolute;
  z-index: 2;
  opacity: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
`;

const FakeCheckbox = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;

  svg {
    display: block !important;
  }
`;

const CheckIcon = styled(Icon)`
  transition: opacity 100ms;
`;

export default Checkbox;
