"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/rooms");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Loading...</p>
    </div>
  );
}

/*
===============================================================================
                              HOME PAGE FLOW
===============================================================================

This is the application's entry page ("/").

Its only responsibility is to determine where the user should be redirected
based on their authentication status.

The page itself is never intended to display content permanently. Instead, it
acts as a "traffic controller" that sends users to the correct page.

===============================================================================

1. Client Component
-------------------

'use client';

By default, components in the Next.js App Router are Server Components.

Adding:

    'use client';

turns this into a Client Component, allowing it to use:

- React Hooks (useEffect)
- Browser APIs
- Next.js navigation
- Context values
- Authentication state

Without "use client", hooks such as useEffect() and useAuth() cannot be used.

===============================================================================

2. useAuth()
------------

const { user, loading } = useAuth();

The authentication context provides two important values:

user
    Stores the currently authenticated user.

    user = null
        → User is not logged in.

    user = { ... }
        → User is authenticated.

------------------------------------------------

loading

Represents whether the application is still checking the user's authentication
status.

loading = true
    Authentication check is still running.

loading = false
    Authentication status has been determined.

===============================================================================

3. useRouter()
--------------

const router = useRouter();

useRouter() allows client-side navigation without refreshing the page.

Example:

router.push('/login')

changes the URL to:

    /login

while keeping the application running as a Single Page Application (SPA).

===============================================================================

4. useEffect()
--------------

This effect runs:

- When the component first mounts.
- Whenever user or loading changes.

Flow:

Home page loads
        │
        ▼
Authentication still loading?
        │
   ┌────┴────┐
   ▼         ▼
 Yes         No
 │            │
 │            ▼
 │      User exists?
 │            │
 │     ┌──────┴──────┐
 │     ▼             ▼
 │  Logged In     Not Logged In
 │     │             │
 │     ▼             ▼
 │  /rooms        /login
 │
 ▼
Wait until loading finishes

Waiting for loading to become false prevents redirecting before the application
knows whether the user is authenticated.

===============================================================================

5. Loading Screen
-----------------

While authentication is being checked, this component displays:

    Loading...

The container uses Flexbox:

display: flex
justifyContent: center
alignItems: center
height: 100vh

This centers the loading message both horizontally and vertically on the screen.

===============================================================================

Overall Page Lifecycle
----------------------

User visits "/"
        │
        ▼
Home Component Renders
        │
        ▼
Read authentication state
        │
        ▼
loading == true ?
        │
   ┌────┴────┐
   ▼         ▼
 Yes         No
 │            │
 ▼            ▼
Show      User exists?
Loading        │
               │
        ┌──────┴──────┐
        ▼             ▼
    Redirect       Redirect
    to /rooms      to /login

===============================================================================

Purpose of this file:
- Acts as the application's landing page.
- Determines whether the user is authenticated.
- Redirects authenticated users to the chat rooms page.
- Redirects unauthenticated users to the login page.
- Displays a loading indicator while the authentication status is being
  verified.
- Prevents users from briefly seeing the wrong page before authentication
  completes.

===============================================================================
*/
