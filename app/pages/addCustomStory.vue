<template>
    <div dir="rtl" class="min-h-screen bg-white py-8">
        <main class="container mx-auto px-4 py-8 max-w-6xl">

            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-3">
                    {{ form.id ? 'إدارة القصة والسلايدات' : 'إضافة قصة جديدة' }}
                </h1>
                <p class="text-lg text-gray-600">
                    يمكنك تعديل التفاصيل أو إضافة سلايدات من الأسفل
                </p>
            </div>

            <div class="mb-8">
                <div class="bg-gray-50 rounded-2xl shadow-lg p-4 border border-purple-100">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-lg font-bold text-gray-800">تقدم تعبئة النموذج</h2>
                        <span class="text-xl font-bold text-purple-700">{{ progressPercentage }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            class="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <!-- Summary card (shown when saved and not editing) -->
                    <div v-if="form.id && !isEditingForm" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-200 mb-6">
                        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                            <h2 class="text-xl font-bold flex items-center gap-3">
                                <span class="material-icons text-3xl">book</span>
                                ملخص القصة
                            </h2>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="flex items-start gap-4">
                                <img :src="form.imageUrl" alt="صورة الغلاف" 
                                    class="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200" v-if="form.imageUrl">
                                <div>
                                    <h3 class="text-2xl font-bold text-gray-800">{{ form.title }}</h3>
                                    <p class="text-sm text-gray-500 mb-2">المؤلف: **{{ form.authorName }}**</p>
                                    <p class="text-gray-700 line-clamp-3">{{ form.description }}</p>
                                </div>
                            </div>

                            <div class="flex gap-4 border-t pt-4">
                                <button type="button" @click="startEditing"
                                    class="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 font-medium shadow-md w-full">
                                    <span class="material-icons">edit_note</span>تعديل التفاصيل
                                </button>
                                <button type="button" @click="deleteStory"
                                    class="flex items-center justify-center gap-2 px-6 py-3 border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium w-full">
                                    <span class="material-icons">delete_forever</span>حذف القصة
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Add / Edit form (separate modes but same UI) -->
                    <div v-if="!form.id || isEditingForm" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-200 mb-6">
                        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                            <h2 class="text-xl font-bold flex items-center gap-3">
                                <span class="material-icons text-3xl">library_add</span>
                                {{ isAddMode ? 'إضافة قصة جديدة' : 'تعديل تفاصيل القصة' }}
                            </h2>
                        </div>

                        <form @submit.prevent="saveStory" class="p-6 space-y-6">

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">عنوان القصة <span class="text-red-500">*</span></label>
                                <input v-model="editForm.title" type="text" required
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200"
                                    placeholder="أدخل عنوان القصة" />
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">اسم المؤلف <span class="text-red-500">*</span></label>
                                <input v-model="editForm.authorName" type="text" required
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200"
                                    placeholder="أدخل اسم المؤلف" />
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">وصف القصة <span class="text-red-500">*</span></label>
                                <textarea v-model="editForm.description" rows="4" required
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200 resize-none"
                                    placeholder="أدخل وصفاً مفصلاً للقصة..."></textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-3">صورة الغلاف <span
                                        class="text-red-500">*</span></label>

                                <div @click="imageInputClick"
                                    class="border-3 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-purple-500 hover:bg-purple-50 h-40 flex flex-col items-center justify-center"
                                    :class="{ 'border-green-500 bg-green-50': editImagePreview }">

                                    <template v-if="!editImagePreview">
                                        <span class="material-icons text-4xl text-gray-400 mb-2">image</span>
                                        <p class="text-sm font-medium text-gray-600">انقر لرفع صورة الغلاف</p>
                                        <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG - الحد 5MB</p>
                                    </template>

                                    <template v-else>
                                        <div class="relative w-full h-full">
                                            <img :src="editImagePreview" alt="صورة الغلاف"
                                                class="w-full h-full object-cover rounded-lg">
                                            <div
                                                class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <button type="button" @click.stop="removeEditImage"
                                                    class="bg-red-500 text-white p-2 rounded-full">
                                                    <span class="material-icons text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </template>

                                    <input ref="imageInput" type="file" accept="image/*" @change="onEditImageSelected"
                                        class="hidden" />
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button type="button" @click="goBackOrCancel"
                                    class="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
                                    <span class="material-icons">arrow_back</span>
                                    {{ isAddMode ? 'رجوع' : 'إلغاء التعديل' }}
                                </button>

                                <button type="submit" :disabled="loading"
                                    class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg">
                                    <span class="material-icons">{{ loading ? 'autorenew' : 'save' }}</span>
                                    {{ loading ? 'جاري الحفظ...' : (isAddMode ? 'إضافة القصة' : 'حفظ التعديلات') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">إحصائيات</h3>
                        <div class="space-y-4">
                            <div class="p-4 bg-purple-50 rounded-xl">
                                <p class="text-sm text-gray-600">حالة القصة</p>
                                <p class="text-sm font-medium text-purple-600">{{ form.id ? 'تم الحفظ' : 'غير محفوظة' }}</p>
                            </div>
                            <div class="p-4 bg-indigo-50 rounded-xl">
                                <p class="text-sm text-gray-600">عدد السلايدات</p>
                                <p class="text-3xl font-bold text-indigo-600">{{ slides.length }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Slides section only visible after story saved -->
            <div class="mt-8" v-if="form.id">
                <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-200">
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                        <div class="flex items-center gap-3">
                            <span class="material-icons text-3xl">layers</span>
                            <h2 class="text-xl font-bold">السلايدات {{ slides.length > 0 ? `(${slides.length})` : '' }}
                            </h2>
                        </div>
                    </div>

                    <div class="p-6">
                        <div v-if="slides.length > 0"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div v-for="(slide, idx) in slides" :key="slide.id || idx"
                                class="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 transition-colors group">

                                <div class="relative h-40 bg-gray-100 overflow-hidden">
                                    <img v-if="slide.imageUrl" :src="slide.imageUrl" :alt="slide.title"
                                        class="w-full h-full object-cover">
                                    <div v-else
                                        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                        <span class="material-icons text-gray-400 text-4xl">image</span>
                                    </div>

                                    <div
                                        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button @click="editSlide(idx)"
                                            class="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
                                            title="تعديل">
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <button @click="deleteSlide(idx)"
                                            class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                            title="حذف">
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </div>

                                    <div
                                        class="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {{ idx + 1 }}
                                    </div>
                                </div>

                                <div class="p-4">
                                    <h4 class="font-bold text-gray-800 mb-1 line-clamp-1">{{ slide.title || 'بدون عنوان'
                                        }}</h4>
                                    <p class="text-sm text-gray-600 line-clamp-2">{{ slide.description || 'بدون وصف' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-12">
                            <span class="material-icons text-6xl text-gray-300 block mb-4">layers_clear</span>
                            <p class="text-gray-500 text-lg">لم تضف أي سلايدات حتى الآن</p>
                        </div>

                        <button @click="openAddSlideModal"
                            class="w-full py-3 border-2 border-dashed border-purple-400 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium flex items-center justify-center gap-2">
                            <span class="material-icons">add</span>
                            إضافة سلايد جديد
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Toasts and Slide modal (unchanged) -->
        <div
            class="fixed inset-0 pointer-events-none z-50 flex items-start justify-center px-4 pt-6 sm:items-end sm:justify-end sm:pr-6">
            <div class="w-full flex flex-col items-center sm:items-end space-y-3">
                <transition-group name="toast" tag="div">
                    <div v-for="t in toasts" :key="t.id" class="pointer-events-auto max-w-sm w-full">
                        <div :class="[
                            'rounded-lg shadow-lg ring-1 ring-black/5 p-3 flex items-start gap-3',
                            t.type === 'success' ? 'bg-green-50 text-green-800' : '',
                            t.type === 'error' ? 'bg-red-50 text-red-800' : '',
                            t.type === 'info' ? 'bg-blue-50 text-blue-800' : ''
                        ]">
                            <div class="mt-0.5">
                                <svg v-if="t.type === 'success'" class="h-6 w-6 text-green-600" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                <svg v-else-if="t.type === 'error'" class="h-6 w-6 text-red-600" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div class="flex-1 text-sm leading-tight">
                                <div class="font-medium">{{ t.message }}</div>
                            </div>
                            <button @click="toasts = toasts.filter(x => x.id !== t.id)"
                                class="text-gray-400 hover:text-gray-600 ml-2">
                                <span class="material-icons text-base">close</span>
                            </button>
                        </div>
                    </div>
                </transition-group>
            </div>
        </div>

        <div v-if="isSlideModalOpen"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white sticky top-0">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="material-icons">{{ editingSlideIndex !== null ? 'edit' : 'add' }}</span>
                            <h3 class="text-xl font-bold">{{ editingSlideIndex !== null ? 'تعديل السلايد' : 'إضافة سلايد جديد' }}</h3>
                        </div>
                        <button @click="closeSlideModal"
                            class="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>

                <form @submit.prevent="saveSlide" class="p-6 space-y-6">

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">عنوان السلايد *</label>
                        <input v-model="currentSlide.title" type="text" required
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200"
                            placeholder="أدخل عنوان السلايد" />
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">وصف السلايد *</label>
                        <textarea v-model="currentSlide.description" rows="4" required
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200 resize-none"
                            placeholder="أدخل وصف السلايد..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-3">صورة السلايد <span
                                class="text-red-500">*</span></label>

                        <div @click="slideImageInputClick"
                            class="border-3 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-purple-500 hover:bg-purple-50 h-40 flex flex-col items-center justify-center"
                            :class="{ 'border-green-500 bg-green-50': slideImagePreview }">

                            <template v-if="!slideImagePreview">
                                <span class="material-icons text-4xl text-gray-400 mb-2">image</span>
                                <p class="text-sm font-medium text-gray-600">انقر لرفع صورة السلايد</p>
                                <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG - الحد 5MB</p>
                            </template>

                            <template v-else>
                                <div class="relative w-full h-full">
                                    <img :src="slideImagePreview" alt="صورة السلايد"
                                        class="w-full h-full object-cover rounded-lg">
                                    <div
                                        class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <button type="button" @click.stop="removeSlideImage"
                                            class="bg-red-500 text-white p-2 rounded-full">
                                            <span class="material-icons text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </template>

                            <input ref="slideImageInput" type="file" accept="image/*" @change="onSlideImageSelected"
                                class="hidden" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button type="button" @click="closeSlideModal"
                            class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
                            إلغاء
                        </button>

                        <button type="submit" :disabled="slideLoading"
                            class="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                            <span class="material-icons">{{ slideLoading ? 'autorenew' : 'save' }}</span>
                            {{ slideLoading ? 'جاري الحفظ...' : 'حفظ السلايد' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'

const route = useRoute()
const router = useRouter()


const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// saved form (represents persisted story data)
const form = reactive({
    id: null,
    title: '',
    authorName: '',
    description: '',
    imageUrl: '',
    image_file: null
})

// editForm buffer (used for both add and edit)
const editForm = reactive({
    title: '',
    authorName: '',
    description: '',
    imageUrl: '',
    image_file: null
})

const isEditingForm = ref(false)   // whether the edit/add form is open
const isAddMode = ref(false)       // true = adding new story, false = editing existing
const slides = ref([])
const currentSlide = reactive({
    id: null,
    title: '',
    description: '',
    imageUrl: '',
    image_file: null
})

const loading = ref(false)
const slideLoading = ref(false)
const imageInput = ref(null)
const slideImageInput = ref(null)
const isSlideModalOpen = ref(false)
const editingSlideIndex = ref(null)
const toasts = ref([])

const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    toasts.value.push({ id, message, type })
    setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
}
const showSuccess = (m,d=4000) => addToast(m,'success',d)
const showError = (m,d=4000) => addToast(m,'error',d)

// computed previews use editForm while editing/adding
const progressPercentage = computed(() => {
    const totalRequired = 4
    let filled = 0
    if (editForm.title && editForm.title.trim().length > 0) filled++
    if (editForm.authorName && editForm.authorName.trim().length > 0) filled++
    if (editForm.description && editForm.description.trim().length > 0) filled++
    if (editForm.image_file || editForm.imageUrl) filled++
    return Math.min(100, Math.round((filled / totalRequired) * 100))
})

const editImagePreview = computed(() => {
    if (editForm.image_file) return URL.createObjectURL(editForm.image_file)
    if (editForm.imageUrl) return editForm.imageUrl
    return ''
})

const slideImagePreview = computed(() => {
    if (currentSlide.image_file) return URL.createObjectURL(currentSlide.image_file)
    if (currentSlide.imageUrl) return currentSlide.imageUrl
    return ''
})

const getCookie = (name) => {
    if (process.client) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        return v ? decodeURIComponent(v.pop()) : ''
    }
    return ''
}
const getToken = () => getCookie('authToken') || getCookie('token') || ''

const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const url = `${API_BASE}/api/Upload/UploadImage`
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(url, { method: 'POST', body: fd, headers })
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(text || 'فشل رفع الصورة')
    }
    const data = await res.json()
    return data.url || data.data?.url || ''
}

// IMAGE (editForm) handlers
const imageInputClick = () => imageInput.value?.click()
const onEditImageSelected = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { showError('الملف ليس صورة'); return }
    if (f.size > 5 * 1024 * 1024) { showError('حجم الصورة يتجاوز 5MB'); return }
    editForm.image_file = f
    editForm.imageUrl = ''
}
const removeEditImage = () => {
    editForm.image_file = null
    editForm.imageUrl = ''
    if (imageInput.value) imageInput.value.value = null
}

// EDIT / ADD flow
const startEditing = () => {
    // populate editForm from saved form, open edit mode
    editForm.title = form.title || ''
    editForm.authorName = form.authorName || ''
    editForm.description = form.description || ''
    editForm.imageUrl = form.imageUrl || ''
    editForm.image_file = null
    isAddMode.value = false
    isEditingForm.value = true
}

const startAdding = () => {
    // clear editForm and open in add mode
    editForm.title = ''
    editForm.authorName = ''
    editForm.description = ''
    editForm.imageUrl = ''
    editForm.image_file = null
    isAddMode.value = true
    isEditingForm.value = true
}

const goBackOrCancel = () => {
    if (!isEditingForm.value) {
        history.back()
        return
    }

    if (isAddMode.value) {
        // cancel adding -> go back to previous page
        history.back()
        return
    }

    // cancel editing -> discard changes and show summary
    isEditingForm.value = false
    // no changes to saved form needed; ensure editForm cleared
    editForm.title = form.title || ''
    editForm.authorName = form.authorName || ''
    editForm.description = form.description || ''
    editForm.imageUrl = form.imageUrl || ''
    editForm.image_file = null
}

// SAVE story (handles add & update)
const saveStory = async () => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.authorName.trim()) {
        showError('يرجى ملء جميع الحقول المطلوبة (العنوان، الوصف، واسم المؤلف).')
        return
    }
    if (!editForm.image_file && !editForm.imageUrl) {
        showError('يرجى رفع صورة الغلاف')
        return
    }

    loading.value = true
    try {
        if (editForm.image_file) {
            editForm.imageUrl = await uploadImage(editForm.image_file)
            editForm.image_file = null
        }

        const body = {
            title: editForm.title,
            authorName: editForm.authorName.trim(),
            description: editForm.description,
            imageUrl: editForm.imageUrl
        }

        const isNew = isAddMode.value
        let endpoint = isNew ? `${API_BASE}/api/CustomStories/Add` : `${API_BASE}/api/CustomStories/Update`
        let method = isNew ? 'POST' : 'PUT'

        if (!isNew) body.id = form.id

        const token = getToken()
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }

        const res = await fetch(endpoint, { method, headers, body: JSON.stringify(body) })
        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            throw new Error(errText || 'فشل حفظ القصة')
        }

        // if adding, try to parse returned id; if editing, update saved form with editForm
        if (isNew) {
            let receivedId = null
            const contentType = res.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json().catch(() => ({}))
                receivedId = data.id
            } else {
                const textResponse = await res.text().catch(() => '')
                const match = textResponse.match(/Id\s+([\w\d\-]+)/i)
                if (match && match[1]) receivedId = match[1]
            }

            if (receivedId) {
                form.id = receivedId
                form.title = editForm.title
                form.authorName = editForm.authorName
                form.description = editForm.description
                form.imageUrl = editForm.imageUrl
                showSuccess('🎉 تم إضافة القصة بنجاح! يمكنك الآن إضافة السلايدات.', 3000)
            } else {
                showError('تم حفظ القصة لكن لم يتم استلام الـ ID من الخادم.', 6000)
            }
        } else {
            // update saved form
            form.title = editForm.title
            form.authorName = editForm.authorName
            form.description = editForm.description
            form.imageUrl = editForm.imageUrl
            showSuccess('تم تحديث القصة بنجاح!')
        }

        // close edit form and ensure slides loaded
        isEditingForm.value = false
        isAddMode.value = false
        if (form.id) await loadSlidesData(form.id)
    } catch (error) {
        console.error('Story save error:', error)
        showError(error.message || 'حدث خطأ أثناء الحفظ')
    } finally {
        loading.value = false
    }
}

// ...existing code...
const deleteStory = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه القصة والسلايدات الخاصة بها؟')) return
    loading.value = true
    try {
        const token = getToken()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`${API_BASE}/api/CustomStories/Delete/${form.id}`, {
            method: 'DELETE',
            headers
        })
        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            throw new Error(errText || 'فشل حذف القصة')
        }

        // show toast then small delay so user can see it before navigation
        showSuccess('تم حذف القصة بنجاح')
        await new Promise(r => setTimeout(r, 1200))
        await router.push('/')
    } catch (error) {
        console.error('Story delete error:', error)
        showError(error.message || 'فشل حذف القصة')
    } finally {
        loading.value = false
    }
}
// ...existing code...
// SLIDES logic unchanged except add guard
const slideImageInputClick = () => slideImageInput.value?.click()
const onSlideImageSelected = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { showError('الملف ليس صورة'); return }
    if (f.size > 5 * 1024 * 1024) { showError('حجم الصورة يتجاوز 5MB'); return }
    currentSlide.image_file = f
    currentSlide.imageUrl = ''
}
const removeSlideImage = () => {
    currentSlide.image_file = null
    currentSlide.imageUrl = ''
    if (slideImageInput.value) slideImageInput.value.value = null
}

const openAddSlideModal = () => {
    if (!form.id) {
        showError('احفظ القصة أولاً ثم أضف السلايدات.')
        return
    }
    editingSlideIndex.value = null
    currentSlide.id = null
    currentSlide.title = ''
    currentSlide.description = ''
    currentSlide.imageUrl = ''
    currentSlide.image_file = null
    isSlideModalOpen.value = true
}

const editSlide = (index) => {
    const slide = slides.value[index]
    editingSlideIndex.value = index
    currentSlide.id = slide.id || null
    currentSlide.title = slide.title
    currentSlide.description = slide.description
    currentSlide.imageUrl = slide.imageUrl
    currentSlide.image_file = null
    isSlideModalOpen.value = true
}

const closeSlideModal = () => {
    isSlideModalOpen.value = false
    removeSlideImage()
}

const saveSlide = async () => {
    if (!currentSlide.title.trim() || !currentSlide.description.trim()) { showError('يرجى ملء جميع الحقول المطلوبة'); return }
    if (!currentSlide.image_file && !currentSlide.imageUrl) { showError('يرجى رفع صورة السلايد'); return }
    const storyId = form.id
    if (!storyId) { showError('يرجى حفظ القصة أولاً قبل إضافة السلايدات.'); return }

    slideLoading.value = true
    try {
        if (currentSlide.image_file) {
            currentSlide.imageUrl = await uploadImage(currentSlide.image_file)
            currentSlide.image_file = null
        }

        const isNewSlide = editingSlideIndex.value === null
        const token = getToken()
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        let endpoint = ''
        let method = ''
        let body = {}
        if (isNewSlide) {
            endpoint = `${API_BASE}/api/CustomStoryItems/Add`
            method = 'POST'
            body = { customStoryId: storyId, title: currentSlide.title, description: currentSlide.description, imageUrl: currentSlide.imageUrl }
        } else {
            endpoint = `${API_BASE}/api/CustomStoryItems/Update`
            method = 'PUT'
            body = { id: currentSlide.id, title: currentSlide.title, description: currentSlide.description, imageUrl: currentSlide.imageUrl }
        }
        const res = await fetch(endpoint, { method, headers, body: JSON.stringify(body) })
        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            throw new Error(errText || `فشل ${isNewSlide ? 'إضافة' : 'تحديث'} السلايد`)
        }
        showSuccess(isNewSlide ? 'تم إضافة السلايد بنجاح' : 'تم تحديث السلايد بنجاح')
        await loadSlidesData(storyId)
        closeSlideModal()
    } catch (error) {
        console.error('Slide save error:', error)
        showError(error.message || 'حدث خطأ أثناء الحفظ')
    } finally {
        slideLoading.value = false
    }
}

const deleteSlide = async (index) => {
    if (!confirm('هل أنت متأكد من حذف هذا السلايد؟')) return
    const slide = slides.value[index]
    const storyId = form.id
    if (!slide.id || !storyId) { showError('تعذر الحذف: بيانات السلايد غير كاملة.'); return }
    try {
        const token = getToken()
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`${API_BASE}/api/CustomStoryItems/Delete/${slide.id}`, { method: 'DELETE', headers })
        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            throw new Error(errText || 'فشل حذف السلايد')
        }
        await loadSlidesData(storyId)
        showSuccess('تم حذف السلايد بنجاح')
    } catch (error) {
        console.error('Slide delete error:', error)
        showError(error.message || 'فشل حذف السلايد')
    }
}

const loadSlidesData = async (storyId) => {
    if (!storyId) return
    try {
        const body = { id: storyId, itemsPageNumber: 1, itemsPageSize: 100, itemsOrderBy: 'createdAt', itemsDescending: true }
        const token = getToken()
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const res = await fetch(`${API_BASE}/api/CustomStories/GetById`, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) throw new Error('فشل تحميل السلايدات')
        const data = await res.json()
        if (data.items && data.items.items) {
            slides.value = data.items.items.map(item => ({ id: item.id, title: item.title, description: item.description, imageUrl: item.imageUrl }))
        } else {
            slides.value = []
        }
    } catch (error) {
        console.error('Load slides error:', error)
    }
}

const loadStoryData = async (shouldSetEditingForm = true) => {
    const storyId = route.params.id
    if (!storyId) {
        // no id -> start adding new story
        isAddMode.value = true
        isEditingForm.value = true
        return
    }

    form.id = storyId
    loading.value = true
    isEditingForm.value = shouldSetEditingForm

    try {
        const body = { id: storyId, itemsPageNumber: 1, itemsPageSize: 1, itemsOrderBy: 'createdAt', itemsDescending: true }
        const token = getToken()
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const res = await fetch(`${API_BASE}/api/CustomStories/GetById`, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            throw new Error(errText || 'فشل تحميل بيانات القصة')
        }
        const data = await res.json()
        form.title = data.title
        form.authorName = data.authorName || ''
        form.description = data.description
        form.imageUrl = data.imageUrl
        // load slides
        await loadSlidesData(storyId)
        // show summary by default
        isEditingForm.value = false
        isAddMode.value = false
    } catch (error) {
        console.error('Load story error:', error)
        showError(error.message || 'فشل تحميل بيانات القصة')
        isEditingForm.value = true
        isAddMode.value = false
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadStoryData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');


/* line-clamp */
.line-clamp-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}
.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}

/* toast transitions */
.toast-enter-active,.toast-leave-active{transition:all .25s ease}
.toast-enter-from{opacity:0;transform:translateY(-8px) scale(.98)}
.toast-enter-to{opacity:1;transform:translateY(0) scale(1)}
.toast-leave-from{opacity:1;transform:translateY(0) scale(1)}
.toast-leave-to{opacity:0;transform:translateY(-6px) scale(.98)}
</style>