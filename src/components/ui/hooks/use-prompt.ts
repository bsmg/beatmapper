import { useDialog } from "@ark-ui/react/dialog";
import type { createToaster } from "@ark-ui/react/toast";
import { useCallback } from "react";
import { type BaseIssue, type BaseSchema, safeParse } from "valibot";

interface usePromptDispatchOptions<T> {
	toaster: ReturnType<typeof createToaster>;
	validate: BaseSchema<string | null, T, BaseIssue<unknown>>;
	fallback?: string;
	callback: (result: T) => void;
}
export function usePrompt<T>({ toaster, validate, fallback, callback }: usePromptDispatchOptions<T>) {
	const handler = useCallback(
		(input: string) => {
			const result = safeParse(validate, input.length > 0 ? input : fallback);

			if (result.issues && result.issues.length > 0) {
				for (const issue of result.issues) {
					toaster.error({ id: "prompt-error", description: issue.message });
					throw new Error(issue.message);
				}
			}

			return callback(result.output as T);
		},
		[toaster, validate, fallback, callback],
	);

	const dialog = useDialog({ role: "alertdialog", modal: false, trapFocus: false });

	return {
		dialog: dialog,
		handler: handler,
	};
}
