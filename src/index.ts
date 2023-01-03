import { GitHubStrategyDefaultName } from 'remix-auth-github';
import { GoogleStrategyDefaultName } from 'remix-auth-google';
import { TwitterStrategyDefaultName } from 'remix-auth-twitter';

export * from './strategies/discord';
export * from './strategies/google';
export * from './strategies/github';
export * from './strategies/facebook';
export * from './strategies/microsoft';
export * from './strategies/twitter';

export const SocialsProvider = {
	DISCORD: 'discord',
	FACEBOOK: 'facebook',
	GITHUB: GitHubStrategyDefaultName,
	GOOGLE: GoogleStrategyDefaultName,
	MICROSOFT: 'microsoft',
    TWITTER: TwitterStrategyDefaultName
} as const;
