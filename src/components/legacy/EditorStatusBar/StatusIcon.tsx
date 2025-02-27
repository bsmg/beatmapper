import type { LucideProps } from "lucide-react";
import type { ComponentType, MouseEventHandler } from "react";
import styled from "styled-components";

import UnfocusedButton from "../UnfocusedButton";

interface Props {
	icon: ComponentType<LucideProps>;
	onClick: MouseEventHandler;
	size?: number;
	opacity?: number;
	disabled?: boolean;
}

const StatusIcon = ({ icon: Icon, onClick, size = 16, opacity = 1, disabled }: Props) => (
	<Wrapper
		onClick={disabled ? undefined : onClick}
		style={{
			opacity: disabled ? 0.4 : opacity,
			cursor: disabled ? "not-allowed" : "pointer",
		}}
	>
		<Icon size={size} />
	</Wrapper>
);
const Wrapper = styled(UnfocusedButton)`
  color: inherit;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

export default StatusIcon;
