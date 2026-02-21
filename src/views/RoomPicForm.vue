<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">{{ roomName }}</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form>
        <div class="upload-area">
          <input ref="fileInput" type="file" accept="image/*" multiple @change="onFileChange" style="display:none" />
          <div class="drop-zone" :class="{ active: dragActive }" @click="openFileDialog"
            @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop">
            <div class="drop-content">
              <div class="drop-icon">📁</div>
              <div class="drop-text">拖曳檔案到此處，或點擊選擇檔案</div>
              <div class="drop-hint" v-if="selectedFiles.length">已選 {{ selectedFiles.length }} 個檔案</div>
            </div>
          </div>
          <div class="upload-actions">
            <button type="button" class="btn btn-primary btn-sm" @click.prevent="uploadSelected"
              :disabled="selectedFiles.length === 0 || uploading">上傳</button>
            <span v-if="uploading" style="margin-left:8px">上傳中...</span>
          </div>
        </div>
        <div class="room-pics">
          <div v-if="images.length === 0" class="text-muted">尚無圖片</div>
          <div class="pics-grid">
            <div v-for="(img, idx) in images" :key="img.path" class="pic-item">
              <div class="overlay">
                <button class="del-btn" @click.stop="deleteImage(img, idx)">刪除</button>
              </div>
              <div class="img-box">
                <img :src="img.url" :alt="roomName + ' 圖片 ' + (idx + 1)" />
              </div>
              <div class="pic-name">{{ img.name || (img.path ? img.path.split('/').pop() : '(無名稱)') }}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getToken, parseJwt } from '@/utils/auth'
import { createClient } from '@supabase/supabase-js'


export default defineComponent({
  name: 'RoomPicForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const roomId = Number((route.params.roomId as unknown as string) || 0) || undefined
    const houseId = Number((route.params.houseId as unknown as string) || 0) || undefined
    const roomName = ref(route.params.roomName as string || '房型圖片上傳')
    const loading = ref(false)
    const error = ref<string | null>(null)
    const navigating = ref(false)
    const images = ref<{ url: string; path: string; name: string }[]>([])
    const fileInput = ref<HTMLInputElement | null>(null)
    const openFileDialog = () => {
      if (fileInput.value) fileInput.value.click()
    }
    // Supabase 設定
    const supabaseUrl = 'https://wbxhtlxyuptuhhvdhyzq.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieGh0bHh5dXB0dWhodmRoeXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjgxNTUsImV4cCI6MjA2NjQ0NDE1NX0.bjfa-fZyZLec9PvxVJ_blV6N9e3BV2Rq0seq2wp5rHQ'
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const bucketName = 'PIC'

    const getImagesByRoomId = async (roomId: number, houseId: number): Promise<{ url: string; path: string; name: string }[]> => {
      const folderPath = `${houseId}/${roomId}`

      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list(folderPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        console.error('讀取圖片列表失敗：', error)
        return []
      }

      const files = (data || []).filter(obj =>
        !obj.name.startsWith('.') && /\.(jpe?g|png|webp|gif)$/i.test(obj.name)
      )

      const results: { url: string; path: string; name: string }[] = []
      for (const obj of files) {
        const path = `${folderPath}/${obj.name}`
        const { data: pubData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(path)
        let publicUrl = pubData?.publicUrl || ''
        if (!publicUrl) {
          try {
            const { data: signedData, error: signedErr } = await supabase
              .storage
              .from(bucketName)
              .createSignedUrl(path, 60)
            if (signedErr) {
              console.warn('createSignedUrl 失敗：', signedErr)
            } else if (signedData?.signedUrl) {
              publicUrl = signedData.signedUrl
            }
          } catch (e) {
            console.error('簽名 URL 發生錯誤', e)
          }
        }
        results.push({ url: publicUrl || '', path, name: obj.name })
      }

      return results
    }

    // 非同步讀取圖片：放在 onMounted 中以避免阻塞畫面渲染
    onMounted(async () => {
      loading.value = true
      try {
        const imgs = await getImagesByRoomId(roomId!, houseId!)
        images.value = imgs
        console.log('載入完成，圖片數量：', images.value.length)
        images.value.forEach((u, i) => console.log(i, u))
      } catch (e) {
        console.error('載入圖片時發生錯誤', e)
        error.value = (e as any)?.message || String(e)
      } finally {
        loading.value = false
      }
    })

    const deleteImage = async (img: { url: string; path: string; name: string }, idx: number) => {
      if (!img || !img.path) return
      const ok = confirm(`確定要刪除 ${img.name} 嗎？`)
      if (!ok) return
      loading.value = true
      try {
        const { data: delData, error: delErr } = await supabase
          .storage
          .from(bucketName)
          .remove([img.path])
        if (delErr) {
          console.error('刪除圖片失敗', delErr)
          error.value = delErr.message || String(delErr)
          return
        }
        images.value.splice(idx, 1)
      } catch (e) {
        console.error('刪除圖片時發生錯誤', e)
        error.value = (e as any)?.message || String(e)
      } finally {
        loading.value = false
      }
    }


    const selectedFiles = ref<File[]>([])
    const uploading = ref(false)
    const dragActive = ref(false)

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragActive.value = true
    }
    const onDragOver = (e: DragEvent) => { e.preventDefault(); }
    const onDragLeave = (e: DragEvent) => { e.preventDefault(); dragActive.value = false }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragActive.value = false
      const dt = e.dataTransfer
      if (!dt || !dt.files) return
      selectedFiles.value = Array.from(dt.files)
    }

    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (!target || !target.files) {
        selectedFiles.value = []
        return
      }
      selectedFiles.value = Array.from(target.files)
    }

    const uploadSelected = async () => {
      if (!selectedFiles.value.length) return
      if (!houseId || !roomId) {
        alert('缺少 houseId 或 roomId，無法上傳')
        return
      }
      uploading.value = true
      try {
        for (const file of selectedFiles.value) {
          const filename = `${file.name}`
          const path = `${houseId}/${roomId}/${filename}`
          const { data, error: upErr } = await supabase
            .storage
            .from(bucketName)
            .upload(path, file)
          if (upErr) {
            console.error('上傳失敗', upErr)
            error.value = upErr.message || String(upErr)
            continue
          }
          // 取得公開 URL
          const { data: pubData } = supabase.storage.from(bucketName).getPublicUrl(`${houseId}/${roomId}/${filename}`)
          const publicUrl = pubData?.publicUrl || ''
          images.value.push({ url: publicUrl, path: `${houseId}/${roomId}/${filename}`, name: filename })
        }
        // 清空選取
        selectedFiles.value = []
        if (fileInput.value) fileInput.value.value = ''
      } catch (e) {
        console.error('上傳過程發生錯誤', e)
        error.value = (e as any)?.message || String(e)
      } finally {
        uploading.value = false
      }
    }

    const readStoredUser = (): string | null => {
      try {
        const raw = localStorage.getItem('auth_user')
        if (!raw) return null
        // 如果是序列化的物件，回傳特定欄位，否則回傳字串
        try {
          const parsed = JSON.parse(raw)
          if (!parsed) return null
          return (parsed.name as string) || (parsed.email as string) || (parsed.user as string) || JSON.stringify(parsed)
        } catch {
          return raw
        }
      } catch {
        return null
      }
    }

    const displayUser = computed(() => {
      const stored = readStoredUser()
      if (stored) return stored
      const t = getToken()
      if (!t) return ''
      const payload = parseJwt(t)
      if (!payload) return ''
      const name = (payload as Record<string, any>)['name'] || (payload as Record<string, any>)['email'] || (payload as Record<string, any>)['sub'] || (payload as Record<string, any>)['user']
      return name ? String(name) : ''
    })



    const goBack = () => {
      if (navigating.value) return
      navigating.value = true
      router.back()
      // navigating flag will be irrelevant after navigation
    }

    return { loading, error, roomName, goBack, navigating, displayUser, images, deleteImage, fileInput, selectedFiles, onFileChange, uploadSelected, uploading, openFileDialog, dragActive, onDrop, onDragEnter, onDragLeave, onDragOver }
  }
})
</script>

<style scoped>
.room-pics .pics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.room-pics .pic-item {
  width: 200px;
  flex: 0 0 auto;
  overflow: visible;
  position: relative;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.room-pics .pic-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.room-pics .img-box {
  width: 200px;
  height: 160px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.room-pics .pic-name {
  padding: 6px 6px;
  font-size: 12px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.room-pics .pic-item .overlay {
  position: absolute;
  inset: 6px 6px auto auto;
  opacity: 0;
  transition: opacity .15s ease;
  pointer-events: none;
}

.room-pics .pic-item:hover .overlay {
  opacity: 1;
  pointer-events: auto;
}

.room-pics .del-btn {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
}

.room-pics .del-btn:active {
  transform: scale(.98)
}

.upload-area {
  margin-bottom: 12px;
}

.drop-zone {
  width: 100%;
  min-height: 120px;
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  transition: background .12s ease, border-color .12s ease;
}

.drop-zone.active {
  background: #f3f9ff;
  border-color: #4a90e2;
}

.drop-content {
  text-align: center;
  color: #666
}

.drop-icon {
  font-size: 28px;
  margin-bottom: 6px
}

.drop-text {
  font-size: 14px
}

.drop-hint {
  font-size: 12px;
  color: #444;
  margin-top: 6px
}

.upload-actions {
  margin-top: 8px
}

.upload-actions .btn {
  width: 100%;
}
</style>
