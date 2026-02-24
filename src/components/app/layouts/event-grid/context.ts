import { createContext } from "@ark-ui/react/utils";

import type { connect } from "./machine";

export const [Provider, useEventGridContext] = createContext<ReturnType<typeof connect>>();
