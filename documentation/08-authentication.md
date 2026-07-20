# 08 — Authentication

---

## Overview

Be-Zone uses **Supabase Auth** for all authentication. Supabase Auth handles sessions, JWTs (tokens), and links each user to a row in the `profiles` table and optionally a role in `user_roles`.

The entire auth system is managed through `src/context/AuthContext.tsx` which is wrapped around the whole app in `src/App.tsx`.

---

## Sign Up (New Customer Registration)

### What happens step by step:

1. Customer fills in Name, Email, Password on `/auth` page
2. `Auth.tsx` calls `useAuth().signUp(email, password, fullName)`
3. `AuthContext.signUp()` calls:
   ```js
   supabase.auth.signUp({
     email,
     password,
     options: { data: { full_name: fullName } }
   })
   ```
4. Supabase creates a new row in `auth.users`
5. A **database trigger** (`on_auth_user_created`) automatically fires:
   ```sql
   INSERT INTO profiles (id, email, full_name)
   VALUES (new_user.id, new_user.email, 'CustomerName');
   ```
6. `onAuthStateChange` fires → `AuthContext` updates `user`, `session`, `isAdmin`
7. `useFCMToken` hook (in `FCMTokenRegistrar`) detects new login → requests notification permission
8. User is now logged in

**File:** `src/pages/Auth.tsx` → `src/context/AuthContext.tsx` → Supabase

---

## Sign In (Existing Customer Login)

1. Customer enters Email + Password
2. `Auth.tsx` calls `useAuth().signIn(email, password)`
3. `AuthContext.signIn()` calls:
   ```js
   supabase.auth.signInWithPassword({ email, password })
   ```
4. Supabase verifies credentials, returns a session with a JWT
5. Session is stored in `localStorage` (configured in client.ts)
6. `onAuthStateChange` fires → `AuthContext` updates all state
7. `checkAdmin(userId)` is called:
   ```js
   supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
   ```
8. `isAdmin` is set to `true` or `false`
9. `useFCMToken` registers push notification token if not admin

**File:** `src/pages/Auth.tsx` → `src/context/AuthContext.tsx`

---

## Sign Out (Logout)

1. User clicks logout in Profile page (or wherever it's triggered)
2. `useAuth().signOut()` is called
3. `AuthContext.signOut()` calls:
   ```js
   supabase.auth.signOut()
   ```
4. Supabase clears the session from `localStorage`
5. `onAuthStateChange` fires with `null` session
6. `user`, `session` set to `null`, `isAdmin` set to `false`
7. User sees the site as a guest

---

## Session Persistence

Sessions are **automatically persisted** in `localStorage`:
```js
createClient(URL, KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

- When the user closes the browser and comes back, Supabase reads the stored token from `localStorage`
- `supabase.auth.getSession()` is called on app start to restore the session
- `autoRefreshToken: true` means the JWT is automatically refreshed before expiry — the user stays logged in without interruption

---

## Admin Check

Admin status is determined by querying the `user_roles` table via an RPC function:

```sql
-- Function in Supabase:
SELECT has_role('user-uuid', 'admin') -- returns boolean
```

In `AuthContext.tsx`:
```js
async function checkAdmin(userId) {
  const { data } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });
  setIsAdmin(!!data);
}
```

To make a user an admin, an admin must manually insert into `user_roles`:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid', 'admin');
```

---

## Protected Routes

There is no route guard component. Protection is done **inside each page**:

### Admin Page
```jsx
// Admin.tsx
const { user, isAdmin } = useAuth();
useEffect(() => {
  if (!isAdmin) navigate('/');
}, [isAdmin]);
```

### Profile Page
```jsx
// Profile.tsx
const { user } = useAuth();
useEffect(() => {
  if (!user) navigate('/auth');
}, [user]);
```

### Checkout Page
```jsx
// Checkout.tsx
if (!user) {
  // shows message prompting to login
}
```

---

## AuthContext State Available to All Components

```typescript
interface AuthContextType {
  user: User | null;           // Supabase User object
  session: Session | null;     // Full session with JWT
  loading: boolean;            // true while initial check runs
  isAdmin: boolean;            // true if user has 'admin' role
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, fullName) => Promise<void>;
  signOut: () => Promise<void>;
}
```

Any component can access this by importing and calling `useAuth()`.

---

## What Data Supabase Auth Stores

In `auth.users` (managed entirely by Supabase, not directly accessible):
- User UUID (the `id`)
- Email
- Hashed password
- `raw_user_meta_data` — where `full_name` is stored during signup
- Email verification status
- Last sign-in time

In your `profiles` table (your data):
- Mirror of the user's display info
- Editable delivery address
- FCM token for push notifications

---

## Authentication Flow Diagram

```
Customer opens app
        │
        ▼
AuthContext: supabase.auth.getSession()
        │
   ┌────┴────┐
   │         │
Has session  No session
   │         │
   ▼         ▼
Restore    User = null
session    isAdmin = false
   │
   ▼
checkAdmin(userId)
   │
   ├── Admin? → isAdmin = true → /admin accessible
   └── User?  → isAdmin = false → /admin blocked
```
