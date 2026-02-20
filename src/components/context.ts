import { createContext } from "@ark-ui/react/utils";

import { getAppBeatmapFilestore, getAppToaster, setupAppBeatmapFilestore, setupAppToaster } from "$/setup";

setupAppBeatmapFilestore();
setupAppToaster();

export const [SetupProvider, useSetupContext] = createContext({ defaultValue: { filestore: getAppBeatmapFilestore(), toaster: getAppToaster() } });
