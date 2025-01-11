<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'

// 使用 ref 來管理表單數據
const email = ref('')
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()

// 處理註冊表單提交
const handleSubmit = async () => {
    try {
        // 基本的表單驗證
        if (!email.value || !username.value || !password.value) {
            errorMessage.value = '請填寫所有欄位'
            return
        }
        
        // TODO: 這裡之後會加入實際的 API 呼叫
        // 先用簡單的模擬來測試路由功能
        console.log('註冊資料：', {
            email: email.value,
            username: username.value,
            password: password.value
        })
        
        // 註冊成功後導向登入頁
        await router.push('/login')
    } catch (error) {
        errorMessage.value = '註冊失敗，請稍後再試'
        console.error('註冊錯誤：', error)
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
                    >
                </div>
                
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
                
                <button type="submit" class="submit-btn">註冊</button>
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