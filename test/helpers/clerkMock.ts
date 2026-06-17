import { vi } from 'vitest'

/*
 * Shared, mutable auth state for the Clerk mock. Declared via vi.hoisted so the
 * (also hoisted) vi.mock factory below can close over the SAME object the
 * test-facing setter mutates — otherwise the factory would capture a stale copy.
 *
 * Routes import `auth` from '@clerk/nextjs/server' (through lib/middleware
 * withAuth). withAuth reads `const { userId } = auth()` and 401s when it's null,
 * so flipping authState.userId is enough to drive both the authed and
 * unauthenticated paths.
 */
const authState = vi.hoisted(() => ({ userId: null as string | null }))

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: authState.userId }),
}))

/** Authenticate subsequent route calls as `userId`. */
export function setAuthUser(userId: string): void {
  authState.userId = userId
}

/** Make subsequent route calls unauthenticated (withAuth -> 401). */
export function clearAuthUser(): void {
  authState.userId = null
}
