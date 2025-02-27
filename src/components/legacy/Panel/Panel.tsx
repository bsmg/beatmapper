import styled from "styled-components";

import { token } from "$:styled-system/tokens";

const Panel = styled.div`
  background: ${token.var("colors.gray.700")};
  padding: ${token.var("spacing.1")};
  border-radius: 4px;
`;

export default Panel;
