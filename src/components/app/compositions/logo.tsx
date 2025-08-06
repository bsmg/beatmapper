import { animated as a, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";
import { Link } from "@tanstack/react-router";
import { createColorNote, NoteDirection } from "bsmap";
import type { EnvironmentAllName } from "bsmap/types";
import { type DateArg, endOfMonth, endOfWeek, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useRef, useState } from "react";

import { ColorNote } from "$/components/scene/compositions";
import { deriveColorSchemeFromEnvironment } from "$/helpers/colors.helpers";
import { HStack, Stack, styled } from "$:styled-system/jsx";

const MOCK_NOTE = createColorNote({ direction: NoteDirection.DOWN });

function checkDate(date: `${number}/${number}`, start: (date: DateArg<Date>) => Date, end: (date: DateArg<Date>) => Date) {
	const today = new Date();
	return isWithinInterval(today, { start: start(`${date}/${today.getFullYear()}`), end: end(`${date}/${today.getFullYear()}`) });
}

function deriveNoteColor() {
	let environment: EnvironmentAllName = "DefaultEnvironment" as const;
	if (checkDate("06/01", startOfMonth, endOfMonth)) environment = "GagaEnvironment";
	if (checkDate("10/31", startOfWeek, endOfWeek)) environment = "HalloweenEnvironment";
	const { colorLeft, colorRight } = deriveColorSchemeFromEnvironment(environment);
	if (import.meta.env.DEV) return colorRight;
	return colorLeft;
}

interface Props {
	size?: "full" | "mini";
}
function Logo({ size = "full" }: Props) {
	const [isHovering, setIsHovering] = useState(false);
	const color = useRef(deriveNoteColor());

	const [spring] = useSpring(() => ({ rotation: isHovering ? 0 : -0.35 }), [isHovering]);

	const styles = useMemo(() => {
		return {
			width: size === "full" ? 50 : 30,
			height: size === "full" ? 50 : 30,
		};
	}, [size]);

	return (
		<Link to="/" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
			<HStack gap={1}>
				<Canvas style={styles}>
					<a.group rotation-y={spring.rotation}>
						<ColorNote position={[0, 0, 2]} data={MOCK_NOTE} color={color.current} size={3} />
					</a.group>
					<ambientLight intensity={1.5} />
					<directionalLight intensity={0.5} position={[0, 30, 8]} />
					<directionalLight intensity={0.125} position={[5, 0, 20]} />
					<directionalLight intensity={0.125} position={[-20, -10, 4]} />
				</Canvas>
				<Stack gap={0.5}>
					<Title size={size}>Beatmapper</Title>
					<Subtitle size={size}>{version}</Subtitle>
				</Stack>
			</HStack>
		</Link>
	);
}

const Title = styled("span", {
	base: {
		color: "fg.default",
		fontFamily: "logo",
		fontWeight: "bold",
	},
	variants: {
		size: {
			mini: { fontSize: "18px" },
			full: { fontSize: "24px" },
		},
	},
});

const Subtitle = styled("span", {
	base: {
		color: "fg.muted",
		fontFamily: "body",
		fontWeight: "medium",
	},
	variants: {
		size: {
			mini: { display: "none" },
			full: { fontSize: "12px" },
		},
	},
});

export default Logo;
