import type { Assign } from "@ark-ui/react";
import { type IWrapArc, type IWrapBaseSlider, type IWrapChain, midAnchorCondition, NoteDirection, SliderMidAnchorMode } from "bsmap";
import { type ComponentProps, Fragment, type ReactNode, useMemo } from "react";
import { type ColorRepresentation, CubicBezierCurve3, CurvePath, QuadraticBezierCurve, Quaternion, Vector2, Vector3, type Vector3Tuple } from "three";

import { default as blockCenterUrl } from "$/assets/models/block-center.obj?url";
import { Obj, useOBJ } from "$/components/scene/atoms";
import { resolveRotationVectorForNote, resolveTailPositionForSlider } from "$/components/scene/helpers";
import type { App } from "$/types";
import { lerp, lerpColor } from "$/utils";

export interface BaseSliderProps<T extends IWrapBaseSlider> {
	data: App.IWrapEditorObject<T>;
	timescale?: (time: number) => number;
	beatDepth: number;
	color?: ColorRepresentation;
	transparent?: boolean;
	interactive?: boolean;
	children?: (data: App.IWrapEditorObject<T>, ctx: { tailPosition: Vector3Tuple }) => ReactNode;
}
function BaseSlider<T extends IWrapBaseSlider>({ children, data, timescale, beatDepth, position, rotation, scale }: Assign<ComponentProps<"group">, BaseSliderProps<T>>) {
	const tailPosition = useMemo(() => resolveTailPositionForSlider(data, { timescale, beatDepth }), [data, timescale, beatDepth]);

	return (
		<group userData={data} position={position} rotation={rotation} scale={scale}>
			{children?.(data, { tailPosition })}
		</group>
	);
}

export interface SliderControlPointProps extends ComponentProps<"mesh"> {
	offset: number;
	position?: Vector3Tuple;
	rotation?: Vector3Tuple;
	shape?: "cone" | "sphere";
	color?: ColorRepresentation;
	emissive?: ColorRepresentation;
	emissiveIntensity?: number;
	transparent?: boolean;
}
export function SliderControlPoint({ position = [0, 0, 0], rotation, offset, shape = "cone", ...rest }: SliderControlPointProps) {
	const offsetPosition = useMemo(() => {
		if (!rotation) return position;
		return [position[0] + rotation[0] * offset, position[1] + rotation[1] * offset, position[2] + rotation[2] * offset] as Vector3Tuple;
	}, [position, rotation, offset]);

	const quaternion = useMemo(() => {
		if (!rotation) return undefined;
		return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...rotation).normalize());
	}, [rotation]);

	const color = useMemo(() => lerpColor(rest.color?.toString() ?? null, "#ffffff", 0.25), [rest.color]);

	return (
		<mesh layers={1} position={offsetPosition} quaternion={shape === "cone" ? quaternion : undefined} rotation-x={shape === "sphere" ? Math.PI * 0.5 : undefined} {...rest}>
			{shape === "cone" ? <coneGeometry args={[0.375, 0.75]} /> : <sphereGeometry args={[0.375]} />}
			<meshToonMaterial color={color} transparent={true} emissive={rest.emissive} emissiveIntensity={rest.emissiveIntensity} opacity={1} />
		</mesh>
	);
}

export interface ArcProps extends Omit<ComponentProps<typeof BaseSlider<IWrapArc>>, "children"> {
	children?: (ctx: { HeadControlPoint: (props: Partial<SliderControlPointProps>) => ReactNode; TailControlPoint: (props: Partial<SliderControlPointProps>) => ReactNode }) => ReactNode;
}
export function Arc({ data, timescale, beatDepth, interactive, children, ...rest }: ArcProps) {
	const ARC_CONTROL_POINT_SCALE = 5;

	const tailPosition = useMemo(() => resolveTailPositionForSlider(data, { timescale, beatDepth }), [data, timescale, beatDepth]);

	const headRotation = useMemo(() => {
		if (data.direction === NoteDirection.ANY) return new Vector3(...tailPosition).normalize().toArray();
		return resolveRotationVectorForNote({ direction: data.direction });
	}, [data.direction, tailPosition]);
	const tailRotation = useMemo(() => {
		if (data.tailDirection === NoteDirection.ANY) return new Vector3(...tailPosition).negate().normalize().toArray();
		return resolveRotationVectorForNote({ direction: data.tailDirection });
	}, [data.tailDirection, tailPosition]);

	const color = useMemo(() => lerpColor(rest.color?.toString() ?? null, "#ffffff", 0.25), [rest.color]);

	return (
		<BaseSlider {...rest} interactive={interactive} data={data} timescale={timescale} beatDepth={beatDepth}>
			{(_, { tailPosition }) => {
				const startPoint = new Vector3(0, 0, 0);
				const endPoint = new Vector3(...tailPosition);

				const headDirection = new Vector3(...headRotation);
				const tailDirection = new Vector3(...tailRotation);

				const headControlPoint = startPoint.clone().addScaledVector(headDirection, data.lengthMultiplier * ARC_CONTROL_POINT_SCALE);
				const tailControlPoint = endPoint.clone().addScaledVector(data.tailDirection === NoteDirection.ANY ? tailDirection.clone() : tailDirection.clone().negate(), data.tailLengthMultiplier * ARC_CONTROL_POINT_SCALE);

				const curvePath = new CurvePath<Vector3>();

				if (midAnchorCondition(data)) {
					const angle = data.midAnchor === SliderMidAnchorMode.CLOCKWISE ? -Math.PI / 2 : Math.PI / 2;
					const direction = new Vector3(headDirection.x * Math.cos(angle) - headDirection.y * Math.sin(angle), headDirection.x * Math.sin(angle) + headDirection.y * Math.cos(angle), 0);

					const midAnchor = startPoint.clone().add(endPoint).multiplyScalar(0.5);
					midAnchor.addScaledVector(direction, ARC_CONTROL_POINT_SCALE * (Math.PI / 2));

					const headDelta = headControlPoint.clone().sub(midAnchor);
					const tailDelta = tailControlPoint.clone().sub(midAnchor);

					let xOffset = (Math.abs(headDelta.x) + Math.abs(tailDelta.x)) * 0.25;
					let yOffset = (Math.abs(headDelta.y) + Math.abs(tailDelta.y)) * 0.25;

					if (headControlPoint.x < tailControlPoint.x) xOffset = -xOffset;
					if (headControlPoint.y < tailControlPoint.y) yOffset = -yOffset;
					if (Math.abs(headControlPoint.x - tailControlPoint.x) < Number.EPSILON) xOffset = 0;
					if (Math.abs(headControlPoint.y - tailControlPoint.y) < Number.EPSILON) yOffset = 0;

					const zOffset = (Math.abs(headDelta.z) + Math.abs(tailDelta.z)) * 0.25;

					const headMidAnchor = midAnchor.clone().add(new Vector3(xOffset, yOffset, zOffset));
					const tailMidAnchor = midAnchor.clone().add(new Vector3(-xOffset, -yOffset, -zOffset));

					curvePath.add(new CubicBezierCurve3(startPoint, headControlPoint, headMidAnchor, midAnchor));
					curvePath.add(new CubicBezierCurve3(midAnchor, tailMidAnchor, tailControlPoint, endPoint));
				} else {
					curvePath.add(new CubicBezierCurve3(startPoint, headControlPoint, tailControlPoint, endPoint));
				}

				const Curve = (props: { path: CurvePath<Vector3>; segments?: number }) => (
					<mesh>
						<tubeGeometry args={[props.path, props.segments, 0.0625]} />
						<meshLambertMaterial attach="material" color={color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={0.75} />
					</mesh>
				);

				const HeadControlPoint = (props: Partial<SliderControlPointProps>) => {
					return <SliderControlPoint rotation={headRotation} offset={data.direction === NoteDirection.ANY ? -1 : 1} shape="cone" color={rest.color} transparent={rest.transparent} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} {...props} />;
				};
				const TailControlPoint = (props: Partial<SliderControlPointProps>) => {
					return <SliderControlPoint position={tailPosition} rotation={tailRotation} offset={data.tailDirection === NoteDirection.ANY ? 1 : -1} shape="cone" color={rest.color} transparent={rest.transparent} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} {...props} />;
				};

				return (
					<Fragment>
						<Curve path={curvePath} />
						{children?.({ HeadControlPoint, TailControlPoint })}
					</Fragment>
				);
			}}
		</BaseSlider>
	);
}

useOBJ.preload(blockCenterUrl);

export interface ChainProps extends Omit<ComponentProps<typeof BaseSlider<IWrapChain>>, "children"> {
	children?: (ctx: { TailControlPoint: (props: Partial<SliderControlPointProps>) => ReactNode }) => ReactNode;
}
export function Chain({ data, timescale, beatDepth, interactive, children, ...rest }: ChainProps) {
	const headRotation = useMemo(() => resolveRotationVectorForNote({ direction: data.direction === NoteDirection.ANY ? NoteDirection.DOWN : data.direction }), [data.direction]);

	return (
		<BaseSlider {...rest} interactive={interactive} data={data} timescale={timescale} beatDepth={beatDepth}>
			{(_, { tailPosition }) => {
				const count = Math.max(1, data.sliceCount);
				const links: { id: number; position: Vector3Tuple; rotation: number }[] = [];

				const startPoint = new Vector3(0, 0, 0);
				const endPoint = new Vector3(...tailPosition);

				const headDirection = new Vector3(...headRotation).normalize();

				const tailXYLength = Math.hypot(tailPosition[0], tailPosition[1]);
				const controlOffset = headDirection.clone().multiplyScalar(tailXYLength * 0.5);
				const controlPoint = new Vector2(startPoint.x + controlOffset.x, startPoint.y + controlOffset.y);

				const curve = new QuadraticBezierCurve(new Vector2(startPoint.x, startPoint.y), controlPoint, new Vector2(endPoint.x, endPoint.y));

				for (let i = 1; i < count; i++) {
					const t = (i / (count - 1)) * data.squish;

					const { x, y } = curve.getPoint(t);
					const { x: tx, y: ty } = curve.getTangent(t);

					links.push({
						id: i,
						position: [x, y, lerp(startPoint.z, endPoint.z, t)] as const,
						rotation: Math.atan2(ty, tx) + Math.PI * 0.5,
					});
				}

				const Link = (props: { id: number; position: Vector3Tuple; rotation: number }) => (
					<group key={props.id} position={props.position} rotation-z={props.rotation}>
						<Obj path={blockCenterUrl} castShadow scale={[0.5, 0.125, 0.5]}>
							<meshStandardMaterial attach="material" metalness={0.5} roughness={0.4} color={rest.color} transparent={true} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} opacity={data.tentative ? 0.75 : rest.transparent ? 0.25 : 1} />
						</Obj>
						<mesh layers={rest.layers} position-z={0.2}>
							<planeGeometry attach="geometry" args={[0.5, 0.2]} />
							<meshLambertMaterial attach="material" emissive={0xffffff} transparent={true} opacity={rest.transparent ? 0.25 : 1} />
						</mesh>
					</group>
				);

				const TailControlPoint = (props: Partial<SliderControlPointProps>) => {
					return <SliderControlPoint position={tailPosition} offset={0} shape="sphere" color={rest.color} transparent={rest.transparent} emissive={"yellow"} emissiveIntensity={data.selected ? 0.5 : 0} {...props} />;
				};

				return (
					<Fragment>
						{links.map((link) => (
							<Link key={link.id} id={link.id} position={link.position} rotation={link.rotation} />
						))}
						{children?.({ TailControlPoint })}
					</Fragment>
				);
			}}
		</BaseSlider>
	);
}
