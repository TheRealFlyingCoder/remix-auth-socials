import { createCookieSessionStorage } from '@remix-run/server-runtime';
import { DiscordDefaultScopes, DiscordScopeSeperator, DiscordStrategy } from '../src';

describe(DiscordStrategy, () => {
	const verify = jest.fn();
	const sessionStorage = createCookieSessionStorage({
		cookie: { secrets: ['s3cr3t'] },
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('should allow changing the scope', async () => {
		const strategy = new DiscordStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
				scope: ['guilds'],
			},
			verify,
		);

		const request = new Request('https://example.app/auth/discord');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe('guilds');
		}
	});

	test('should have the default scope', async () => {
		const strategy = new DiscordStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/discord');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe(DiscordDefaultScopes.join(DiscordScopeSeperator));
		}
	});

	test('should correctly format the authorization URL', async () => {
		const strategy = new DiscordStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/discord');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;

			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.hostname).toBe('discord.com');
			expect(redirectUrl.pathname).toBe('/api/oauth2/authorize');
		}
	});
});
