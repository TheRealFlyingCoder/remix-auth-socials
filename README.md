# Remix Auth Socials

> A collection Remix Auth strategies for Oauth2 Social logins.

Current strategies:

-   Discord
-   Github
-   Google
-   Facebook
  
Planned:

-   Twitter
-   Apple
-   LinkedIn
-   Microsoft
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
    <SocialButton provider={SocialProvider.GITHUB} label="Login with Github" />
    <SocialButton provider={SocialProvider.GOOGLE} label="Login with Google" />
    <SocialButton provider={SocialProvider.DISCORD} label="Login with Discord" />
  );
}
```
### Create the strategy instance
For each social you want to use, you must initialise it in your `auth.server.ts` file.

```ts
import { ExampleStrategy } from "remix-auth-socials";

let exampleStrategy = new ExampleStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: "https://example.com/auth/example/callback";
  },
  async (accessToken, _, extraParams, profile) => {
    return User.findOrCreate({ email: profile.emails[0].value });
  }
);

authenticator.use(exampleStrategy);
```

TODO: Create readme doc for each strategy and link here