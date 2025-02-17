import { Canvas } from "@react-three/fiber";
import { type ComponentProps, forwardRef } from "react";
import { Provider, ReactReduxContext } from "react-redux";
import { PCFSoftShadowMap } from "three";

const ReduxForwardingCanvas = forwardRef<HTMLCanvasElement, ComponentProps<"div">>(({ children, ...forwarded }, ref) => {
	return (
		<ReactReduxContext.Consumer>
			{(ctx) => {
				if (ctx) {
					return (
						<span ref={ref}>
							<Canvas
								{...forwarded}
								onContextMenu={(ev) => {
									// Don't allow context menu to pop on right click.
									// I need that for deleting notes and stuff.
									ev.preventDefault();
								}}
								onCreated={({ gl }) => {
									gl.shadowMap.enabled = true;
									gl.shadowMap.type = PCFSoftShadowMap;
								}}
							>
								<Provider store={ctx.store}>{children}</Provider>
							</Canvas>
						</span>
					);
				}
			}}
		</ReactReduxContext.Consumer>
	);
});

export default ReduxForwardingCanvas;
