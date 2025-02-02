<script setup lang="ts">
import {ref} from 'vue'
import type {VocabCardDto} from '../services/vocab'
import {vocabService} from '../services/vocab'

interface VocabForm {
    word: string;
    translation: string;
    phonetic: string;
    partOfSpeech: string;
    exampleSentence: string;
    sentenceTranslation: string;
    relatedPhrase: string;
    phraseTranslation: string;
}

// @ts-ignore: props is used in template
defineProps<{
    show: boolean
}>()

const emit = defineEmits(['update:show', 'saved'])

// 表單欄位
const vocabForm = ref<VocabForm>({
    word: '',
    translation: '',
    phonetic: '',
    partOfSpeech: '',
    exampleSentence: '',
    sentenceTranslation: '',
    relatedPhrase: '',
    phraseTranslation: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

// 重置表單
const resetForm = () => {
    Object.keys(vocabForm.value).forEach(key => {
        vocabForm.value[key as keyof VocabForm] = ''
    })
    errorMessage.value = ''
}

// 關閉Modal
const closeModal = () => {
    emit('update:show', false)
    resetForm()
}

// 使用AI填入其餘欄位
const fillWithAI = async () => {
    if (!vocabForm.value.word.trim()) {
        errorMessage.value = '請至少輸入英文單字'
        return
    }
    
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        const wordInfo = await vocabService.getWordInfo(vocabForm.value.word)
        
        // 只更新空白的欄位
        const updateFields = (info: VocabCardDto) => {
            if (!vocabForm.value.translation && info.translation) {
                vocabForm.value.translation = info.translation
            }
            if (!vocabForm.value.phonetic && info.phonetic) {
                vocabForm.value.phonetic = info.phonetic
            }
            if (!vocabForm.value.partOfSpeech && info.partOfSpeech) {
                vocabForm.value.partOfSpeech = info.partOfSpeech
            }
            if (!vocabForm.value.exampleSentence && info.exampleSentence) {
                vocabForm.value.exampleSentence = info.exampleSentence
            }
            if (!vocabForm.value.sentenceTranslation && info.sentenceTranslation) {
                vocabForm.value.sentenceTranslation = info.sentenceTranslation
            }
            if (!vocabForm.value.relatedPhrase && info.relatedPhrase) {
                vocabForm.value.relatedPhrase = info.relatedPhrase
            }
            if (!vocabForm.value.phraseTranslation && info.phraseTranslation) {
                vocabForm.value.phraseTranslation = info.phraseTranslation
            }
        }
        
        updateFields(wordInfo)
        
    } catch (error: any) {
        console.error('取得單字資訊失敗:', error)
        errorMessage.value = error.response?.data || '無法取得單字資訊，請稍後再試'
    } finally {
        isLoading.value = false
    }
}

// 提交表單
const handleSubmit = async () => {
    if (!vocabForm.value.word.trim()) {
        errorMessage.value = '請至少輸入英文單字'
        return
    }
    
    try {
        isLoading.value = true
        errorMessage.value = ''
        
        await vocabService.createVocabCard(vocabForm.value.word)
        emit('saved')
        closeModal()
        
    } catch (error: any) {
        console.error('新增單字失敗:', error)
        errorMessage.value = error.response?.data || '新增失敗，請稍後再試'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <h2>新增單字</h2>
                <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            
            <form @submit.prevent="handleSubmit" class="modal-content">
                <!-- 英文單字 -->
                <div class="input-group">
                    <label for="word">英文單字</label>
                    <input
                        id="word"
                        type="text"
                        v-model="vocabForm.word"
                        placeholder="請輸入英文單字"
                        required
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 中文翻譯 -->
                <div class="input-group">
                    <label for="translation">中文翻譯</label>
                    <input
                        id="translation"
                        type="text"
                        v-model="vocabForm.translation"
                        placeholder="請輸入中文翻譯"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 音標 -->
                <div class="input-group">
                    <label for="phonetic">音標</label>
                    <input
                        id="phonetic"
                        type="text"
                        v-model="vocabForm.phonetic"
                        placeholder="請輸入音標"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 詞性 -->
                <div class="input-group">
                    <label for="partOfSpeech">詞性</label>
                    <input
                        id="partOfSpeech"
                        type="text"
                        v-model="vocabForm.partOfSpeech"
                        placeholder="請輸入詞性"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 英文例句 -->
                <div class="input-group">
                    <label for="exampleSentence">英文例句</label>
                    <input
                        id="exampleSentence"
                        type="text"
                        v-model="vocabForm.exampleSentence"
                        placeholder="請輸入英文例句"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 例句中文翻譯 -->
                <div class="input-group">
                    <label for="sentenceTranslation">例句中文翻譯</label>
                    <input
                        id="sentenceTranslation"
                        type="text"
                        v-model="vocabForm.sentenceTranslation"
                        placeholder="請輸入例句中文翻譯"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 相關片語 -->
                <div class="input-group">
                    <label for="relatedPhrase">相關片語、俚語</label>
                    <input
                        id="relatedPhrase"
                        type="text"
                        v-model="vocabForm.relatedPhrase"
                        placeholder="請輸入相關片語或俚語"
                        :disabled="isLoading"
                    >
                </div>
                
                <!-- 片語翻譯 -->
                <div class="input-group">
                    <label for="phraseTranslation">相關片語、俚語中文翻譯</label>
                    <input
                        id="phraseTranslation"
                        type="text"
                        v-model="vocabForm.phraseTranslation"
                        placeholder="請輸入片語中文翻譯"
                        :disabled="isLoading"
                    >
                </div>
                
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
                
                <div class="modal-footer">
                    <div class="function-buttons">
                        <button
                            type="button"
                            class="ai-btn"
                            @click="fillWithAI"
                            :disabled="isLoading"
                        >
                            {{ isLoading ? '處理中...' : 'AI填入' }}
                        </button>
                        
                        <button
                            type="button"
                            class="clear-btn"
                            @click="resetForm"
                            :disabled="isLoading"
                        >
                            清空欄位
                        </button>
                    </div>
                    
                    <div class="action-buttons">
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
                            {{ isLoading ? '處理中...' : '新增' }}
                        </button>
                    </div>
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
    max-width: 600px;
    max-height: 90vh;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
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
    gap: 1rem;
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

.input-group input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.input-group input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.error-message {
    color: #dc3545;
    font-size: 0.9rem;
}

.modal-footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.ai-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.ai-btn:hover {
    background-color: #1565C0;
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
.cancel-btn:disabled,
.ai-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.clear-btn {
    padding: 0.75rem;
    background-color: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.clear-btn:hover {
    background-color: #e9ecef;
}

.function-buttons {
    display: flex;
    gap: 1rem;
}

.function-buttons button {
    flex: 1;
}

@media (max-width: 768px) {
    .modal {
        width: 95%;
        max-height: 95vh;
        padding: 1rem;
    }
}
</style>