<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {authService} from '../services/auth' // 引入我們的認證服務

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)  // 新增載入狀態

// 處理登入表單提交
const handleSubmit = async () => {
    try {
        // 開始載入
        isLoading.value = true
        errorMessage.value = ''
        
        // 基本的表單驗證
        if (!email.value || !password.value) {
            errorMessage.value = '請填寫所有欄位'
            return
        }
        
        // 調用登入 API
        const response = await authService.login({
            email: email.value,
            password: password.value
        })
        
        // 將 token 儲存到本地
        localStorage.setItem('token', response.token)
        
        // 登入成功後導向主頁面
        await router.push('/home')
    } catch (error: any) {
        // 處理不同類型的錯誤
        if (error.response?.status === 401) {
            errorMessage.value = '帳號或密碼錯誤'
        } else if (error.response?.data?.message) {
            errorMessage.value = error.response.data.message
        } else {
            errorMessage.value = '登入失敗，請稍後再試'
        }
        console.error('登入錯誤：', error)
    } finally {
        // 結束載入狀態
        isLoading.value = false
    }
}
</script>

<template>
    <div class="login-container">
        <h1>VocabGenius</h1>
        <div class="login-form">
            <h2>登入</h2>
            
            <form @submit.prevent="handleSubmit" class="form">
                <div class="form-group">
                    <label for="email">電子郵件</label>
                    <input
                        id="email"
                        type="email"
                        v-model="email"
                        placeholder="請輸入電子郵件"
                        required
                        :disabled="isLoading"
                    >
                </div>
                
                <div class="form-group">
                    <label for="password">密碼</label>
                    <input
                        id="password"
                        type="password"
                        v-model="password"
                        placeholder="請輸入密碼"
                        required
                        :disabled="isLoading"
                    >
                </div>
                
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
                
                <button
                    type="submit"
                    class="submit-btn"
                    :disabled="isLoading"
                >
                    {{ isLoading ? '登入中...' : '登入' }}
                </button>
            </form>
            
            <p class="register-link">
                還沒有帳號？
                <router-link to="/register">立即註冊</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
/* 保留原有的樣式 */
/* 新增載入狀態的樣式 */
.submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}
</style>