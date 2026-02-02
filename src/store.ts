import { toast } from 'sonner';
import { createStore, useStore } from 'zenbox';

import { COS } from './cos';
import { type FileType, getFileSize, getFileType } from './file';

export interface COSFile {
  Key: string;
  LastModified: string;
  Size: number;
  type: FileType;
  size: string;
  isMsg: boolean;
  url?: string;
  text?: string;
}

type TabPage = 'chat' | 'files';

const store = createStore({
  files: [] as COSFile[],

  mainTab: 'chat' as TabPage,
  setMainTab: (tab) => store.setState({ mainTab: tab }),

  previewFile: null,
  setPreviewFile: (file) => store.setState({ previewFile: file }),

  isLoading: false,
  refreshFiles: async () => {
    store.setState({ isLoading: true });
    try {
      const rawFiles = await COS.instance.list();
      const processed = await Promise.all(
        rawFiles.map(async (f) => {
          const type = getFileType(f.Key);
          const isMsg = type === 'text' && f.Key.startsWith('msg_');

          let text: string | undefined;
          if (isMsg) {
            text = await COS.instance.readString(f.Key);
          }

          return {
            ...f,
            type,
            size: getFileSize(f.Size),
            url: COS.instance.getUrl(f.Key),
            text,
            isMsg,
          };
        }),
      );
      store.setState({ files: processed, isLoading: false });
    } catch (e) {
      console.error(e);
      store.setState({ isLoading: false });
      toast.error('刷新失败');
    }
  },

  upload: async (files: File[]) => {
    if (!files?.length) return;
    for (const file of files) {
      await toast.promise(COS.instance.upload(file.name, file), {
        loading: `正在上传: ${file.name}`,
        success: async () => {
          await store.value.refreshFiles();
          return `已上传: ${file.name}`;
        },
        error: (err) => `上传失败: ${err.message || '未知错误'}`,
      });
    }
  },

  sendText: async (text: string) => {
    if (!text.trim()) return;
    const key = `msg_${Date.now()}.txt`;
    await toast.promise(COS.instance.writeString(key, text), {
      loading: `正在发送`,
      success: async () => {
        await store.value.refreshFiles();
        return `已发送`;
      },
      error: (err) => `发送失败: ${err.message || '未知错误'}`,
    });
  },

  async rename(oldKey: string, newKey: string) {
    if (oldKey === newKey) return true;
    await COS.instance.rename(oldKey, newKey);
    store.setState((s) => {
      const f = s.files.find((e) => e.Key === oldKey);
      f.Key = newKey;
    });
  },
});

export const FileStore = store;

export const useFileStore = () => useStore(FileStore);
