const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  jwt: string
}

export class LoginError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text()
  if (!text) {
    return response.status === 401
      ? 'Incorrect email or password.'
      : 'Something went wrong. Please try again.'
  }
  try {
    const parsed = JSON.parse(text)
    return typeof parsed === 'string' ? parsed : (parsed.message ?? text)
  } catch {
    return text
  }
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // needed so the refresh token cookie gets stored
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new LoginError(await readErrorMessage(response), response.status)
  }

  return response.json() as Promise<LoginResponse>
}

// exchanges the refresh token cookie set on login for a new JWT -
// throws if the refresh token is missing, expired, or revoked
export async function refreshToken(userId: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/accounts/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends the existing cookie, stores the rotated one
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new LoginError(await readErrorMessage(response), response.status)
  }

  return response.json() as Promise<LoginResponse>
}

export async function validateToken(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/accounts/validate-token`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.ok
}

export class ResetPasswordError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Resolves for both a successful request and a "no such account" response -
// the API can't tell those apart from a failed send anyway, and revealing
// which one happened would leak whether an email is registered.
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/accounts/reset-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok && response.status !== 400) {
    throw new ResetPasswordError(await readErrorMessage(response), response.status)
  }
}

export interface ResetPasswordPayload {
  userId: string
  token: string
  password: string
}

export async function resetPassword({ userId, token, password }: ResetPasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/accounts/reset-password/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, passwordResetToken: token, password }),
  })

  if (!response.ok) {
    throw new ResetPasswordError(await readErrorMessage(response), response.status)
  }
}
