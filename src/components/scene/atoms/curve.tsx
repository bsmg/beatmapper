import type { Assign } from "@ark-ui/react";
import { type ComponentProps, useMemo } from "react";
import { Color, type CurvePath, type Vector3 } from "three";

import { SONG_OFFSET } from "$/components/scene/constants";

const ARC_VERT_SHADER = `
	varying vec2 vUv;
	varying float vZ;
	varying vec3 vWorldPosition;

	void main() {
  vUv = uv;
  vZ = position.z;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
	}
`;

const ARC_FRAG_SHADER = `
	varying vec2 vUv;
	varying float vZ;
	varying vec3 vWorldPosition;

	uniform vec3 uColor;
	uniform vec3 uEmissive;
	uniform float uEmissiveIntensity;
	uniform float uProgress;
	uniform float uPassedOpacity;
	uniform float uActiveOpacity;
	uniform float uStartZ;
	uniform float uEndZ;
	uniform float uSurfaceDepth;

	void main() {
  float span = uEndZ - uStartZ;
  float linearPos = abs(span) > 1e-6
    ? clamp((vZ - uStartZ) / span, 0.0, 1.0) : clamp(vUv.x, 0.0, 1.0);

  bool isPassed = (uProgress > 0.0) && (linearPos <= uProgress);
  float alpha = isPassed ? uPassedOpacity : uActiveOpacity;

  float depthDistance = abs(vWorldPosition.z);
  if (depthDistance > uSurfaceDepth) {
    alpha = min(alpha, uPassedOpacity);
  }

  vec3 finalColor = uColor + uEmissive * uEmissiveIntensity;
  gl_FragColor = vec4(finalColor, alpha);
	}
`;

interface Props {
	path: CurvePath<Vector3>;
	segments?: number;
	color: string;
	selected?: boolean;
	progress: number;
	passedOpacity: number;
	activeOpacity: number;
	startZ: number;
	endZ: number;
	surfaceDepth?: number;
}
export function ArcCurve({ path, segments, color, selected = false, progress, passedOpacity, activeOpacity, startZ, endZ, surfaceDepth = Number.POSITIVE_INFINITY, ...rest }: Assign<ComponentProps<"mesh">, Props>) {
	const resolvedSurfaceDepth = useMemo(() => surfaceDepth + SONG_OFFSET, [surfaceDepth]);

	return (
		<mesh {...rest}>
			<tubeGeometry attach="geometry" args={[path, segments, 0.0625]} />
			<shaderMaterial
				attach="material"
				transparent
				depthWrite={false}
				vertexShader={ARC_VERT_SHADER}
				fragmentShader={ARC_FRAG_SHADER}
				uniforms={{
					uColor: { value: new Color(color) },
					uEmissive: { value: new Color("yellow") },
					uEmissiveIntensity: { value: selected ? 0.5 : 0 },
					uProgress: { value: progress },
					uPassedOpacity: { value: passedOpacity },
					uActiveOpacity: { value: activeOpacity },
					uStartZ: { value: startZ },
					uEndZ: { value: endZ },
					uSurfaceDepth: { value: resolvedSurfaceDepth },
				}}
			/>
		</mesh>
	);
}
