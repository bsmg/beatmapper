import type { LucideProps } from "lucide-react";
import { type CSSProperties, useMemo } from "react";

function BlockIcon({ color, size = 16 }: LucideProps) {
	const style = useMemo(() => ({ "--color": color }) as CSSProperties, [color]);

	return (
		<svg role="presentation" viewBox="0 0 12 12" width={size} height={size} style={style}>
			<rect width="12" height="12" rx={3} ry={3} fill="var(--color)" />
			<path d="M1.5,2.5 L10.5,2.5 L6,6 Z" fill="white" />
		</svg>
	);
}

export default BlockIcon;
