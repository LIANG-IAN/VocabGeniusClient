import api from './axios'

interface RegisterData {
    email: string
    username: string
    password: string
}

interface LoginData {
    email: string
    password: string
}

interface AuthResponse {
    token: string
    username: string
    email: string
}

export const authService = {
    // 註冊
    async register(data: RegisterData) {
        const response = await api.post<AuthResponse>('/auth/register', data)
        return response.data
    },

    // 登入
    async login(data: LoginData) {
        const response = await api.post<AuthResponse>('/auth/login', data)
        return response.data
    }
}