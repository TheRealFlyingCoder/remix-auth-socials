import { createCookieSessionStorage } from '@remix-run/server-runtime';
import { FacebookDefaultScopes, FacebookScopeSeperator, FacebookStrategy } from '../src';

describe(FacebookStrategy, () => {
	const verify = jest.fn();
	const sessionStorage = createCookieSessionStorage({
		cookie: { secrets: ['s3cr3t'] },
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('should allow changing the scope', async () => {
		const strategy = new FacebookStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
				scope: ['ads_read'],
			},
			verify,
		);

		const request = new Request('https://example.app/auth/facebook');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe('ads_read');
		}
	});

	test('should have the default scope', async () => {
		const strategy = new FacebookStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/facebook');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe(FacebookDefaultScopes.join(FacebookScopeSeperator));
		}
	});

	test('should correctly format the authorization URL', async () => {
		const strategy = new FacebookStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/facebook');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;

			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.hostname).toBe('facebook.com');
			expect(redirectUrl.pathname).toBe('/v12.0/dialog/oauth');
		}
	});
});
