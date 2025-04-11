import type { LucideProps } from "lucide-react";
import { type CSSProperties, useMemo } from "react";

interface Props extends LucideProps {}

function BlockIcon({ color, size = 16 }: Props) {
	const style = useMemo(() => ({ "--color": color }) as CSSProperties, [color]);

	return (
		<svg viewBox="0 0 12 12" width={size} height={size} style={style}>
			<rect width="12" height="12" rx={3} ry={3} fill="var(--color)" />
			<path id="arrow" d="M1.5,2.5 L10.5,2.5 L6,6 Z" fill="white" />
		</svg>
	);
}

export default BlockIcon;
