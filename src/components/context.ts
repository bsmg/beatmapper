import type { CreateToasterReturn } from "@ark-ui/react/toast";
import { createContext } from "@ark-ui/react/utils";

import type { BeatmapFilestore } from "$/services/file.service";

export const [BeatmapFilestoreProvider, useBeatmapFilestore] = createContext<BeatmapFilestore>();
export const [ToasterProvider, useToaster] = createContext<CreateToasterReturn>();
export const [AudioContextProvider, useAudioContext] = createContext<AudioContext>();
