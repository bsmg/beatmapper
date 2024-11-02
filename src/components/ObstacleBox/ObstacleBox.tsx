import { type ThreeEvent, extend } from "@react-three/fiber";
import { Fragment, useEffect, useMemo, useState } from "react";
import { BoxGeometry, DoubleSide, Mesh, MeshPhongMaterial } from "three";
import { Font, TextGeometry } from "three-stdlib";

import { oswaldGlyphs } from "$/assets";
import type { App } from "$/types";
import { getDimensionsForObstacle, getPositionForObstacle } from "./ObstacleBox.helpers";

extend({ TextGeometry });

interface Props {
	obstacle: App.Obstacle;
	color: string;
	snapTo: number;
	beatDepth: number;
	gridRows?: number;
	gridCols?: number;
	handleDelete: (id: App.Obstacle["id"]) => void;
	handleResize: (id: App.Obstacle["id"], newBeatDuration: number) => void;
	handleClick: (id: App.Obstacle["id"]) => void;
	handleMouseOver?: (ev: ThreeEvent<PointerEvent>) => void;
}

const RESIZE_THRESHOLD = 30;

const ObstacleBox = ({ obstacle, color, beatDepth, snapTo, handleDelete, handleResize, handleClick, handleMouseOver }: Props) => {
	const obstacleDimensions = getDimensionsForObstacle(obstacle, beatDepth);

	const mesh = useMemo(() => {
		const geometry = new BoxGeometry(obstacleDimensions.width, obstacleDimensions.height, obstacleDimensions.depth);
		const material = new MeshPhongMaterial({
			color,
			transparent: true,
			opacity: obstacle.tentative ? 0.15 : 0.4,
			polygonOffset: true,
			polygonOffsetFactor: 1, // positive value pushes polygon further away
			polygonOffsetUnits: 1,
			side: DoubleSide,
			emissive: "yellow",
			emissiveIntensity: obstacle.selected ? 0.5 : 0,
		});

		return new Mesh(geometry, material);
	}, [color, obstacleDimensions.depth, obstacleDimensions.height, obstacle.tentative, obstacleDimensions.width, obstacle.selected]);

	const actualPosition = getPositionForObstacle(obstacle, obstacleDimensions, beatDepth);

	const [mouseDownAt, setMouseDownAt] = useState<number | null>(null);

	useEffect(() => {
		const handlePointerMove = (ev: PointerEvent) => {
			if (!mouseDownAt) {
				return;
			}

			const delta = ev.pageX - mouseDownAt;
			if (Math.abs(delta) > RESIZE_THRESHOLD) {
				// Check how many "steps" away this is from the mouse-down position
				const numOfSteps = Math.floor(delta / RESIZE_THRESHOLD);

				// If this number is different from our current value, dispatch a resize event
				let newBeatDuration = obstacle.beatDuration + snapTo * numOfSteps;

				// Ignore negative beat durations
				newBeatDuration = Math.max(0, newBeatDuration);

				if (newBeatDuration !== obstacle.beatDuration) {
					handleResize(obstacle.id, newBeatDuration);
				}
			}
		};

		const handlePointerUp = () => {
			if (mouseDownAt) {
				setMouseDownAt(null);
			}
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};
	}, [mouseDownAt, obstacle, snapTo, handleResize]);

	// @ts-ignore false positive + augmentation hell = time to sin
	const font = new Font(oswaldGlyphs);
	const textGeometryOptions = {
		font,
		size: 0.4,
		height: 0.025,
		curveSegments: 2,
	};

	return (
		<Fragment>
			{obstacle.fast && (
				<mesh position={actualPosition}>
					<textGeometry attach="geometry" args={["F", textGeometryOptions]} />
					<meshLambertMaterial attach="material" color="#AAA" />
				</mesh>
			)}

			<primitive
				object={mesh}
				position={actualPosition}
				onPointerUp={(ev: ThreeEvent<PointerEvent>) => {
					if (obstacle.tentative) {
						return;
					}

					// Impossible condition, I believe
					if (typeof mouseDownAt !== "number") {
						return;
					}

					// if the user is resizing the box, we don't want to also select it.
					// They should be two distinct operations.
					const distance = Math.abs(ev.pageX - mouseDownAt);
					if (distance > RESIZE_THRESHOLD) {
						return;
					}

					ev.stopPropagation();

					handleClick(obstacle.id);
				}}
				onPointerDown={(ev: ThreeEvent<PointerEvent>) => {
					ev.stopPropagation();

					if (ev.buttons === 2) {
						handleDelete(obstacle.id);
					} else {
						setMouseDownAt(ev.nativeEvent.pageX);
					}
				}}
				onPointerOver={handleMouseOver}
			/>
		</Fragment>
	);
};

export default ObstacleBox;
