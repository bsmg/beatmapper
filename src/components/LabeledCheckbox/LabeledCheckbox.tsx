import type { ComponentProps } from "react";
import styled from "styled-components";

import Checkbox from "../Checkbox";

interface Props extends ComponentProps<typeof Checkbox> {}

const LabeledCheckbox = ({ id, checked, onChange, children }: Props) => {
	return (
		<Row>
			<Checkbox id={id} checked={checked} onChange={onChange} />
			<Label htmlFor={id}>{children}</Label>
		</Row>
	);
};

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export default LabeledCheckbox;
