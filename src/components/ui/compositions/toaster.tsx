import { Portal } from "@ark-ui/react/portal";
import type { CreateToasterReturn } from "@ark-ui/react/toast";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/toast";
import { Button } from "./button";
import { Heading } from "./heading";

interface Props extends Omit<ComponentProps<typeof Builder.Toaster>, "children"> {
	toaster: CreateToasterReturn;
}
export function Toaster({ toaster, ...rest }: Props) {
	const Title = useRender(
		Builder.Title,
		toPolymorphic(Heading, (Element, delegated) => <Element {...delegated} rank={2} />),
	);
	const ActionTrigger = useRender(
		Builder.Title,
		toPolymorphic(Button, (Element, delegated) => <Element {...delegated} variant="subtle" size="sm" />),
	);

	return (
		<Portal>
			<Builder.Toaster {...rest} toaster={toaster}>
				{(toast) => (
					<Builder.Root key={toast.id}>
						{toast.title && <Title>{toast.title}</Title>}
						{toast.description && <Builder.Description>{toast.description}</Builder.Description>}
						{toast.action && <ActionTrigger>{toast.action.label}</ActionTrigger>}
						<Builder.CloseTrigger>
							<XIcon size={20} />
						</Builder.CloseTrigger>
					</Builder.Root>
				)}
			</Builder.Toaster>
		</Portal>
	);
}
