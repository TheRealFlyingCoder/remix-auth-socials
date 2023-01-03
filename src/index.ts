import { DiscordStrategyDefaultName } from 'remix-auth-discord';
import { GitHubStrategyDefaultName } from 'remix-auth-github';
import { GoogleStrategyDefaultName } from 'remix-auth-google';
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft';
import { TwitterStrategyDefaultName } from 'remix-auth-twitter';

export * from './strategies/discord';
export * from './strategies/google';
export * from './strategies/github';
export * from './strategies/facebook';
export * from './strategies/microsoft';
export * from './strategies/twitter';

export const SocialsProvider = {
	DISCORD: DiscordStrategyDefaultName,
	FACEBOOK: 'facebook',
	GITHUB: GitHubStrategyDefaultName,
	GOOGLE: GoogleStrategyDefaultName,
	MICROSOFT: MicrosoftStrategyDefaultName,
    TWITTER: TwitterStrategyDefaultName
} as const;
