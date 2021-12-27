import { createCookieSessionStorage } from '@remix-run/server-runtime';
import { GoogleDefaultScopes, GoogleScopeSeperator, GoogleStrategy } from '../src';

describe(GoogleStrategy, () => {
	const verify = jest.fn();
	const sessionStorage = createCookieSessionStorage({
		cookie: { secrets: ['s3cr3t'] },
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('should allow changing the scope', async () => {
		const strategy = new GoogleStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
				scope: ['profile'],
			},
			verify,
		);

		const request = new Request('https://example.app/auth/google');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe('profile');
		}
	});

	test('should have the scope `openid profile email` as default', async () => {
		const strategy = new GoogleStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/google');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe(
				GoogleDefaultScopes.join(GoogleScopeSeperator),
			);
		}
	});

	test('should correctly format the authorization URL', async () => {
		const strategy = new GoogleStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/google');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;

			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.hostname).toBe('accounts.google.com');
			expect(redirectUrl.pathname).toBe('/o/oauth2/v2/auth');
		}
	});
});
