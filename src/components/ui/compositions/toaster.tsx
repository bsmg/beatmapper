import { Portal } from "@ark-ui/react/portal";
import type { CreateToasterReturn } from "@ark-ui/react/toast";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import * as Builder from "../styled/toaster";
import { Button } from "./button";
import { Heading } from "./heading";

interface Props extends Omit<ComponentProps<typeof Builder.Toaster>, "children"> {
	toaster: CreateToasterReturn;
}
export function Toaster({ toaster, ...rest }: Props) {
	return (
		<Portal>
			<Builder.Toaster {...rest} toaster={toaster}>
				{(toast) => (
					<Builder.Root key={toast.id}>
						{toast.title && (
							<Builder.Title asChild>
								<Heading rank={2}>{toast.title}</Heading>
							</Builder.Title>
						)}
						{toast.description && <Builder.Description>{toast.description}</Builder.Description>}
						{toast.action && (
							<Builder.ActionTrigger asChild>
								<Button variant="subtle" size="sm" onClick={toast.action.onClick}>
									{toast.action.label}
								</Button>
							</Builder.ActionTrigger>
						)}
						<Builder.CloseTrigger>
							<XIcon size={20} />
						</Builder.CloseTrigger>
					</Builder.Root>
				)}
			</Builder.Toaster>
		</Portal>
	);
}
