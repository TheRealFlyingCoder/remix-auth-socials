export * from 'remix-auth-discord';
export * from 'remix-auth-github';
export * from 'remix-auth-google';
export * from 'remix-auth-microsoft';

export * from './strategies/facebook';

export enum SocialsProvider {
    GOOGLE = 'google',
    DISCORD = 'discord',
    GITHUB = 'github',
    FACEBOOK = 'facebook',
    MICROSOFT = 'microsoft'
}