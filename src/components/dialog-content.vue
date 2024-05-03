<script setup lang="ts">
import { getImg } from '@/api/home'
import { ref, inject, nextTick } from 'vue'
const { uid, content, imgUrlList } = defineProps({
  uid: Number,
  content: String,
  imgUrlList: Array<String>
})
const myImg = ref('')
const gptImg = ref('/upload2024-3/people.png')
const clientImg = ref('/upload2024-3/my.png')
const imgUrlBlobs = ref<Array<String>>([])
const scrollBottom = inject<Function>('scrollBottom')
// const isLoading = ref(true)
const isRollBottom = ref(false)
const getImgUrl = async (url: string) => {
  let res = ref('')
  await getImg(url, true).then((resp) => {
    const blob = new Blob([resp.data])
    const imageUrl = URL.createObjectURL(blob)
    res.value = imageUrl
  })
  return res
}
const getImgUrlBlobs = async () => {
  if (content === '' && imgUrlList!.length === 0) {
    return
  }
  if (imgUrlList) {
    for (const url of imgUrlList) {
      let imageUrl = ''
      await getImgUrl(url.toString())
        .then((resp) => {
          imageUrl = resp.value
        })
        .catch((err) => {
          console.log('getImgUrlBlobs: ', err)
        })
      imgUrlBlobs.value.push(imageUrl)
    }
    if (!isRollBottom.value) {
      isRollBottom.value = true
      nextTick(() => {
        scrollBottom?.() // 让聊天框滚动到底层，值随意，足够大即可
        // isLoading.value = false
        isRollBottom.value = false
      })
    }
  }
}
const getHeaderUrlBlob = async () => {
  let tmp
  if (uid && uid % 2 != 0) {
    tmp = gptImg.value
  } else {
    tmp = clientImg.value
  }
  if (tmp) {
    await getImgUrl(tmp.toString()).then((resp) => {
      myImg.value = resp.value
    })
  }
}
getHeaderUrlBlob()
getImgUrlBlobs()
</script>
<template>
  <div class="contanier">
    <div class="header">
      <el-avatar shape="square" :size="30" :src="myImg" />
    </div>
    <!-- <div
      v-if="isLoading"
      v-loading="isLoading"
      style="width: 100px; height: 100px"
    ></div> -->
    <div>
      <div class="img-box" v-for="(item, index) in imgUrlBlobs" :key="index">
        <el-image
          style="width: 100px; height: 100px"
          :src="item.toString()"
          fit="contain"
          :preview-src-list="[item.toString()]"
          :lazy="true"
        />
      </div>
      <br />
      <div class="dialog">
        {{ content }}
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.contanier {
  padding: 10px 15px;
  .header {
    .el-avatar {
      background-color: rgb(231, 248, 255);
    }
  }
  .img-box {
    display: inline-block;
    .el-image {
      margin-right: 15px;
    }
  }
  .dialog {
    display: inline-block;
    background-color: rgb(242, 242, 242);
    max-width: 50%;
    padding: 5px;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-x: auto;
  }
}
</style>
