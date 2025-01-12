<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import api from '../services/axios'

const router = useRouter()
const route = useRoute()
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const token = ref('')

onMounted(() => {
    // 從 URL 參數中獲取重置令牌
    const tokenParam = route.query.token
    if (typeof tokenParam === 'string') {
        token.value = tokenParam
    } else {
        errorMessage.value = '無效的重置連結'
    }
})

const handleSubmit = async () => {
    try {
        if (newPassword.value !== confirmPassword.value) {
            errorMessage.value = '兩次輸入的密碼不相符'
            return
        }
        
        if (newPassword.value.length < 6) {
            errorMessage.value = '密碼長度必須至少為6個字符'
            return
        }
        
        isLoading.value = true
        errorMessage.value = ''
        
        await api.post('/auth/reset-password', {
            token: token.value,
            newPassword: newPassword.value
        })
        
        // 顯示成功訊息並重定向
        alert('密碼已成功重置，請使用新密碼登入')
        await router.push('/login')
    } catch (error: any) {
        console.error('密碼重置失敗：', error)
        errorMessage.value = error.response?.data || '密碼重置失敗，請確認連結是否有效'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="reset-password-container">
        <h1>VocabGenius</h1>
        <div class="form-container">
            <h2>重置密碼</h2>
            
            <template v-if="!token">
                <div class="error-state">
                    <p>{{ errorMessage }}</p>
                    <router-link to="/forgot-password" class="back-link">
                        重新申請密碼重置
                    </router-link>
                </div>
            </template>
            
            <template v-else>
                <form @submit.prevent="handleSubmit" class="form">
                    <div class="form-group">
                        <label for="newPassword">新密碼</label>
                        <input
                            id="newPassword"
                            type="password"
                            v-model="newPassword"
                            placeholder="請輸入新密碼"
                            required
                            :disabled="isLoading"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">確認新密碼</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            v-model="confirmPassword"
                            placeholder="請再次輸入新密碼"
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
                        :disabled="isLoading || !newPassword || !confirmPassword"
                    >
                        {{ isLoading ? '處理中...' : '重置密碼' }}
                    </button>
                </form>
            </template>
        </div>
    </div>
</template>

<style scoped>
.reset-password-container {
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

.error-state {
    text-align: center;
    padding: 2rem;
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

.back-link {
    color: #4CAF50;
    text-decoration: none;
    margin-top: 1rem;
    display: inline-block;
}

.back-link:hover {
    text-decoration: underline;
}
</style>