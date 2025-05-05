export * from './strategies/google.js';
export * from './strategies/github.js';
export * from './strategies/microsoft.js';
export * from './strategies/facebook.js';

export const SocialsProvider = {
	DISCORD: 'discord',
	FACEBOOK: 'facebook',
	GITHUB: 'github',
	GOOGLE: 'google',
	MICROSOFT: 'microsoft',
	TWITTER: 'twitter',
	TWITTER2: 'twitter2',
	LINKEDIN: 'linkedin',
} as const;

export type SocialsProvider =
	(typeof SocialsProvider)[keyof typeof SocialsProvider];
