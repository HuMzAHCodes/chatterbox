import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext.jsx";
import "./globals.css";

export const metadata = {
  title: "ChatterBox",
  description: "Real-time chat application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

/*
===============================================================================
                            ROOT LAYOUT FLOW
===============================================================================

This file defines the Root Layout of the Next.js application.

The Root Layout is the top-level component that wraps every page in the
application. Whenever a user visits any route (e.g., /login, /rooms, /chat),
Next.js first renders this layout and then inserts the requested page inside it.

Think of it as the application's "master template."

===============================================================================

1. Importing ReactNode
----------------------

import type { ReactNode } from 'react';

ReactNode is a TypeScript type that represents anything React can render.

Examples include:

- React Components
- HTML Elements
- Text
- Numbers
- Fragments (<>...</>)
- Arrays of elements
- null

It is the correct type for the "children" prop because every page rendered by
Next.js is passed as children.

===============================================================================

2. Global CSS
-------------

import './globals.css';

This imports the application's global stylesheet.

The styles defined in globals.css are automatically applied to every page,
including:

- Body styling
- Default fonts
- Theme colors
- CSS variables
- Utility classes
- Global resets

Because it is imported here, the styles only need to be loaded once.

===============================================================================

3. Metadata
-----------

export const metadata = {
    title: 'ChatterBox',
    description: 'Real-time chat application',
};

Next.js automatically converts this object into HTML metadata.

Equivalent HTML:

<title>ChatterBox</title>

<meta
    name="description"
    content="Real-time chat application"
/>

Benefits:

- Browser tab title
- Search Engine Optimization (SEO)
- Better previews when links are shared

===============================================================================

4. Typed RootLayout Component
-----------------------------

export default function RootLayout(
    { children }: { children: ReactNode }
)

The component expects one prop:

children: ReactNode

TypeScript now knows exactly what type "children" should be, providing:

- Compile-time type checking
- Better IntelliSense
- Autocomplete
- Error detection

===============================================================================

5. What is "children"?
----------------------

The "children" prop represents whichever page Next.js is currently rendering.

Example:

User visits:

    /login

Next.js renders:

<RootLayout>
    <LoginPage />
</RootLayout>

Inside RootLayout:

children = <LoginPage />

------------------------------------------------

User visits:

    /rooms

Next.js renders:

<RootLayout>
    <RoomsPage />
</RootLayout>

Inside RootLayout:

children = <RoomsPage />

Only the page changes—the layout remains the same.

===============================================================================

6. HTML Structure
-----------------

The Root Layout returns the basic HTML document.

<html lang="en">
    <body>
        ...
    </body>
</html>

The lang="en" attribute improves accessibility and helps search engines identify
the language of the website.

===============================================================================

7. AuthProvider
---------------

<AuthProvider>

The entire application is wrapped inside the AuthProvider.

This makes authentication data available globally.

Every page and component can access:

- Current authenticated user
- Loading state
- Login function
- Register function
- Logout function

using:

    const {
        user,
        login,
        register,
        logout
    } = useAuth();

Without wrapping the application here, every page would need its own
authentication logic.

===============================================================================

Overall Rendering Flow
----------------------

User Visits Route
        │
        ▼
Next.js loads RootLayout
        │
        ▼
Load Global CSS
        │
        ▼
Apply Metadata
        │
        ▼
Create HTML Document
        │
        ▼
Wrap Application in AuthProvider
        │
        ▼
Insert Current Page as {children}
        │
        ▼
Render Complete Page

===============================================================================

Purpose of this file:
- Defines the global layout shared by every page.
- Imports application-wide CSS.
- Sets metadata such as the page title and description.
- Wraps the application with AuthProvider so authentication is available
  throughout the app.
- Uses TypeScript's ReactNode type to ensure the children prop is correctly
  typed.
- Serves as the root entry point for rendering all pages in the Next.js App
  Router.

===============================================================================
*/
