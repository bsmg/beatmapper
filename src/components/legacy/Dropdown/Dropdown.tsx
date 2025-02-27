import { type ChangeEventHandler, Children, Fragment, type PropsWithChildren, type ReactElement } from "react";
import { Icon } from "react-icons-kit";
import { chevronDown } from "react-icons-kit/feather/chevronDown";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Spacer from "../Spacer";

interface Props extends PropsWithChildren {
	label: string;
	value: string | number;
	onChange: ChangeEventHandler<HTMLSelectElement>;
	width: number;
	height?: number;
	disabled?: boolean;
}

const Dropdown = ({ label, value, onChange, width, height = 36, disabled, children }: Props) => {
	// So, we receive a `value` which isn't meant to be human-readable, like `0.5`.
	// We also have a set of children, <option>s, which have props for value (0.5) and children (1/2 Beat).
	// Find the display text by matching against the children's values, and use the labels found in `children`.
	// HACK: This is a weird pattern, and it should probably be redone.
	const selectedChild = Children.toArray(children).find((child) => {
		return (child as ReactElement).props.value === value;
	}) as ReactElement;

	if (!selectedChild) {
		console.error("Could not find child with value", value, children);
	}

	const displayedValue = selectedChild ? selectedChild.props["when-selected"] : "Error";

	return (
		<Wrapper
			style={{
				width,
				height,
				lineHeight: height,
				opacity: disabled ? 0.35 : 1,
			}}
		>
			{label && (
				<Fragment>
					<Label>{label}</Label>
					<Spacer size={6} />
				</Fragment>
			)}
			<Value>
				<DisplayedValue>{displayedValue}</DisplayedValue>
				<Caret>
					<Icon icon={chevronDown} size={16} />
				</Caret>
			</Value>
			<Select
				value={value}
				disabled={disabled}
				onChange={(ev) => {
					onChange(ev);

					ev.target.blur();
				}}
			>
				{children}
			</Select>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 ${token.var("spacing.1")};
  border-radius: ${token.var("spacing.1")};
  font-size: 14px;
  user-select: none;
  /* The invisible <select> can get quite tall for some reason. Truncate it. */
  overflow: hidden;

  &:hover {
    background: ${token.var("colors.gray.700")};
  }
`;

const Select = styled.select`
  opacity: 0;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const Label = styled.div`
  color: ${token.var("colors.gray.300")};
`;

const Value = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: space-between;
`;

const Caret = styled.div`
  color: ${token.var("colors.gray.300")};
`;

const DisplayedValue = styled.div`
  color: #fff;
`;

export default Dropdown;
