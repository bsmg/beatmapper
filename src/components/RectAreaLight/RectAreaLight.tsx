import { useEffect, useState } from "react";
import { RectAreaLight, type Vector3Tuple } from "three";
import { RectAreaLightHelper } from "three-stdlib";

interface Props {
	color?: string;
	intensity?: number;
	width?: number;
	height?: number;
	position?: Vector3Tuple;
	lookAt?: Vector3Tuple;
}

const RectAreaLightComponent = ({ color = "#FFFFFF", intensity = 10, width = 1, height = 1, position = [0, 0, -5] as const, lookAt = [0, 0, 0] as const }: Props) => {
	const [light] = useState(() => new RectAreaLight(color, intensity, width, height));
	const [helper] = useState(() => new RectAreaLightHelper(light));

	useEffect(() => {
		if (light) {
			light.add(helper);
		}
	}, [light, helper]);

	useEffect(() => {
		if (light) {
			light.position.set(...position);
			light.lookAt(...lookAt);
		}
	});

	return light && <primitive object={light} />;
};

export default RectAreaLightComponent;
