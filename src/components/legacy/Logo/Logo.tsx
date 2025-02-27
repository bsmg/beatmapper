import { animated as a, useSpring } from "@react-spring/three";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import BaseLink from "../BaseLink";
import Block from "../Block";
import Spacer from "../Spacer";

const noop = () => {};

interface Props {
	size?: "full" | "mini";
	color?: string;
}

const Logo = ({ size = "full", color = "#FFF" }: Props) => {
	const [isHovering, setIsHovering] = useState(false);

	const spring = useSpring({
		rotation: isHovering ? 0 : -0.35,
		config: { tension: 200, friction: 50 },
	});

	return (
		<Wrapper to="/" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
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
			<Spacer size={token.var("spacing.1")} />
			<Text style={{ fontSize: size === "full" ? 24 : 18, color }}>Beatmapper</Text>
		</Wrapper>
	);
};

const Wrapper = styled(BaseLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const Text = styled.div`
  font-size: 24px;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
`;

export default Logo;
