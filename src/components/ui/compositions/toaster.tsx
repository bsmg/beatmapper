import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import type { ComponentProps, RefObject } from "react";

import { Show } from "$/components/ui/atoms";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/toast";
import { Button } from "./button";
import { Heading } from "./heading";

export interface ToasterProps extends Omit<ComponentProps<typeof Builder.Toaster>, "children"> {
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
}

export function Toaster({ toaster, portalled = true, portalRef, ...rest }: ToasterProps) {
	const Title = useRender(
		Builder.Title,
		toPolymorphic(Heading, (Element, delegated) => <Element {...delegated} rank={2} />),
	);
	const ActionTrigger = useRender(
		Builder.Title,
		toPolymorphic(Button, (Element, delegated) => <Element {...delegated} variant="subtle" size="sm" />),
	);

	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Toaster {...rest} toaster={toaster}>
				{(toast) => (
					<Builder.Root key={toast.id}>
						<Show when={toast.title}>{(title) => <Title>{title}</Title>}</Show>
						<Show when={toast.description}>{(description) => <Builder.Description>{description}</Builder.Description>}</Show>
						<Show when={toast.action}>{(action) => <ActionTrigger onClick={action.onClick}>{action.label}</ActionTrigger>}</Show>
						<Show when={toast.closable}>
							<Builder.CloseTrigger>
								<XIcon size={20} />
							</Builder.CloseTrigger>
						</Show>
					</Builder.Root>
				)}
			</Builder.Toaster>
		</Portal>
	);
}
