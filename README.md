# Remix Auth Socials

> A collection of Remix Auth strategies for Oauth2 Social logins.

👷 If you are interested in creating one of the planned strategies, or maintaining an existing one reach out! 👷

Current strategies:

-   Discord
-   Github
-   Google
-   Facebook
-   Microsoft
  
Planned:

-   Twitter
-   Apple
-   LinkedIn
-   Instagram
-   Reddit

## Supported runtimes

All strategies will support cloudflare

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

## How to use

The simplicity of this package is that all the included socials behave the same.

### Setup your routes

To begin we will set up dynamic routes, that can handle each social on the fly

```tsx
// app/routes/auth/$provider.tsx
import { ActionFunction, LoaderFunction } from 'remix';
import { authenticator } from '~/auth.server';

export let loader: LoaderFunction = () => redirect('/login');

export let action: ActionFunction = ({ request, params }) => {
  return authenticator.authenticate(params.provider, request);
};
```

```tsx
// app/routes/auth/$provider.callback.tsx
import { ActionFunction, LoaderFunction } from 'remix';
import { authenticator } from '~/auth.server';

export let loader: LoaderFunction = ({ request, params }) => {
  return authenticator.authenticate(params.provider, request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  });
};
```

Now you are free to include social buttons on the login page however you like

```tsx
// app/routes/login.tsx
import { SocialProvider } from 'remix-auth-socials';

interface SocialButtonProps {
  provider: SocialProvider,
  label: string
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, label }) => (
  <Form action={`/auth/${provider}`} method="post">
    <button>{label}</button>
  </Form>
);

export default function Login() {
  return (
    <SocialButton provider={SocialProvider.DISCORD} label="Login with Discord" />
    <SocialButton provider={SocialProvider.GITHUB} label="Login with Github" />
    <SocialButton provider={SocialProvider.GOOGLE} label="Login with Google" />
    <SocialButton provider={SocialProvider.FACEBOOK} label="Login with Facebook" />
    <SocialButton provider={SocialProvider.MICROSOFT} label="Login with Microsoft" />
  );
}
```
### Create the strategy instance
For each social you want to use, you must initialise it in your `auth.server.ts` file.

```ts
// app/server/auth.server.ts
import { GoogleStrategy, FacebookStrategy, SocialProvider } from "remix-auth-socials";
import { findOrCreateOauth2User } from "./db.server.ts";

// Create an instance of the authenticator, pass a generic <User> type which the
// strategies will return (this will be stored in the session)
export let authenticator = new Authenticator<User>(sessionStorage, { sessionErrorKey });

authenticator.use(new GoogleStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: `https://example.com/auth/${SocialProvider.GOOGLE}/callback`;
  },
  async ({ profile }) => {
    return findOrCreateOauth2User(profile);
  }
));

authenticator.use(new FacebookStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: `https://example.com/auth/${SocialProvider.FACEBOOK}/callback`;
  },
  async ({ profile }) => {
    return findOrCreateOauth2User(profile);
  }
));
```

TODO: Create readme doc for each strategy to show options and link here