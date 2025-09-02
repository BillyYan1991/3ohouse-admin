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
  const url = base.replace(/\/$/, '') + '/user/login'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let msg = '登入失敗'
    try {
      const json = await res.json()
      msg = json.message || json.error || JSON.stringify(json)
    } catch {
      msg = await res.text()
    }
    throw new Error(msg || '登入失敗')
  }

  // 優先處理 JSON 內 token
  const ct = res.headers.get('content-type') || ''
  let token: string | null = null
  if (ct.includes('application/json')) {
    const data = await res.json()
    token = data.token || data.accessToken || null
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
