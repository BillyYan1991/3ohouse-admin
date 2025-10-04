/**
 * 簡單的 JWT helper：儲存與取得 token，解析 payload（base64url）
 */
export function setToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function clearToken() {
  localStorage.removeItem('auth_token')
}

/**
 * 簡單判斷是否已登入（有 token 即視為已登入）
 */
export function isLoggedIn(): boolean {
  const t = getToken()
  return !!t
}

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = getToken()
  const headers = new Headers(init?.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const merged: RequestInit = { ...(init || {}), headers }
  return fetch(input, merged)
}
