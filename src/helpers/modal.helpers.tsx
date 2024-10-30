import type { ComponentProps } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import type { JSX } from "react/jsx-runtime";

import Modal from "$/components/Modal";

let mountPoint: Element | DocumentFragment;

export function renderImperativePrompt(modalProps: ComponentProps<typeof Modal>, generateChildren: (triggerSuccess: (data: unknown) => void, triggerClose: () => void) => JSX.Element) {
	if (!mountPoint) {
		mountPoint = window.document.createElement("div");
		window.document.body.appendChild(mountPoint);
	}

	const cleanup = () => {
		unmountComponentAtNode(mountPoint);
	};

	return new Promise((resolve) => {
		const triggerSuccess = (data: unknown) => {
			cleanup();
			resolve(data);
		};
		const triggerClose = () => {
			cleanup();
			resolve(false);
		};

		try {
			render(
				<Modal {...modalProps} isVisible={true} onDismiss={triggerClose}>
					{generateChildren(triggerSuccess, triggerClose)}
				</Modal>,
				mountPoint,
			);
		} catch (err) {
			console.error(err);
		}
	});
}
