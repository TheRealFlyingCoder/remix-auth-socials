export * from './strategies/discord';
export * from './strategies/google';
export * from './strategies/github';

export enum SocialsProvider {
    GOOGLE = 'google',
    DISCORD = 'discord',
    GITHUB = 'github'
}