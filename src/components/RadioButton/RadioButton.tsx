import type { ComponentProps } from "react";
import styled from "styled-components";

interface Props extends ComponentProps<"input"> {}

const RadioButton = ({ name, value, checked, onChange, ...delegated }: Props) => {
	return (
		<Wrapper>
			<RealRadioButton name={name} value={value} onChange={onChange} {...delegated} type="radio" />
			<FakeRadio>
				<Dot style={{ transform: `scale(${checked ? 1 : 0})` }} />
			</FakeRadio>
		</Wrapper>
	);
};

const Wrapper = styled.span`
  position: relative;
  display: inline-block;
  margin: 6px;
  margin-left: 0;
`;

const RealRadioButton = styled.input`
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

const FakeRadio = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;

  svg {
    display: block !important;
  }
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  background: rgba(0, 0, 0, 1);
  border-radius: 50%;
  transition: transform 100ms;
`;

export default RadioButton;
