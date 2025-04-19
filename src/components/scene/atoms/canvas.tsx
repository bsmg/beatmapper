import { Canvas, type RootState } from "@react-three/fiber";
import { type ComponentProps, forwardRef, useCallback } from "react";
import { Provider, ReactReduxContext } from "react-redux";
import { PCFSoftShadowMap } from "three";

const ReduxForwardingCanvas = forwardRef<HTMLCanvasElement, ComponentProps<"div">>(({ children, ...forwarded }, ref) => {
	const handleCreated = useCallback(({ gl }: RootState) => {
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = PCFSoftShadowMap;
	}, []);

	return (
		<ReactReduxContext.Consumer>
			{(ctx) => {
				if (ctx) {
					return (
						<span ref={ref}>
							<Canvas {...forwarded} onContextMenu={(ev) => ev.preventDefault()} onCreated={handleCreated}>
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
