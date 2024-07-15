import { DiscordStrategyDefaultName } from 'remix-auth-discord';
import { GitHubStrategyDefaultName } from 'remix-auth-github';
import { GoogleStrategyDefaultName } from 'remix-auth-google';
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft';
import { Twitter1StrategyDefaultName, Twitter2StrategyDefaultName } from 'remix-auth-twitter';
import { FacebookStrategyName } from 'remix-auth-facebook';
import { LinkedInStrategyDefaultName } from 'remix-auth-linkedin';

export * from './strategies/discord';
export * from './strategies/google';
export * from './strategies/github';
export * from './strategies/facebook';
export * from './strategies/microsoft';
export * from './strategies/twitter';
export * from './strategies/linkedin';

export const SocialsProvider = {
	DISCORD: DiscordStrategyDefaultName,
	FACEBOOK: FacebookStrategyName,
	GITHUB: GitHubStrategyDefaultName,
	GOOGLE: GoogleStrategyDefaultName,
	MICROSOFT: MicrosoftStrategyDefaultName,
	TWITTER: Twitter1StrategyDefaultName,
	TWITTER2: Twitter2StrategyDefaultName,
	LINKEDIN: LinkedInStrategyDefaultName,
} as const;

export type SocialsProvider =
	typeof SocialsProvider[keyof typeof SocialsProvider];
