export interface ParticleConfig {
	count: number;
	colors: string[];
	mouseRadius: number;
	interactionStrength: number;
	minSize: number;
	maxSize: number;
	baseSpeed: number;
	floatAmplitude: number;
	floatFrequency: number;
}

export const themeConfigs: Record<string, ParticleConfig> = {
	autumn: {
		count: 30,
		colors: ['oklch(0.65 0.15 270 / 0.3)', 'oklch(0.70 0.10 330 / 0.2)'],
		mouseRadius: 120,
		interactionStrength: 0.3,
		minSize: 3,
		maxSize: 8,
		baseSpeed: 0.2,
		floatAmplitude: 0.5,
		floatFrequency: 0.001
	},
	abyss: {
		count: 25,
		colors: ['oklch(0.50 0.20 270 / 0.4)', 'oklch(0.45 0.15 250 / 0.3)'],
		mouseRadius: 100,
		interactionStrength: 0.25,
		minSize: 2,
		maxSize: 6,
		baseSpeed: 0.15,
		floatAmplitude: 0.4,
		floatFrequency: 0.0008
	}
};

export function getConfig(themeName: string | undefined): ParticleConfig {
	return themeConfigs[themeName ?? 'autumn'] ?? themeConfigs.autumn;
}
