// Using global RequestInit from dom types
// For browser, we can use fetch from window
// We'll create a wrapper that works both in client and server

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(accessToken: string | null = null, refreshToken: string | null = null) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {})
    headers.set('Content-Type', 'application/json')

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })

    // Handle token expiration (401) - optionally refresh token here
    if (res.status === 401) {
      // We could implement token refresh logic here
      // For now, we'll just return the response and let the caller handle it
    }

    return res
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await this.fetchWithAuth(endpoint, { ...options, method: 'GET' })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Something went wrong')
    }
    return res.json()
  }

  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const res = await this.fetchWithAuth(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Something went wrong')
    }
    return res.json()
  }

  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    const res = await this.fetchWithAuth(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Something went wrong')
    }
    return res.json()
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await this.fetchWithAuth(endpoint, { ...options, method: 'DELETE' })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Something went wrong')
    }
    return res.json()
  }
}

// Create a default instance for use in components
export const apiClient = new ApiClient()