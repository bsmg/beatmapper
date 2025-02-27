import styled from "styled-components";

import { token } from "$:styled-system/tokens";

export default styled.hr`
  background: ${token.var("colors.slate.200")};
  border: none;
  height: 1px;
  margin: 25px 0;
`;
