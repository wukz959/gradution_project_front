<script setup lang="ts">
import {
  Search,
  CirclePlus,
  Setting,
  ChatRound,
  Position,
  Share,
  EditPen
} from '@element-plus/icons-vue'
import { ref, watch, provide, getCurrentInstance, nextTick } from 'vue'
import type {
  UploadInstance,
  UploadRequestOptions,
  UploadRawFile,
  UploadFile,
  UploadFiles,
  ElScrollbar
} from 'element-plus'
import { uploadDialog, getDialogHistory } from '@/api/home'
import { useLoginStore } from '@/stores'
import { getDialogResp } from '@/api/home'

export interface dialogData {
  id: number
  content: string
  header?: string
  imgList?: string[]
}
export interface respData {
  content: string
  fileNameList: string[]
  fileUrlList: string[]
}
export interface dialogInterface {
  id: number
  content: string
  imgUrlList: string[]
}

const loginStore = useLoginStore()
const hadUploadFile = ref(false)
const limitFileCount = ref(1)
const uploadRef = ref<UploadInstance>()
const whiteList = ref(['jpg', 'jpeg', 'png']) //允许上传的文件类型
const questionDesc = ref()
const fileList = ref<UploadFiles>()
const sessionSeq = ref(0)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const btnModeColor = ref('#FFFFFF')
const dialogList = ref<Array<dialogInterface>>([
  {
    id: 1,
    content: '跟我聊聊天吧~',
    imgUrlList: []
  }
])

const getDialogRespFun = (
  sessionSeq: number,
  content: string,
  isImageMode: string,
  fileUrlList?: Array<string>
) => {
  let { userId } = loginStore.getTokenInfo()
  getDialogResp(userId, sessionSeq, content, isImageMode, fileUrlList || [])
    .then((resp) => {
      // dialogList.value.splice(dialogList.value.length - 1, 1)
      const data = resp.data.data
      let imgUrlList = data.fileUrlList as string[]
      let content = data.content
      dialogList.value.push({
        id: dialogList.value.length + 1,
        content: content,
        imgUrlList: imgUrlList
      })
    })
    .catch((error) => {
      dialogList.value.pop()
    })
}
const uploadFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  const suffix = uploadFile.name.substring(uploadFile.name.lastIndexOf('.') + 1)
  if (!whiteList.value.includes(suffix)) {
    uploadFiles.pop()
    ElMessage({
      message: '上传失败！图片必须为jpg、jpeg、png其中一种格式',
      type: 'warning'
    })
  } else if (uploadFile.size! > 1024 * 1024 * 5) {
    uploadFiles.pop()
    ElMessage({
      message: '图片大小不能超过5MB',
      type: 'warning'
    })
  }
  fileList.value = uploadFiles
}
const uploadFileSuccess = (
  res: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  // console.log('uploadFileSuccess', res, uploadFile, uploadFiles)
}
// 设置了auto-upload=false，则在上传图片时触发before-upload，只有在将图片上传到服务器时才统一触发一次
const beforeUploadCheck = (file: UploadRawFile) => {
  return true
}
const confirmSendQuestion = async () => {
  if (!questionDesc.value.value) {
    ElMessage({
      message: '输入不能为空',
      type: 'warning'
    })
    return
  }
  uploadRef.value!.submit() // 会执行uploadFileRequest函数，但如果没有上传文件则不会触发
  if (!fileList.value || fileList.value.length === 0) {
    // 没上传文件时，则手动调用
    let options: UploadRequestOptions = {} as UploadRequestOptions
    // 将输入内容传给后端
    await uploadDialogRequest(options)
  }
}

const uploadDialogRequest = async (options: UploadRequestOptions) => {
  if (!questionDesc.value.value) {
    return
  }
  const formData = new FormData()
  if (fileList.value) {
    fileList.value.forEach((file: UploadFile) => {
      formData.append('file', file.raw!)
    })
  }
  formData.append('sessionSeq', String(sessionSeq.value))
  formData.append('content', questionDesc.value.value)
  let isImageMode = String(btnModeColor.value === '#626aef')
  formData.append('isImageMode', isImageMode)
  return await uploadDialog(formData)
    .then(async (res) => {
      const fileUrlList = res.data.clientData.fileUrlList as string[]

      dialogList.value.push({
        id: dialogList.value.length + 1,
        content: questionDesc.value.value.trim(),
        imgUrlList: fileUrlList
      })

      let tmpQuestionDesc = questionDesc.value.value
      fileList.value = []
      questionDesc.value.value = ''
      getDialogRespFun(0, tmpQuestionDesc, isImageMode, fileUrlList)
      // options.onSuccess(res) // 这个好像是让上传成功的图片显示绿色的钩子而已，又不能调用on-success绑定的方法
    })
    .catch((err) => {
      dialogList.value.pop()
      // options.onError(err)
    })
}
const scrollBottom = () => {
  scrollbarRef.value!.setScrollTop(10000)
}
const removeFile = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  fileList.value = uploadFiles
}
const uploadFailed = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  ElMessage({
    message: '查询失败，请重试',
    type: 'error',
    grouping: true
  })
  fileList.value?.push(uploadFile)
}
const changeToImageMode = () => {
  if (btnModeColor.value === '#626aef') {
    btnModeColor.value = '#FFFFFF'
  } else {
    btnModeColor.value = '#626aef'
  }
}
const readDialogHistory = () => {
  const { userId } = loginStore.getTokenInfo()
  getDialogHistory(userId, 0).then((res) => {
    let historyData = res.data.data
    if (historyData && historyData.length !== 0) {
      historyData.forEach((item: respData) => {
        dialogList.value.push({
          id: dialogList.value.length + 1,
          content: item.content,
          imgUrlList: item.fileUrlList
        })
      })
    }
  })
}

readDialogHistory()
watch(
  fileList,
  (newVal: any, oldVal) => {
    hadUploadFile.value = newVal.length > 0
  },
  {
    deep: true
  }
)
provide('scrollBottom', scrollBottom)
</script>
<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col :span="5" class="left-side">
          <div class="side-content">
            <div class="header">
              <div class="header-box">
                <div class="title">设计师 你好啊</div>
                <div class="domain">www.helloenen.fun</div>
              </div>
              <div class="img-box">
                <!-- <el-avatar :size="50" :src="catPng" /> -->
              </div>
            </div>
            <div class="plugin-button">
              <el-button size="large" :icon="Search" plain>插件</el-button>
              <el-button size="large" :icon="ChatRound" plain>插件</el-button>
            </div>
            <div class="chat-window">
              <el-scrollbar height="500px">
                <new-diglog></new-diglog>
                <!-- <new-diglog></new-diglog>
                <new-diglog></new-diglog> -->
              </el-scrollbar>
            </div>
            <div class="footer">
              <el-button :icon="Setting" plain></el-button>
              <el-button :icon="CirclePlus" plain>新的聊天</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="19" class="right-side">
          <el-header>
            <div>
              <div class="dialog-title">新的聊天</div>
              <div class="dialog-count">共0条对话</div>
            </div>
            <div class="dialog-btn">
              <el-button :icon="EditPen" plain></el-button>
              <el-button :icon="Share" plain></el-button>
            </div>
          </el-header>
          <el-main>
            <el-scrollbar ref="scrollbarRef" height="430px">
              <dialog-content
                v-for="item in dialogList"
                :key="item.id"
                :uid="item.id"
                :content="item.content"
                :imgUrlList="item.imgUrlList"
              ></dialog-content>
            </el-scrollbar>
          </el-main>

          <el-footer>
            <div class="input-option">
              <el-upload
                ref="uploadRef"
                class="upload-btn"
                :http-request="uploadDialogRequest"
                :auto-upload="false"
                :on-remove="removeFile"
                :limit="limitFileCount"
                :on-change="uploadFileChange"
                :on-success="uploadFileSuccess"
                :on-error="uploadFailed"
                :before-upload="beforeUploadCheck"
                :file-list="fileList"
                list-type="picture"
              >
                <template #trigger>
                  <el-button size="small" :disabled="btnModeColor !== '#626aef'"
                    >上传图片</el-button
                  >
                </template>
                <template #default>
                  <el-tooltip content="打开则将根据对话生成图片">
                    <el-button
                      size="small"
                      @click="changeToImageMode"
                      :color="btnModeColor"
                      >图片模式</el-button
                    >
                  </el-tooltip>
                </template>
                <template #tip>
                  <div class="el-upload__tip" v-show="!hadUploadFile">
                    jpg/png files with a size less than 500kb
                  </div>
                </template>
              </el-upload>
            </div>
            <!-- :maxlength="maxLength"
                v-model="inputText"
                @keydown.enter="commitQuestion" -->
            <div class="input-content">
              <textarea
                placeholder="输入看看"
                class="input-text"
                rows="3"
                ref="questionDesc"
              ></textarea>
              <div class="input-btn">
                <el-button :icon="Position" @click="confirmSendQuestion"
                  >发送</el-button
                >
              </div>
            </div>
          </el-footer>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>
<style lang="scss" scoped>
.el-container {
  background-color: rgb(234, 234, 234);
  height: 100vh;
  padding: 20px 100px 20px 100px;
  .el-main {
    background-color: rgb(255, 255, 255);
    border-radius: 1em;
    padding: 0px;
    overflow: hidden;
    .el-row {
      height: 100%;
      .left-side {
        background-color: rgb(231, 248, 255);
        padding: 20px 8px 8px 8px;
        .side-content {
          display: flex;
          flex-direction: column;
          .header {
            flex: 1 0 auto;
            flex-grow: 0.3;
            font-weight: bold;
            font-size: large;
            padding: 3px;
            display: flex;
            justify-content: space-between;
            .header-box {
              // .title {
              // }
              .domain {
                font-size: small;
                font-weight: lighter;
                color: rgb(89, 88, 88);
              }
            }
            // .img-box {
            //   .el-avatar {
            //   }
            // }
          }

          .plugin-button {
            flex: 1 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .el-button {
              width: 40%;
              border-radius: 8px;
              padding: 3px 20px;
            }
          }

          .chat-window {
            flex: 12 0 auto;
            .el-scrollbar {
              padding: 3px 0px 3px 0px;
            }
          }

          .footer {
            flex: 1 0 auto;
            display: flex;
            justify-content: space-between;
            margin: 4px 0px;
            .el-button {
              border-radius: 8px;
              font-size: small;
              color: black;
            }
          }
        }
      }
      .right-side {
        display: flex;
        flex-direction: column;
        padding: 3px;
        .el-header {
          display: flex;
          justify-content: space-between;
          padding: 5px 15px;
          border-bottom: 1px solid rgb(238, 238, 238);
          div {
            padding: 10px 0px;
            .dialog-title {
              font-weight: bold;
            }
            .dialog-count {
              font-weight: lighter;
              font-size: small;
            }
          }
          .dialog-btn .el-button {
            color: black;
            border-radius: 10px;
            padding: 5px 10px;
          }
        }
        .el-main {
          // overflow-y: scroll;
          // height: 100px; // 这个设置多少好像没什么影响，但是必须设置，不然overflow会失效
          border-bottom: 1px solid rgb(238, 238, 238);
          border-top-right-radius: 0px;
        }
        .el-footer {
          padding: 14px 20px;
          height: 180px;
          display: flex;
          flex-direction: column;
          .input-option {
            height: 0%; // 设置为0后，通过flex均分剩余空间，使得overflow生效
            flex: 5.5 0 auto;
            overflow-y: auto;
            .upload-btn {
              // display: inline;
              .el-button {
                // border-radius: 1em;
                // color: black;
                // font-size: 1em;
                margin-right: 5px;
              }
            }
          }
          .input-content {
            display: flex;
            flex: 3 0 auto;
            border: 2px solid rgb(28, 147, 171);
            border-radius: 7px;
            .input-text {
              border-radius: 7px;
              flex: 70 0 auto;
              border: none;
              outline: none;
              resize: none;
              min-height: 42px;
              max-height: 150px;
              padding: 8px;
            }
            .input-btn {
              flex: 1 0 auto;
              padding: 5px 10px;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              .el-button {
                border-radius: 10px;
                background-color: rgb(28, 147, 171);
                color: rgb(255, 255, 255);
                font-size: small;
                padding: 3px 8px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
