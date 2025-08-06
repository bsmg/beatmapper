import type { LucideProps } from "lucide-react";
import { type CSSProperties, useMemo } from "react";

interface Props extends LucideProps {
	color?: string;
}

function ObstacleIcon({ color, size }: Props) {
	const style = useMemo(() => ({ "--color": color }) as CSSProperties, [color]);

	const palette = useMemo(
		() => ({
			fill: "color-mix(in srgb, var(--color), black 37.5%)",
			edge: "color-mix(in srgb, var(--color), white 75%)",
			distortion: "color-mix(in srgb, var(--color), white 25%)",
		}),
		[],
	);

	return (
		<svg role="presentation" width={`calc(${size} * 1.25)`} height={`calc(${size} * 1.5)`} fill="none" viewBox="0 0 43 31" style={style}>
			<mask id="prefix__a" fill="#fff">
				<rect x={1} y={1} width={36} height={24} rx={1} />
			</mask>
			<rect x={1} y={1} width={36} height={24} rx={1} fill={palette.fill} fillOpacity={0.62} stroke={palette.edge} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" mask="url(#prefix__a)" />
			<g filter="url(#prefix__filter0_f)">
				<path d="M28.5 2l-2 2.5L18 6l7.5 4 7.5 1.5-2.5 9 4-3.5 4.5 1.5" stroke={palette.distortion} />
			</g>
			<path d="M8 30h34l-5.5-5.5h-35L8 30z" fill={palette.fill} fillOpacity={0.62} stroke={palette.edge} strokeWidth={2} strokeLinejoin="round" />
			<path d="M8 30V8L1.5 1.5v23L8 30zM42 30V8l-5.5-6.5v23L42 30z" fill={palette.fill} fillOpacity={0.62} stroke={palette.edge} strokeWidth={2} strokeLinejoin="round" />
			<path d="M42 8l-5.5-6.5h-35L8 8h34z" fill={palette.fill} fillOpacity={0.62} stroke={palette.edge} strokeWidth={2} strokeLinejoin="round" />
			<mask id="prefix__b" fill="#fff">
				<rect x={7} y={7} width={36} height={24} rx={1} />
			</mask>
			<rect x={7} y={7} width={36} height={24} rx={1} fill={palette.fill} fillOpacity={0.62} stroke={palette.edge} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" mask="url(#prefix__b)" />
			<path d="M13.5 8l1.5 3.5h4l1 3.5 3.5-.5m4.5 3l-3.5 2 1-6-2 1m0 0l-4.5 4m-2.5 6L12 21l.5 5.5-4.5-2-3-7L3 16" stroke={palette.distortion} />
			<defs>
				<filter id="prefix__filter0_f" x={15.486} y={0.688} width={24.672} height={22.29} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity={0} result="BackgroundImageFix" />
					<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
					<feGaussianBlur stdDeviation={0.5} result="effect1_foregroundBlur" />
				</filter>
			</defs>
		</svg>
	);
}

export default ObstacleIcon;
