<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {type StudyProgress, studyService, type StudyStats} from '../services/study'

const router = useRouter()
const isLoading = ref(true)
const studyProgress = ref<StudyProgress | null>(null)
const studyStats = ref<StudyStats | null>(null)
const errorMessage = ref('')

// 載入所有需要的數據
const loadData = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            studyProgress.value = await studyService.getTodayProgress()
        } catch (error: any) {
            if (error.response?.status === 404) {
                studyProgress.value = {
                    date: new Date().toISOString(),  // 確保日期為字串格式
                    newWordsGoal: 5,
                    newWordsCompleted: 0,
                    reviewWordsGoal: 20,
                    reviewWordsCompleted: 0,
                    newWordsProgress: 0,
                    reviewWordsProgress: 0
                }
            } else {
                errorMessage.value = '載入進度資料失敗，請重新整理頁面'
                return  // 遇到非 404 錯誤時提前返回，不繼續執行
            }
        }
        
        studyStats.value = await studyService.getStudyStats()
        
    } catch (error: any) {
        console.error('載入統計資料失敗：', error)
        
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

// 頁面載入時獲取數據
onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="home-container">
        <!-- 頂部導航列 -->
        <nav class="navbar">
            <h1>VocabGenius</h1>
            <div class="nav-right">
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
                            <h3>新單字</h3>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: `${studyProgress.newWordsProgress}%`
                                    }"
                                ></div>
                            </div>
                            <p>{{ studyProgress.newWordsCompleted }} / {{ studyProgress.newWordsGoal }}</p>
                        </div>
                        
                        <div class="progress-card">
                            <h3>複習單字</h3>
                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: `${studyProgress.reviewWordsProgress}%`
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
                            <h3>目前連續學習</h3>
                            <p class="stats-number">{{ studyStats.currentStreak }} 天</p>
                        </div>
                        <div class="stats-card">
                            <h3>最長連續學習</h3>
                            <p class="stats-number">{{ studyStats.longestStreak }} 天</p>
                        </div>
                        <div class="stats-card">
                            <h3>總學習天數</h3>
                            <p class="stats-number">{{ studyStats.totalDays }} 天</p>
                        </div>
                    </div>
                </section>
                
                <!-- 功能卡片 -->
                <section class="features-section">
                    <div class="feature-cards">
                        <div
                            class="feature-card"
                            @click="handleCardClick('/study')"
                        >
                            <h3>開始學習</h3>
                            <p>點擊開始今日的學習任務</p>
                        </div>
                        
                        <div
                            class="feature-card"
                            @click="handleCardClick('/vocab-list')"
                        >
                            <h3>單字列表</h3>
                            <p>查看和管理所有單字卡</p>
                        </div>
                    </div>
                </section>
            </template>
        </main>
    </div>
</template>

<style scoped>
/* 保留原有的樣式 */

/* 新增載入和錯誤狀態的樣式 */
.loading-state,
.error-state {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* 新增統計卡片樣式 */
.stats-section {
    margin-top: 2rem;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stats-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.stats-number {
    font-size: 2rem;
    font-weight: bold;
    color: #4CAF50;
    margin: 0.5rem 0;
}
</style>