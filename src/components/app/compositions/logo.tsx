import { animated as a, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";
import { Link, useRouteContext } from "@tanstack/react-router";
import { createColorNote, NoteDirection } from "bsmap";
import type { EnvironmentAllName } from "bsmap/types";
import { getYear, isThisMonth, isThisWeek, setYear } from "date-fns";
import { useMemo, useRef, useState } from "react";

import { ColorNote } from "$/components/scene/compositions";
import { deriveColorSchemeFromEnvironment } from "$/helpers/colors.helpers";
import { HStack, Stack, styled } from "$:styled-system/jsx";

const MOCK_NOTE = createColorNote({ direction: NoteDirection.DOWN });

function deriveNoteColor(now: number) {
	let environment: EnvironmentAllName = "DefaultEnvironment" as const;

	if (isThisMonth(setYear("06/01", getYear(now)))) {
		environment = "GagaEnvironment";
	}
	if (isThisWeek(setYear("10/31", getYear(now)))) {
		environment = "HalloweenEnvironment";
	}

	const { colorLeft, colorRight } = deriveColorSchemeFromEnvironment(environment);
	return import.meta.env.DEV ? colorRight : colorLeft;
}

interface Props {
	size?: "full" | "mini";
}
function Logo({ size = "full" }: Props) {
	const { now } = useRouteContext({ from: "__root__" });

	const [isHovering, setIsHovering] = useState(false);

	const color = useRef(deriveNoteColor(now));

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
						<ColorNote position={[0, 0, 2]} scale={3} data={MOCK_NOTE} color={color.current} />
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
		fontWeight: "normal",
	},
	variants: {
		size: {
			mini: { display: "none" },
			full: { fontSize: "12px" },
		},
	},
});

export default Logo;
