import { Fragment } from "react";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";

import RadioButton from "../RadioButton";
import Spacer from "../Spacer";

interface Props {
	label: string;
	name: string;
	items: { label: string; value: string }[];
	currentValue: string;
	onChange: (value: string) => void;
}

const RadioSet = ({ label, name, items, currentValue, onChange }: Props) => {
	const stuff = items.map(({ label, value }) => {
		return (
			<Fragment key={value}>
				<ItemLabel>
					<RadioButton name={name} value={value} checked={value === currentValue} onChange={() => onChange(value)} />
					{label}
				</ItemLabel>
				<Spacer size={UNIT * 3} />
			</Fragment>
		);
	});

	return (
		<Fragment>
			<LabelText>{label}</LabelText>
			<Row>{stuff}</Row>
		</Fragment>
	);
};

const Row = styled.div`
  display: flex;
`;

const LabelText = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: ${COLORS.gray[100]};
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
`;

const ItemLabel = styled.label``;

export default RadioSet;
