import { animated as a, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { HStack, styled } from "$:styled-system/jsx";
import Block from "../../legacy/Block";

interface Props {
	size?: "full" | "mini";
}
function Logo({ size = "full" }: Props) {
	const [isHovering, setIsHovering] = useState(false);

	const spring = useSpring({
		rotation: isHovering ? 0 : -0.35,
		config: { tension: 200, friction: 50 },
	});

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
						<Block x={0} y={0} z={2} direction={1} size={3} />
					</a.group>

					<ambientLight intensity={0.85} />
					<directionalLight intensity={0.5} position={[0, 30, 8]} />
					<directionalLight intensity={0.1} position={[5, 0, 20]} />
					<directionalLight intensity={0.1} position={[-20, -10, 4]} />
				</Canvas>
				<Title size={size}>Beatmapper</Title>
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

export default Logo;
