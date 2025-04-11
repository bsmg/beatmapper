import { animated as a, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import { HStack } from "$:styled-system/jsx";
import { Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";
import Block from "../Block";

const noop = () => {};

interface Props {
	size?: "full" | "mini";
}
const Logo = ({ size = "full" }: Props) => {
	const [isHovering, setIsHovering] = useState(false);

	const spring = useSpring({
		rotation: isHovering ? 0 : -0.35,
		config: { tension: 200, friction: 50 },
	});

	return (
		<Link to="/" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
			<HStack gap={1}>
				<Canvas
					style={{
						width: size === "full" ? 50 : 30,
						height: size === "full" ? 50 : 30,
					}}
				>
					<a.group rotation-y={spring.rotation}>
						<Block x={0} y={0} z={2} direction={1} size={3} handleClick={noop} handleStartSelecting={noop} handleMouseOver={noop} />
					</a.group>

					<ambientLight intensity={0.85} />
					<directionalLight intensity={0.5} position={[0, 30, 8]} />
					<directionalLight intensity={0.1} position={[5, 0, 20]} />
					<directionalLight intensity={0.1} position={[-20, -10, 4]} />
				</Canvas>
				<Text color={"fg.default"} fontFamily={"'Raleway', sans-serif"} fontSize={size === "full" ? 24 : 18} fontWeight={"bold"}>
					Beatmapper
				</Text>
			</HStack>
		</Link>
	);
};

export default Logo;
