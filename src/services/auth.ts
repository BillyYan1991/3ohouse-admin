import { setToken, parseJwt } from '@/utils/auth'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  payload?: Record<string, unknown>
}

/**
 * 呼叫後端登入 API，回傳 token 並儲存
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const base = (import.meta.env.VITE_API_BASE as string) || '/api'
  const url = base.replace(/\/$/, '') + '/api/user/login'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  // 只讀一次 body（避免 .json()/.text() 被呼叫多次導致 stream already read）
  const raw = await res.text()
  let parsed: Record<string, any> | null = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }

  if (!res.ok) {
    let msg = '登入失敗'
    if (parsed) {
      msg = (parsed.message as string) || (parsed.error as string) || JSON.stringify(parsed)
    } else if (raw) {
      msg = raw
    }
    throw new Error(msg || '登入失敗')
  }

  // 優先處理 JSON 內 token
  let token: string | null = null
  if (parsed) {
    token = parsed.token || parsed.accessToken || null
  }

  // 如果後端同時回傳 user（例如 { user: 'billy' }），把它存起來方便 UI 顯示
  try {
    if (parsed && typeof parsed.user !== 'undefined') {
      // 儲存原始值（如果是物件則序列化）
      const u = parsed.user
      if (typeof u === 'string') {
        localStorage.setItem('auth_user', u)
      } else {
        localStorage.setItem('auth_user', JSON.stringify(u))
      }
    }
  } catch {
    // ignore
  }

  // 再檢查 Authorization header
  if (!token) {
    const authHeader = res.headers.get('authorization') || res.headers.get('Authorization')
    if (authHeader) {
      const parts = authHeader.split(' ')
      token = parts.length === 2 ? parts[1] : authHeader
    }
  }

  if (!token) throw new Error('後端未回傳 token')

  setToken(token)
  const payloadParsed = parseJwt(token) || undefined
  return { token, payload: payloadParsed }
}

export function logout() {
  // 簡單清除 token
  localStorage.removeItem('auth_token')
}
