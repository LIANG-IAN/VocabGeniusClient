<script setup lang="ts">
import {defineEmits, ref} from 'vue'
import {studyService} from '../services/study'

const props = defineProps<{
    show: boolean
    initialGoals?: {
        dailyNewWordsGoal: number
        dailyReviewWordsGoal: number
        enableReminder: boolean
    }
}>()

const emit = defineEmits(['update:show', 'saved'])

const newWordsGoal = ref(props.initialGoals?.dailyNewWordsGoal || 5)
const reviewWordsGoal = ref(props.initialGoals?.dailyReviewWordsGoal || 20)
const enableReminder = ref(props.initialGoals?.enableReminder || true)

const errorMessage = ref('')
const isLoading = ref(false)

const closeModal = () => {
    emit('update:show', false)
}

const handleSubmit = async () => {
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        // 驗證輸入
        if (newWordsGoal.value < 1 || reviewWordsGoal.value < 1) {
            errorMessage.value = '目標數量必須大於0'
            return
        }
        
        if (newWordsGoal.value > 50 || reviewWordsGoal.value > 100) {
            errorMessage.value = '設定目標過高可能會影響學習品質'
            return
        }
        
        // 儲存目標
        await studyService.setStudyGoal({
            dailyNewWordsGoal: newWordsGoal.value,
            dailyReviewWordsGoal: reviewWordsGoal.value,
            enableReminder: enableReminder.value
        })
        
        // 通知父元件更新
        emit('saved')
        closeModal()
        
    } catch (error: any) {
        console.error('設定目標失敗:', error)
        errorMessage.value = '儲存失敗,請稍後再試'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <h2>設定學習目標</h2>
                <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-content">
                <div class="input-group">
                    <label for="newWordsGoal">每日新單字目標</label>
                    <input
                        id="newWordsGoal"
                        type="number"
                        v-model="newWordsGoal"
                        min="1"
                        max="50"
                        required
                        :disabled="isLoading"
                    >
                    <span class="hint">建議設定1-50之間</span>
                </div>
                
                <div class="input-group">
                    <label for="reviewWordsGoal">每日複習單字目標</label>
                    <input
                        id="reviewWordsGoal"
                        type="number"
                        v-model="reviewWordsGoal"
                        min="1"
                        max="100"
                        required
                        :disabled="isLoading"
                    >
                    <span class="hint">建議設定1-100之間</span>
                </div>
                
                <div class="input-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            v-model="enableReminder"
                            :disabled="isLoading"
                        >
                        啟用每日學習提醒
                    </label>
                </div>
                
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
                
                <div class="modal-footer">
                    <button
                        type="button"
                        class="cancel-btn"
                        @click="closeModal"
                        :disabled="isLoading"
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        class="submit-btn"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? '儲存中...' : '儲存' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
}

.modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    color: #333;
    font-weight: 500;
}

.input-group input[type="number"] {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.input-group.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
}

.hint {
    font-size: 0.9rem;
    color: #666;
}

.error-message {
    color: #dc3545;
    font-size: 0.9rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.cancel-btn,
.submit-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

.cancel-btn {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    color: #666;
}

.submit-btn {
    background-color: #4CAF50;
    border: none;
    color: white;
}

.submit-btn:disabled,
.cancel-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>