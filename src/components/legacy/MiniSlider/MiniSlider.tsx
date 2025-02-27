import type { ComponentProps } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

interface Props extends ComponentProps<"input"> {
	includeMidpointTick?: boolean;
}

const MiniSlider = ({ width, height, style = {}, includeMidpointTick, ...delegated }: Props) => {
	return (
		<Wrapper style={{ width, height }}>
			{includeMidpointTick && <Tick />}
			<Input type="range" style={{ width, height, ...style }} {...delegated} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
`;

const Tick = styled.div`
  position: absolute;
  z-index: 0;
  width: 1px;
  height: 16px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::before,
  &::after {
    content: '';
    height: 4px;
    background: ${token.var("colors.slate.400")};
  }
`;

const Input = styled.input`
  position: relative;
  z-index: 1;
  margin: 0;
  background: transparent;
  -webkit-appearance: none;

  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed !important;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    animate: 0.2s;
    box-shadow: 0px 0px 1px ${token.var("colors.slate.700")};
    background: ${token.var("colors.slate.400")};
    border-radius: 5px;
    border: 0px solid ${token.var("colors.slate.700")};
  }
  &::-webkit-slider-thumb {
    box-shadow: 0px 0px 0px ${token.var("colors.slate.700")};
    border: 2px solid ${token.var("colors.slate.700")};
    height: 12px;
    width: 12px;
    border-radius: 12px;
    background: #ffffff;
    -webkit-appearance: none;
    margin-top: -5px;
  }
  &::-moz-range-track {
    width: 100%;
    height: 3px;
    animate: 0.2s;
    background: #ffffff;
    border-radius: 5px;
    border: 0px solid ${token.var("colors.slate.700")};
  }
  &::-moz-range-thumb {
    box-shadow: 0px 0px 0px ${token.var("colors.slate.700")};
    border: 2px solid ${token.var("colors.slate.700")};
    height: 12px;
    width: 12px;
    border-radius: 12px;
    background: #ffffff;
  }
  &::-ms-track {
    width: 100%;
    height: 3px;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
`;

export default MiniSlider;
