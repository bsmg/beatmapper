"use client";

import { Toast } from "@ark-ui/react/toast";

import { createStyleContext } from "$:styled-system/jsx";
import { toast } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toast);

export const Root = withProvider(Toast.Root, "root");
export const ActionTrigger = withContext(Toast.ActionTrigger, "actionTrigger");
export const CloseTrigger = withContext(Toast.CloseTrigger, "closeTrigger");
export const Description = withContext(Toast.Description, "description");
export const Title = withContext(Toast.Title, "title");

export { createToaster, ToastContext as Context, type ToastContextProps as ContextProps, Toaster, type ToasterProps } from "@ark-ui/react/toast";
