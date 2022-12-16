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
import { ActionArgs, redirect } from "@remix-run/node"
import { authenticator } from '~/server/auth.server';

export let loader = () => redirect('/login');

export let action = ({ request, params }: ActionArgs) => {
  return authenticator.authenticate(params.provider, request);
};
```

```tsx
// app/routes/auth/$provider.callback.tsx
import { LoaderArgs } from "@remix-run/node"
import { authenticator } from '~/server/auth.server';

export let loader = ({ request, params }: LoaderArgs) => {
  return authenticator.authenticate(params.provider, request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  });
};
```

Now you are free to include social buttons on the login page however you like

```tsx
// app/routes/login.tsx
import { Form } from "@remix-run/react"
import { SocialsProvider } from 'remix-auth-socials';

interface SocialButtonProps {
  provider: SocialsProvider,
  label: string
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, label }) => (
  <Form action={`/auth/${provider}`} method="post">
    <button>{label}</button>
  </Form>
);

export default function Login() {
  return (
    <>
      <SocialButton provider={SocialsProvider.DISCORD} label="Login with Discord" />
      <SocialButton provider={SocialsProvider.GITHUB} label="Login with Github" />
      <SocialButton provider={SocialsProvider.GOOGLE} label="Login with Google" />
      <SocialButton provider={SocialsProvider.FACEBOOK} label="Login with Facebook" />
      <SocialButton provider={SocialsProvider.MICROSOFT} label="Login with Microsoft" />
    </>
  );
}
```

You will also need a logout route

```ts
// app/routes/logout.tsx
import { ActionArgs } from "@remix-run/node"
import { authenticator } from "~/server/auth.server";

export let action = async ({ request, params }: ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
};
```

### Create the strategy instance
For each social you want to use, you must initialise it in your `auth.server.ts` file.

```ts
// app/server/auth.server.ts
import { Authenticator } from "remix-auth";
import { GoogleStrategy, FacebookStrategy, SocialsProvider } from "remix-auth-socials";
import { sessionStorage } from "~/services/session.server";

// Create an instance of the authenticator
export let authenticator = new Authenticator(sessionStorage, { sessionKey: '_session' });
// You may specify a <User> type which the strategies will return (this will be stored in the session)
// export let authenticator = new Authenticator<User>(sessionStorage, { sessionKey: '_session' });

authenticator.use(new GoogleStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: `http://localhost:3333/auth/${SocialsProvider.GOOGLE}/callback`
  },
  async ({ profile }) => {
    // here you would find or create a user in your database
    return profile;
  }
));

authenticator.use(new FacebookStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: `https://localhost:3333/auth/${SocialsProvider.FACEBOOK}/callback`
  },
  async ({ profile }) => {
    // here you would find or create a user in your database
    return profile;
  }
));
```

### Add a protected route and an automatic success redirect
Here's an example of a protected route

```tsx
// app/routes/dashboard.tsx
import { useLoaderData, Form } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node"
import { authenticator } from "~/server/auth.server";

export let loader = async ({ request, params }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return { user };
};

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome {user.displayName}!</h1>
      <p>This is a protected page</p>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>
    </div>
  );
};
```

You might also want your index route to redirect to the dashboard for logged in users.

```tsx
// app/routes/index.tsx
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node"
import { authenticator } from "~/server/auth.server";

export let loader = async ({ request, params }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
  return user;
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome!</h1>
      <p><a href="/login">Please log in</a></p>
    </div>
  );
}
```

TODO: Create readme doc for each strategy to show options and link here
