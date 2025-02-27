import type { CSSProperties, ComponentProps } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

interface Props extends ComponentProps<"button"> {
	display?: CSSProperties["display"];
}

export default styled.button<Props>`
  display: ${(props) => props.display || "block"};
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;

  &:focus {
    outline: 2px solid ${token.var("colors.pink.500")};
    outline-offset: 2px;
  }

  &:focus:not(.focus-visible) {
    outline: none;
  }
`;
