import type { LucideProps } from "lucide-react";
import type { ComponentType, MouseEventHandler } from "react";

import { Button } from "$/components/ui/compositions";
import { styled } from "$:styled-system/jsx";

interface Props {
	icon: ComponentType<LucideProps>;
	onClick: MouseEventHandler;
	size?: number;
	opacity?: number;
	disabled?: boolean;
}
function StatusBarIcon({ icon: Icon, onClick, size = 16, disabled }: Props) {
	return (
		<Wrapper unfocusOnClick disabled={disabled} onClick={onClick}>
			<Icon size={size} />
		</Wrapper>
	);
}

const Wrapper = styled(Button, {
	base: {
		opacity: { base: 1, _disabled: "disabled" },
	},
});

export default StatusBarIcon;
