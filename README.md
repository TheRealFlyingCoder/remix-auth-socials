# Remix Auth Socials

> A collection of Remix Auth strategies for Oauth2 Social logins.

It's rare to see only one social login button, and no one likes a big package.json so here we are 👀

Remix auth socials collates community Oauth packages in a way that allows you to set up multiple social logins with ease.

## The Collection:

Please visit the repo's of each package to understand the specifics on their usage, and raise issues.

[remix-auth-discord](https://github.com/JonnyBnator/remix-auth-discord) - By [Jonny](https://github.com/JonnyBnator)

// Awaiting my [Pull Request](https://github.com/manosim/remix-auth-facebook/pull/1) so expect a different user experience for now
[remix-auth-facebook](https://github.com/manosim/remix-auth-facebook) - By [Manos](https://github.com/manosim)

[remix-auth-github](https://github.com/sergiodxa/remix-auth-github) - By [Sergio](https://github.com/sergiodxa)

[remix-auth-google](https://github.com/pbteja1998/remix-auth-google) - By [Bhanu](https://github.com/pbteja1998)

[remix-auth-microsoft](https://github.com/juhanakristian/remix-auth-microsoft) - By [Juhana](https://github.com/juhanakristian)

[remix-auth-twitter](https://github.com/na2hiro/remix-auth-twitter) - By [na2hiro](https://github.com/na2hiro)

## Supported runtimes

All strategies will support cloudflare

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

## How to use


### Setup your routes

To begin we will set up a dynamic route, that can handle each social on the fly

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

const getCallback = (provider: SocialsProvider) => {
  return `http://localhost:3333/auth/${provider}/callback`
} 

authenticator.use(new GoogleStrategy(
  {
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: getCallback(SocialsProvider.GOOGLE)
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
    callbackURL: getCallback(SocialsProvider.FACEBOOK)
  },
  async ({ profile }) => {}
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
    <div>
      <h1>Welcome!</h1>
      <p><a href="/login">Please log in</a></p>
    </div>
  );
}
```
