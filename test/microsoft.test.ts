import { createCookieSessionStorage } from '@remix-run/server-runtime';
import { MicrosoftDefaultScopes, MicrosoftScopeSeperator, MicrosoftStrategy } from '../src';

describe(MicrosoftStrategy, () => {
	const verify = jest.fn();
	const sessionStorage = createCookieSessionStorage({
		cookie: { secrets: ['s3cr3t'] },
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('should allow changing the scope', async () => {
		const strategy = new MicrosoftStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
				scope: ['offline_access'],
			},
			verify,
		);

		const request = new Request('https://example.app/auth/microsoft');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe('offline_access');
		}
	});

	test('should have the default scope', async () => {
		const strategy = new MicrosoftStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/microsoft');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;
			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.searchParams.get('scope')).toBe(MicrosoftDefaultScopes.join(MicrosoftScopeSeperator));
		}
	});

	test('should correctly format the authorization URL', async () => {
		const strategy = new MicrosoftStrategy(
			{
				clientID: 'CLIENT_ID',
				clientSecret: 'CLIENT_SECRET',
				callbackURL: 'https://example.app/callback',
			},
			verify,
		);

		const request = new Request('https://example.app/auth/microsoft');

		try {
			await strategy.authenticate(request, sessionStorage, {
				sessionKey: 'user',
			});
		} catch (error) {
			if (!(error instanceof Response)) throw error;

			const location = error.headers.get('Location');

			if (!location) throw new Error('No redirect header');

			const redirectUrl = new URL(location);

			expect(redirectUrl.hostname).toBe('login.microsoftonline.com');
			expect(redirectUrl.pathname).toBe('/common/oauth2/v2.0/authorize');
		}
	});
});
