<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {authService} from '../services/auth'

// 使用 ref 來管理表單數據
const router = useRouter()
const email = ref('')
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// 處理註冊表單提交
const handleSubmit = async () => {
    try {
        // 開始載入
        isLoading.value = true
        errorMessage.value = ''
        
        // 基本的表單驗證
        if (!email.value || !username.value || !password.value) {
            errorMessage.value = '請填寫所有欄位'
            return
        }
        
        // 密碼長度驗證
        if (password.value.length < 6) {
            errorMessage.value = '密碼長度至少需要6個字元'
            return
        }
        
        // 調用註冊 API
        await authService.register({
            email: email.value,
            username: username.value,
            password: password.value
        })
        
        // 註冊成功後導向登入頁
        await router.push('/login')
    } catch (error: any) {
        // 處理不同類型的錯誤
        if (error.response?.status === 400) {
            // 處理特定的驗證錯誤
            if (error.response.data.includes('Email already exists')) {
                errorMessage.value = '此電子郵件已被使用'
            } else if (error.response.data.includes('Username already exists')) {
                errorMessage.value = '此使用者名稱已被使用'
            } else {
                errorMessage.value = error.response.data
            }
        } else {
            errorMessage.value = '註冊失敗，請稍後再試'
        }
        console.error('註冊錯誤：', error)
    } finally {
        // 結束載入狀態
        isLoading.value = false
    }
}
</script>

<template>
    <div class="register-container">
        <h1>VocabGenius</h1>
        <div class="register-form">
            <h2>註冊新帳號</h2>
            
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
                    <label for="username">使用者名稱</label>
                    <input
                        id="username"
                        type="text"
                        v-model="username"
                        placeholder="請輸入使用者名稱"
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
                    {{ isLoading ? '註冊中...' : '註冊' }}
                </button>
            </form>
            
            <p class="login-link">
                已經有帳號？
                <router-link to="/login">返回登入</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #f5f5f5;
}

.register-form {
    background-color: white;
    max-width: 400px;
    width: 100%;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-size: 0.9rem;
    color: #666;
}

input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.submit-btn {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.submit-btn:hover {
    background-color: #45a049;
}

.error-message {
    color: #ff4444;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}

.login-link {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.login-link a {
    color: #4CAF50;
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>