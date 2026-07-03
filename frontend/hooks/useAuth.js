import { useAuth as useAuthContext } from '../context/AuthContext.jsx';

// Re-export for cleaner imports in components
const useAuth = () => useAuthContext();

export default useAuth;





/*
===============================================================================
                             useAuth HOOK FLOW
===============================================================================

This file provides a custom hook that wraps and re-exports the useAuth()
function from AuthContext.

Its purpose is to simplify imports throughout the application by providing a
single, reusable hook for accessing authentication data.

===============================================================================

1. Importing the Context Hook
-----------------------------

import { useAuth as useAuthContext } from '../context/AuthContext.jsx';

The authentication hook is imported from AuthContext.

It has been renamed to:

    useAuthContext

to avoid a naming conflict with the custom hook being created in this file.

===============================================================================

2. Creating the Custom Hook
---------------------------

const useAuth = () => useAuthContext();

This custom hook simply calls and returns the original useAuth() hook from
AuthContext.

It does not add or modify any functionality.

Equivalent code:

const useAuth = () => {
    return useAuthContext();
};

Calling:

const auth = useAuth();

is exactly the same as:

const auth = useAuthContext();

===============================================================================

3. Exporting the Hook
---------------------

export default useAuth;

This allows components to import the hook more cleanly.

Instead of writing:

import { useAuth } from '../context/AuthContext';

components can simply write:

import useAuth from '../hooks/useAuth';

This creates a cleaner and more organized project structure, especially as the
application grows.

===============================================================================

Overall Flow
------------

Component
      │
      ▼
useAuth()
      │
      ▼
useAuthContext()
      │
      ▼
AuthContext
      │
      ▼
Returns:

- user
- loading
- login()
- register()
- logout()

===============================================================================

Purpose of this file:
- Provides a simplified wrapper around AuthContext's useAuth() hook.
- Creates a consistent import path for authentication throughout the project.
- Improves code organization by keeping custom hooks inside the hooks folder.
- Makes future enhancements easier, since additional authentication-related
  logic can be added here without changing every component that uses the hook.

===============================================================================
*/