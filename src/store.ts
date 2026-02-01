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
type ViewMode = 'list' | 'grid';

const store = createStore({
  files: [] as COSFile[],
  mainTab: 'chat' as TabPage,
  viewMode: 'grid' as ViewMode,
  sortConfig: { key: 'LastModified', order: 'desc' },
  selectedKey: null,
  previewFile: null,
  isLoading: false,

  setViewMode: (viewMode: ViewMode) => store.setState({ viewMode }),
  toast: (msg: string) => toast(msg),
  setMainTab: (tab) => store.setState({ mainTab: tab }),
  setPreviewFile: (file) => store.setState({ previewFile: file }),
  setSortConfig: (config) => {
    store.setState((state) => {
      state.sortConfig =
        typeof config === 'function' ? config(state.sortConfig) : config;
    });
  },

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
    for (const file of Array.from(files)) {
      await toast.promise(COS.instance.upload(file.name, file), {
        loading: `正在上传: ${file.name}`,
        success: () => {
          store.value.refreshFiles();
          return `已上传: ${file.name}`;
        },
        error: (err) => `上传失败: ${err.message || '未知错误'}`,
      });
    }
  },

  sendText: async (text: string) => {
    if (!text.trim()) return;
    const key = `msg_${Date.now()}.txt`;
    try {
      await COS.instance.upload(key, text);
      store.value.refreshFiles();
    } catch (e) {
      console.error(e);
      toast('发送失败');
    }
  },
});

export const FileStore = store;

export const useFileStore = () => useStore(FileStore);
