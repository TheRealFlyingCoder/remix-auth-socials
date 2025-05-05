import { OAuth2Strategy } from 'remix-auth-oauth2';
import type { OAuth2Tokens } from 'arctic';

/**
 * @see https://developers.google.com/identity/protocols/oauth2/scopes
 */
export type GoogleScope = string;

export type GoogleStrategyOptions = {
	clientId: string;
	clientSecret: string;
	redirectURI: string;
	/**
	 * @default "openid profile email"
	 */
	scopes?: GoogleScope[];
	accessType?: 'online' | 'offline';
	includeGrantedScopes?: boolean;
	prompt?: 'none' | 'consent' | 'select_account';
	hd?: string;
	loginHint?: string;
};

export type GoogleProfile = {
	id: string;
	displayName: string;
	name: {
		familyName: string;
		givenName: string;
	};
	emails: [{ value: string }];
	photos: [{ value: string }];
	_json: {
		sub: string;
		name: string;
		given_name: string;
		family_name: string;
		picture: string;
		locale: string;
		email: string;
		email_verified: boolean;
		hd: string;
	};
};

export type GoogleExtraParams = {
	expires_in: 3920;
	token_type: 'Bearer';
	scope: string;
	id_token: string;
} & Record<string, string | number>;

export const GoogleStrategyDefaultScopes = [
	'openid',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
];
export const GoogleStrategyDefaultName = 'google';
const userInfoURL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export class GoogleStrategy<User> extends OAuth2Strategy<User> {
	public override name = GoogleStrategyDefaultName;

	private readonly accessType: string;

	private readonly prompt?: 'none' | 'consent' | 'select_account';

	private readonly includeGrantedScopes: boolean;

	private readonly hd?: string;

	private readonly loginHint?: string;

	constructor(
		{
			clientId,
			clientSecret,
			redirectURI,
			scopes,
			accessType,
			includeGrantedScopes,
			prompt,
			hd,
			loginHint,
		}: GoogleStrategyOptions,
		verify: OAuth2Strategy<User>['verify'],
	) {
		super(
			{
				clientId,
				clientSecret,
				redirectURI,
				authorizationEndpoint:
					'https://accounts.google.com/o/oauth2/v2/auth',
				tokenEndpoint: 'https://oauth2.googleapis.com/token',
				scopes: scopes ?? GoogleStrategyDefaultScopes,
			},
			verify,
		);
		this.accessType = accessType ?? 'online';
		this.includeGrantedScopes = includeGrantedScopes ?? false;
		this.prompt = prompt;
		this.hd = hd;
		this.loginHint = loginHint;
	}

	protected override authorizationParams(
		params: URLSearchParams,
		request?: Request,
	): URLSearchParams {
		params.set('access_type', this.accessType);
		params.set('include_granted_scopes', String(this.includeGrantedScopes));
		if (this.prompt) {
			params.set('prompt', this.prompt);
		}
		if (this.hd) {
			params.set('hd', this.hd);
		}
		if (this.loginHint) {
			params.set('login_hint', this.loginHint);
		}
		return params;
	}

	static async userProfile(tokens: OAuth2Tokens): Promise<GoogleProfile> {
		const response = await fetch(userInfoURL, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
			},
		});
		if (!response.ok) {
			throw new Error(
				`Failed to fetch user profile: ${response.statusText}`,
			);
		}
		const raw: GoogleProfile['_json'] = await response.json();
		const profile: GoogleProfile = {
			id: raw.sub,
			displayName: raw.name,
			name: {
				familyName: raw.family_name,
				givenName: raw.given_name,
			},
			emails: [{ value: raw.email }],
			photos: [{ value: raw.picture }],
			_json: raw,
		};
		return profile;
	}
}
