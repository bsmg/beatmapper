import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import BaseLink from "../BaseLink";

export default styled(BaseLink)`
  color: ${token.var("colors.yellow.500")};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
