/** biome-ignore-all lint/complexity/useLiteralKeys: doesn't matter */
import type { EnvironmentName } from "bsmap";

export const BasicTrackOrder: { [key in EnvironmentName]?: number[] } = {
	InterscopeEnvironment: [1, 3, 2, 0, 4, 6, 7, 12, 13, 9, 8, 16, 17],
	BillieEnvironment: [1, 6, 7, 0, 2, 3, 4, 10, 11, 8, 9, 12, 13],
	GagaEnvironment: [10, 18, 6, 16, 2, 12, 3, 13, 7, 17, 11, 19, 0, 1, 4],
	PyroEnvironment: [2, 3, 4, 1, 0, 40, 6],
	EDMEnvironment: [4, 0, 1],
	TheSecondEnvironment: [1, 4, 2, 3, 9, 0],
	LizzoEnvironment: [4, 2, 3, 0, 1, 6, 7, 8, 9, 10, 11, 12, 16, 17],
	RockMixtapeEnvironment: [4, 6, 3],
	BritneyEnvironment: [6, 12, 8, 9],
	MetallicaEnvironment: [6, 13, 8],
	GridEnvironment: [6, 4],
};

export const BasicTrackGroups: { [key in EnvironmentName]?: Record<string, number[]> } = {
	InterscopeEnvironment: {
		["Gates"]: [1, 3, 2, 0, 4],
		["Lasers"]: [6, 7, 12, 13, 9],
		["Cars"]: [8, 16, 17],
	},
	BillieEnvironment: {
		["Water"]: [1, 6, 7, 0, 8],
		["Sun"]: [2, 3, 4, 9, 12, 13],
		["Lasers"]: [10, 11, 9, 12, 13],
	},
	GagaEnvironment: {
		["Tower Lights"]: [10, 6, 2, 3, 7, 11],
		["Tower Heights"]: [18, 16, 12, 13, 17, 19],
	},
};

export const BasicTrackMirror: { [key in EnvironmentName]?: Record<string, number[]> } = {
	DefaultEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	OriginsEnvironment: {
		["Lasers and Lane Lights"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	TriangleEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	NiceEnvironment: {
		["Vertical Lasers and Towers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	BigMirrorEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	DragonsEnvironment: {
		["Lasers and Galaxies"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	KDAEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	MonstercatEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	CrabRaveEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	PanicEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	RocketEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	GreenDayGrenadeEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	GreenDayEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	TimbalandEnvironment: {
		["Parallel Ring Lights"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	FitBeatEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	LinkinParkEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	BTSEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	KaleidoscopeEnvironment: {
		["Spike Lights"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	InterscopeEnvironment: {
		["Lasers"]: [6, 7],
		["Laser Speed"]: [12, 13],
		["Hydraulics"]: [16, 17],
	},
	SkrillexEnvironment: {
		["Vertical Lanes and Ring Sets"]: [1, 4],
		["Lasers"]: [2, 3],
		["Panels"]: [6, 7],
		["Laser and Panel Speed"]: [12, 13],
	},
	BillieEnvironment: {
		["Sun Beams"]: [2, 3],
		["Bottom Lasers"]: [10, 11],
		["Sum Beams Speed"]: [12, 13],
	},
	HalloweenEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	GagaEnvironment: {
		["Far Tower Lights"]: [10, 11],
		["Far Tower Heights"]: [18, 19],
		["Middle Tower Lights"]: [6, 7],
		["Middle Tower Heights"]: [16, 17],
		["Close Tower Lights"]: [2, 3],
		["Close Tower Heights"]: [12, 13],
	},
	PyroEnvironment: {
		["Projectors"]: [2, 3],
	},
	EDMEnvironment: {
		["Lane Lights"]: [0, 1],
	},
	TheSecondEnvironment: {
		["Flags"]: [2, 3],
	},
	LizzoEnvironment: {
		["Runway"]: [0, 1],
		["Rings"]: [2, 3],
		["Cherries"]: [7, 8],
		["LI & O Signs"]: [9, 12],
		["Z Signs"]: [10, 11],
		["Balloon Particles"]: [16, 17],
	},
	TheWeekndEnvironment: {
		["Runway"]: [0, 1],
	},
	Dragons2Environment: {
		["Inner Lasers"]: [0, 1],
		["Outer Lasers"]: [2, 3],
	},
	DaftPunkEnvironment: {
		["Helmet Switch"]: [40, 41],
		["Helmet Text"]: [42, 43],
	},
	Halloween2Environment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
	GlassDesertEnvironment: {
		["Lasers"]: [2, 3],
		["Laser Speed"]: [12, 13],
	},
};
