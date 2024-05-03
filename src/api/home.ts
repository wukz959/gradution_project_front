import { request } from '@/utils/request'
import type { AxiosRequestConfig } from 'axios'
import type { UploadFiles } from 'element-plus'

export const uploadDialog = (file: FormData): Promise<any> => {
  return request.post('/saveDialog', file)
}
export const getImg = (url: string, isCarry: boolean) => {
  const config: AxiosRequestConfig = isCarry ? { responseType: 'blob' } : {}
  return request.get('/image/' + url, config)
}
export const getDialogHistory = (uid: string, sessionSeq: number) => {
  return request.post('/getDialogHistory', {
    userId: uid,
    sessionSeq: sessionSeq
  })
}
export const getDialogResp = (
  uid: string,
  sessionSeq: number,
  content: string,
  isImageMode: string,
  fileUrlList: Array<string>
) => {
  return request.post('/getDialogResp', {
    userId: uid,
    sessionSeq: sessionSeq,
    content: content,
    isImageMode: isImageMode,
    fileUrlList: fileUrlList
  })
}
