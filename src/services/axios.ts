import axios from 'axios'

// 創建 axios 實例並設置基本配置
const api = axios.create({
    baseURL: 'http://localhost:5059/api',  // 根據你的後端 API 地址調整
    timeout: 10000  // 10 秒超時
})

// 請求攔截器：在發送請求之前做一些處理
api.interceptors.request.use(
    (config) => {
        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token')
        if (token) {
            // 將 token 添加到請求標頭
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 響應攔截器：處理響應數據和錯誤
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 處理 401 未授權錯誤
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api