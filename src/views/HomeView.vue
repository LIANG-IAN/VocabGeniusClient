# 先貼 script 部分
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {type StudyGoal, type StudyProgress, studyService, type StudyStats} from '../services/study'
import StudyGoalsModal from '../components/StudyGoalsModal.vue'

const router = useRouter()
const isLoading = ref(true)
const studyProgress = ref<StudyProgress | null>(null)
const studyStats = ref<StudyStats | null>(null)
const studyGoals = ref<StudyGoal | null>(null)
const errorMessage = ref('')
const showSettingsModal = ref(false)

// 載入所有需要的數據
const loadData = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        // 先讀取目標設定
        try {
            studyGoals.value = await studyService.getStudyGoal()
        } catch (error: any) {
            if (error.response?.status === 404) {
                studyGoals.value = {
                    dailyNewWordsGoal: 5,
                    dailyReviewWordsGoal: 20,
                    enableReminder: true
                }
            } else {
                throw error
            }
        }
        
        // 讀取進度和統計
        const [progressData, statsData] = await Promise.all([
            studyService.getTodayProgress(),
            studyService.getStudyStats()
        ])
        
        studyProgress.value = progressData
        studyStats.value = statsData
        
    } catch (error: any) {
        console.error('載入資料失敗：', error)
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            await router.push('/login')
        } else {
            errorMessage.value = '載入資料失敗，請重新整理頁面'
        }
    } finally {
        isLoading.value = false
    }
}

// 處理功能卡片點擊
const handleCardClick = async (route: string) => {
    try {
        await router.push(route)
    } catch (error) {
        console.error('導航錯誤：', error)
    }
}

// 處理登出
const handleLogout = async () => {
    try {
        localStorage.removeItem('token')
        await router.push('/login')
    } catch (error) {
        console.error('登出錯誤：', error)
    }
}

// 開啟設定視窗
const openSettings = () => {
    showSettingsModal.value = true
}

// 處理目標設定已儲存
const handleGoalsSaved = () => {
    loadData() // 重新載入資料
}

// 頁面載入時獲取數據
onMounted(() => {
    loadData()
})
</script>

# template 部分
<template>
    <div class="home-container">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>VocabGenius</h1>
            <div class="nav-right">
                <button @click="openSettings" class="settings-btn">
                    設定目標
                </button>
                <button @click="handleLogout" class="logout-btn">登出</button>
            </div>
        </nav>
        
        <main class="main-content">
            <!-- 載入中狀態 -->
            <div v-if="isLoading" class="loading-state">
                <p>載入中...</p>
            </div>
            
            <!-- 錯誤訊息 -->
            <div v-else-if="errorMessage" class="error-state">
                <p>{{ errorMessage }}</p>
                <button @click="loadData" class="retry-btn">重試</button>
            </div>
            
            <!-- 主要內容 -->
            <template v-else>
                <!-- 學習進度卡片 -->
                <section v-if="studyProgress" class="progress-section">
                    <h2>今日學習進度</h2>
                    <div class="progress-cards">
                        <div class="progress-card">
                            <div class="progress-header">
                                <h3>新單字</h3>
                                <span class="goal-badge">
                  目標：{{ studyGoals?.dailyNewWordsGoal || 5 }}
                </span>
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                    width: `${studyProgress.newWordsProgress}%`,
                    backgroundColor: studyProgress.newWordsProgress >= 100 ? '#4CAF50' : '#1976D2'
                  }"
                                ></div>
                            </div>
                            <p>{{ studyProgress.newWordsCompleted }} / {{ studyProgress.newWordsGoal }}</p>
                        </div>
                        
                        <div class="progress-card">
                            <div class="progress-header">
                                <h3>複習單字</h3>
                                <span class="goal-badge">
                  目標：{{ studyGoals?.dailyReviewWordsGoal || 20 }}
                </span>
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                    width: `${studyProgress.reviewWordsProgress}%`,
                    backgroundColor: studyProgress.reviewWordsProgress >= 100 ? '#4CAF50' : '#1976D2'
                  }"
                                ></div>
                            </div>
                            <p>{{ studyProgress.reviewWordsCompleted }} / {{ studyProgress.reviewWordsGoal }}</p>
                        </div>
                    </div>
                </section>
                
                <!-- 學習統計 -->
                <section v-if="studyStats" class="stats-section">
                    <div class="stats-cards">
                        <div class="stats-card">
                            <div class="stats-icon">🔥</div>
                            <h3>目前連續學習</h3>
                            <p class="stats-number">{{ studyStats.currentStreak }} 天</p>
                        </div>
                        <div class="stats-card">
                            <div class="stats-icon">⭐</div>
                            <h3>最長連續學習</h3>
                            <p class="stats-number">{{ studyStats.longestStreak }} 天</p>
                        </div>
                        <div class="stats-card">
                            <div class="stats-icon">📚</div>
                            <h3>總學習天數</h3>
                            <p class="stats-number">{{ studyStats.totalDays }} 天</p>
                        </div>
                    </div>
                </section>
                
                <!-- 功能卡片 -->
                <section class="features-section">
                    <div class="feature-cards">
                        <div class="feature-card" @click="handleCardClick('/study')">
                            <div class="card-icon">📝</div>
                            <h3>開始學習</h3>
                            <p>點擊開始今日的學習任務</p>
                        </div>
                        
                        <div class="feature-card" @click="handleCardClick('/vocab-list')">
                            <div class="card-icon">📋</div>
                            <h3>單字列表</h3>
                            <p>查看和管理所有單字卡</p>
                        </div>
                    </div>
                </section>
            </template>
            
            <!-- 設定目標視窗 -->
            <StudyGoalsModal
                v-model:show="showSettingsModal"
                :initial-goals="studyGoals || undefined"
                @saved="handleGoalsSaved"
            />
        </main>
    </div>
</template>

# style 部分
<style scoped>
.home-container {
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

.nav-right {
    display: flex;
    gap: 1rem;
}

.settings-btn,
.logout-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}

.settings-btn:hover,
.logout-btn:hover {
    background-color: #f5f5f5;
    color: #333;
}

.main-content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.loading-state,
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

.progress-section {
    margin-bottom: 2rem;
}

.progress-section h2 {
    margin-bottom: 1rem;
    color: #2c3e50;
}

.progress-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.progress-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.progress-header h3 {
    margin: 0;
    color: #2c3e50;
}

.goal-badge {
    padding: 0.25rem 0.5rem;
    background-color: #e3f2fd;
    color: #1976D2;
    border-radius: 4px;
    font-size: 0.9rem;
}

.progress-bar {
    height: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    margin: 1rem 0;
}

.progress-fill {
    height: 100%;
    background-color: #1976D2;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.stats-section {
    margin-bottom: 2rem;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stats-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.stats-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.stats-card h3 {
    margin: 0 0 0.5rem;
    color: #2c3e50;
    font-size: 1.1rem;
}

.stats-number {
    font-size: 2rem;
    font-weight: bold;
    color: #4CAF50;
    margin: 0;
}

.features-section {
    margin-top: 2rem;
}

.feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.feature-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease;
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-4px);
}

.card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    margin: 0 0 0.5rem;
    color: #2c3e50;
}

.feature-card p {
    margin: 0;
    color: #666;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .progress-cards,
    .stats-cards,
    .feature-cards {
        grid-template-columns: 1fr;
    }
}
</style>