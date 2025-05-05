# GoogleStrategy

<!-- Description -->

The Google strategy is used to authenticate users against a Google account. It extends the OAuth2Strategy.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

<!-- If it doesn't support one runtime, explain here why -->

## Usage

### Create an OAuth application

Follow the steps on [the Google documentation](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred) to create a new application and get a client ID and secret.

### Create the strategy instance

```ts
// app/services/auth.server.ts
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { createCookieSessionStorage, redirect } from 'react-router';

export type SessionUser = {
	id: string;
	email: string;
	displayName: string;
	pictureUrl: string;
};

let SESSION_KEY = 'user';
export const sessionStorage = createCookieSessionStorage<{
	[SESSION_KEY]: SessionUser;
}>({
	cookie: {
		name: '__session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
});

export const getSession = async (request: Request) => {
	return await sessionStorage.getSession(request.headers.get('Cookie'));
};

export const getSessionUser = async (request: Request) => {
	const session = await getSession(request);
	return session?.get(SESSION_KEY);
};

export const saveSession = async (request: Request, user: SessionUser) => {
	const session = await getSession(request);
	session.set(SESSION_KEY, user);
	return new Headers({
		'Set-Cookie': await sessionStorage.commitSession(session),
	});
};

const googleStrategy = new GoogleStrategy(
	{
		clientId: 'YOUR_CLIENT_ID',
		clientSecret: 'YOUR_CLIENT_SECRET',
		redirectURI: 'https://example.com/auth/google/callback',
	},
	async ({ accessToken, tokens }) => {
		// Get the user data from your DB or API using the tokens and profile
		const profile = await GoogleStrategy.userProfile(tokens);
		return User.findOrCreate({ email: profile.emails[0].value });
	},
);

export const authenticator = new Authenticator<SessionUser>();
authenticator.use(googleStrategy);
```

### Setup your routes

```tsx
// app/routes/login.tsx
export default function Login() {
	return (
		<Form action="/auth/google" method="GET">
			<button>Login with Google</button>
		</Form>
	);
}
```

```tsx
// app/routes/auth.google.tsx
import { authenticator } from '~/services/auth.server';
import type { Route } from './+types/auth.google';

export const loader = async ({ request }: Route.LoaderArgs) => {
	return await authenticator.authenticate('google', request);
};
```

```tsx
// app/routes/auth.google.callback.tsx
import { redirect } from 'react-router';
import { authenticator, saveSession } from '~/services/auth.server';
import type { Route } from './+types/auth.google.callback';

export let loader = ({ request }: Route.LoaderArgs) => {
	const user = authenticator.authenticate('google', request);
	const headers = await saveSession(user);
	return redirect('/dashboard', { headers });
};
```
