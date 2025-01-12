<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import api from '../services/axios'

const router = useRouter()
const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        successMessage.value = ''
        
        await api.post('/auth/forgot-password', {email: email.value})
        
        successMessage.value = '如果該電子郵件存在，重置密碼的說明將發送到該地址。'
        
        // 3秒後重定向到登入頁面
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (error: any) {
        console.error('密碼重置請求失敗：', error)
        errorMessage.value = '請求失敗，請稍後再試'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="forgot-password-container">
        <h1>VocabGenius</h1>
        <div class="form-container">
            <h2>忘記密碼</h2>
            <p class="instruction">
                請輸入您的電子郵件地址，我們將發送重置密碼的說明。
            </p>
            
            <form @submit.prevent="handleSubmit" class="form">
                <div class="form-group">
                    <label for="email">電子郵件</label>
                    <input
                        id="email"
                        type="email"
                        v-model="email"
                        placeholder="請輸入您的電子郵件"
                        required
                        :disabled="isLoading"
                    >
                </div>
                
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
                
                <div v-if="successMessage" class="success-message">
                    {{ successMessage }}
                </div>
                
                <button
                    type="submit"
                    class="submit-btn"
                    :disabled="isLoading || !email"
                >
                    {{ isLoading ? '處理中...' : '發送重置說明' }}
                </button>
            </form>
            
            <div class="links">
                <router-link to="/login" class="back-link">
                    返回登入
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.forgot-password-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: #f5f5f5;
}

.form-container {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.instruction {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.error-message {
    color: #dc3545;
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.success-message {
    color: #28a745;
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.links {
    margin-top: 1.5rem;
    text-align: center;
}

.back-link {
    color: #4CAF50;
    text-decoration: none;
    font-size: 0.9rem;
}

.back-link:hover {
    text-decoration: underline;
}
</style>