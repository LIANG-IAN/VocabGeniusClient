<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {settingsService} from '../services/settings.ts'

// 用戶設定相關的狀態
const username = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 學習目標相關的狀態
const dailyNewWordsGoal = ref(5)
const dailyReviewWordsGoal = ref(20)
const enableReminder = ref(true)

// 狀態管理
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const activeTab = ref('profile') // 'profile' 或 'study'

// 載入用戶設定
const loadUserSettings = async () => {
    try {
        isLoading.value = true
        const userSettings = await settingsService.getUserSettings()
        username.value = userSettings.username
        email.value = userSettings.email
    } catch (error: any) {
        errorMessage.value = '載入用戶設定失敗'
        console.error('載入用戶設定錯誤：', error)
    } finally {
        isLoading.value = false
    }
}

// 載入學習目標設定
const loadStudyGoalSettings = async () => {
    try {
        isLoading.value = true
        const goalSettings = await settingsService.getStudyGoalSettings()
        dailyNewWordsGoal.value = goalSettings.dailyNewWordsGoal
        dailyReviewWordsGoal.value = goalSettings.dailyReviewWordsGoal
        enableReminder.value = goalSettings.enableReminder
    } catch (error: any) {
        errorMessage.value = '載入學習目標設定失敗'
        console.error('載入學習目標設定錯誤：', error)
    } finally {
        isLoading.value = false
    }
}

// 更新用戶資料
const handleUpdateProfile = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        successMessage.value = ''
        
        await settingsService.updateUserSettings({
            username: username.value,
            email: email.value
        })
        
        successMessage.value = '個人資料更新成功'
    } catch (error: any) {
        errorMessage.value = error.response?.data || '更新失敗，請稍後再試'
    } finally {
        isLoading.value = false
    }
}

// 更新密碼
const handleUpdatePassword = async () => {
    try {
        if (newPassword.value !== confirmPassword.value) {
            errorMessage.value = '新密碼與確認密碼不符'
            return
        }
        
        if (newPassword.value.length < 6) {
            errorMessage.value = '新密碼長度必須至少為6個字符'
            return
        }
        
        isLoading.value = true
        errorMessage.value = ''
        successMessage.value = ''
        
        // TODO: 實作更新密碼的 API 呼叫
        successMessage.value = '密碼更新成功'
        
        // 清除密碼欄位
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
    } catch (error: any) {
        errorMessage.value = error.response?.data || '密碼更新失敗，請稍後再試'
    } finally {
        isLoading.value = false
    }
}

// 更新學習目標
const handleUpdateStudyGoals = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        successMessage.value = ''
        
        await settingsService.updateStudyGoalSettings({
            dailyNewWordsGoal: dailyNewWordsGoal.value,
            dailyReviewWordsGoal: dailyReviewWordsGoal.value,
            enableReminder: enableReminder.value
        })
        
        successMessage.value = '學習目標更新成功'
    } catch (error: any) {
        errorMessage.value = error.response?.data || '更新失敗，請稍後再試'
    } finally {
        isLoading.value = false
    }
}

// 頁面載入時獲取設定
onMounted(() => {
    loadUserSettings()
    loadStudyGoalSettings()
})
</script>

<template>
    <div class="settings-container">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>設定</h1>
            <router-link to="/home" class="back-btn">
                返回主頁
            </router-link>
        </nav>
        
        <main class="main-content">
            <!-- 設定分頁 -->
            <div class="tabs">
                <button
                    @click="activeTab = 'profile'"
                    :class="['tab-btn', { active: activeTab === 'profile' }]"
                >
                    個人資料
                </button>
                <button
                    @click="activeTab = 'study'"
                    :class="['tab-btn', { active: activeTab === 'study' }]"
                >
                    學習目標
                </button>
            </div>
            
            <!-- 載入中狀態 -->
            <div v-if="isLoading" class="loading-state">
                載入中...
            </div>
            
            <!-- 個人資料設定 -->
            <div v-else-if="activeTab === 'profile'" class="settings-section">
                <div class="card">
                    <h2>基本資料</h2>
                    <form @submit.prevent="handleUpdateProfile" class="form">
                        <div class="form-group">
                            <label for="username">使用者名稱</label>
                            <input
                                id="username"
                                type="text"
                                v-model="username"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="email">電子郵件</label>
                            <input
                                id="email"
                                type="email"
                                v-model="email"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            更新資料
                        </button>
                    </form>
                </div>
                
                <div class="card">
                    <h2>變更密碼</h2>
                    <form @submit.prevent="handleUpdatePassword" class="form">
                        <div class="form-group">
                            <label for="currentPassword">目前密碼</label>
                            <input
                                id="currentPassword"
                                type="password"
                                v-model="currentPassword"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="newPassword">新密碼</label>
                            <input
                                id="newPassword"
                                type="password"
                                v-model="newPassword"
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
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            更新密碼
                        </button>
                    </form>
                </div>
            </div>
            
            <!-- 學習目標設定 -->
            <div v-else-if="activeTab === 'study'" class="settings-section">
                <div class="card">
                    <h2>每日學習目標</h2>
                    <form @submit.prevent="handleUpdateStudyGoals" class="form">
                        <div class="form-group">
                            <label for="dailyNewWords">每日新單字目標</label>
                            <input
                                id="dailyNewWords"
                                type="number"
                                v-model="dailyNewWordsGoal"
                                min="1"
                                max="50"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="dailyReviewWords">每日複習單字目標</label>
                            <input
                                id="dailyReviewWords"
                                type="number"
                                v-model="dailyReviewWordsGoal"
                                min="1"
                                max="100"
                                required
                                :disabled="isLoading"
                            >
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input
                                    type="checkbox"
                                    v-model="enableReminder"
                                    :disabled="isLoading"
                                >
                                啟用每日學習提醒
                            </label>
                        </div>
                        
                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            更新學習目標
                        </button>
                    </form>
                </div>
            </div>
            
            <!-- 訊息顯示 -->
            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="success-message">
                {{ successMessage }}
            </div>
        </main>
    </div>
</template>

<style scoped>
.settings-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.navbar {
    background-color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
}

.back-btn {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background-color: #f5f5f5;
    color: #333;
}

.main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #666;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.tab-btn.active {
    background-color: #4CAF50;
    color: white;
}

.card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.card h2 {
    margin: 0 0 1.5rem;
    color: #2c3e50;
    font-size: 1.25rem;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    color: #666;
    font-size: 0.9rem;
}

.form-group input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.form-group input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.checkbox-group {
    flex-direction: row;
    align-items: center;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #333;
}

.checkbox-label input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
}

.submit-btn {
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover {
    background-color: #45a049;
}

.submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message,
.success-message {
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    text-align: center;
}

.error-message {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}

.success-message {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

.loading-state {
    text-align: center;
    padding: 2rem;
    color: #666;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .card {
        padding: 1.5rem;
    }
    
    .tabs {
        flex-direction: column;
    }
    
    .tab-btn {
        width: 100%;
        text-align: center;
    }
}
</style>