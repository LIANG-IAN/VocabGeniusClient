<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {profileService} from '../services/profile'

const isLoading = ref(true)
const errorMessage = ref('')
const profile = ref<any>(null)

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const loadProfile = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        profile.value = await profileService.getUserProfile()
    } catch (error: any) {
        console.error('載入個人資料失敗：', error)
        errorMessage.value = '無法載入個人資料，請稍後再試'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadProfile()
})
</script>

<template>
    <div class="profile-container">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>個人資料</h1>
            <div class="nav-actions">
                <router-link to="/settings" class="settings-btn">
                    設定
                </router-link>
                <router-link to="/home" class="back-btn">
                    返回主頁
                </router-link>
            </div>
        </nav>
        
        <main class="main-content">
            <!-- 載入中狀態 -->
            <div v-if="isLoading" class="loading-state">
                載入中...
            </div>
            
            <!-- 錯誤訊息 -->
            <div v-else-if="errorMessage" class="error-state">
                {{ errorMessage }}
                <button @click="loadProfile" class="retry-btn">
                    重新載入
                </button>
            </div>
            
            <!-- 個人資料內容 -->
            <template v-else-if="profile">
                <!-- 基本資料卡片 -->
                <section class="profile-card basic-info">
                    <div class="profile-header">
                        <div class="avatar">
                            {{ profile.username.charAt(0).toUpperCase() }}
                        </div>
                        <div class="user-info">
                            <h2>{{ profile.username }}</h2>
                            <p class="email">{{ profile.email }}</p>
                            <p class="join-date">
                                加入時間：{{ formatDate(profile.createdAt) }}
                            </p>
                        </div>
                    </div>
                </section>
                
                <!-- 學習統計卡片 -->
                <section class="profile-card stats-card">
                    <h3>學習統計</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">
                                {{ profile.learningStats.totalWords }}
                            </span>
                            <span class="stat-label">總單字量</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">
                                {{ profile.learningStats.masteredWords }}
                            </span>
                            <span class="stat-label">已掌握</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">
                                {{ profile.learningStats.currentStreak }}
                            </span>
                            <span class="stat-label">連續學習天數</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">
                                {{ profile.learningStats.averageProficiency.toFixed(1) }}
                            </span>
                            <span class="stat-label">平均熟練度</span>
                        </div>
                    </div>
                </section>
                
                <!-- 最近進度卡片 -->
                <section class="profile-card progress-card">
                    <h3>最近學習進度</h3>
                    <div class="progress-chart">
                        <div
                            v-for="(progress, index) in profile.recentProgress"
                            :key="index"
                            class="progress-bar"
                        >
                            <div
                                class="progress-fill"
                                :style="{
                                    height: `${(progress.wordsReviewed / 20) * 100}%`
                                }"
                            ></div>
                            <span class="progress-date">
                                {{ new Date(progress.date).getDate() }}日
                            </span>
                        </div>
                    </div>
                    <p class="progress-note">最近7天的每日學習單字數</p>
                </section>
            </template>
        </main>
    </div>
</template>

<style scoped>
.profile-container {
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

.nav-actions {
    display: flex;
    gap: 1rem;
}

.settings-btn,
.back-btn {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.settings-btn:hover,
.back-btn:hover {
    background-color: #f5f5f5;
    color: #333;
}

.main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.profile-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.avatar {
    width: 80px;
    height: 80px;
    background-color: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
}

.user-info h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
}

.email {
    color: #666;
    margin: 0.5rem 0;
}

.join-date {
    color: #999;
    font-size: 0.9rem;
    margin: 0;
}

.stats-card h3 {
    margin: 0 0 1.5rem;
    color: #2c3e50;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    text-align: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #4CAF50;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

.progress-card h3 {
    margin: 0 0 1.5rem;
    color: #2c3e50;
}

.progress-chart {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding: 1rem 0;
}

.progress-bar {
    width: 40px;
    height: 100%;
    background-color: #f0f0f0;
    border-radius: 4px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.progress-fill {
    background-color: #4CAF50;
    border-radius: 4px;
    transition: height 0.3s ease;
}

.progress-date {
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #666;
}

.progress-note {
    text-align: center;
    color: #666;
    margin: 1rem 0 0;
    font-size: 0.9rem;
}

.loading-state {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.error-state {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* 響應式設計適配 */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .progress-chart {
        height: 150px;
    }
    
    .progress-bar {
        width: 30px;
    }
}
</style>