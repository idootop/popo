import { toast } from 'sonner';
import { createStore, useStore } from 'zenbox';

import { COS } from './cos';
import { type FileType, getFileSize, getFileType } from './file';

interface COSFile {
  Key: string;
  LastModified: string;
  Size: number;
  type: FileType;
  size: string;
  isImage: boolean;
  isText: boolean;
  isMsg: boolean;
  url?: string;
  content?: string;
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
      const rawFiles = await COS.instance.getFiles();
      const processed = await Promise.all(
        rawFiles.map(async (f) => {
          const type = getFileType(f.Key);
          const isImage = type === 'image';
          const isText = type === 'text' || f.Key.startsWith('msg_');
          let url: string | undefined;
          let content: string | undefined;

          if (type === 'image' || type === 'audio' || type === 'video') {
            url = await COS.instance.getSignedUrl(f.Key);
          }

          if (isText && f.Key.startsWith('msg_')) {
            try {
              content = await COS.instance.getObjectContent(f.Key);
            } catch (e) {
              console.error(`Failed to fetch content for ${f.Key}`, e);
            }
          }

          return {
            ...f,
            type,
            size: getFileSize(f.Size),
            isImage,
            isText,
            url,
            content,
            isMsg: f.Key.startsWith('msg_'),
          };
        }),
      );

      const sorted = processed.sort(
        (a, b) =>
          new Date(b.LastModified).getTime() -
          new Date(a.LastModified).getTime(),
      );
      store.setState({ files: sorted, isLoading: false });
    } catch (e) {
      console.error(e);
      store.setState({ isLoading: false });
      store.value.toast('获取文件失败');
    }
  },

  upload: async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    for (const file of Array.from(selectedFiles)) {
      store.value.toast(`正在投喂 ${file.name}...`);
      try {
        await COS.instance.uploadFile(file.name, file);
        store.value.toast('已存档 ✨');
      } catch (e) {
        console.error(e);
        store.value.toast('上传失败');
      }
    }
    store.value.refreshFiles();
  },

  sendText: async (text: string) => {
    if (!text.trim()) return;
    const key = `msg_${Date.now()}.txt`;
    try {
      await COS.instance.uploadFile(key, text);
      store.value.refreshFiles();
    } catch (e) {
      console.error(e);
      store.value.toast('发送失败');
    }
  },

  deleteFile: async (key: string) => {
    if (!confirm(`确定丢弃 "${key}"?`)) return;
    try {
      await COS.instance.deleteFile(key);
      store.value.toast('已抹除');
      store.value.refreshFiles();
    } catch (e) {
      console.error(e);
      store.value.toast('删除失败');
    }
  },

  copyLink: async (key: string) => {
    const url = await COS.instance.getSignedUrl(key);
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    store.value.toast('链接已复制 (1h有效)');
  },

  download: async (key: string) => {
    const url = await COS.instance.getSignedUrl(key);
    const link = document.createElement('a');
    link.href =
      url +
      (url.indexOf('?') > -1 ? '&' : '?') +
      'response-content-disposition=attachment';
    link.click();
  },

  // saveEdit: async (key: string, content: string) => {
  //   try {
  //     await COS.instance.uploadFile(key, content);
  //     store.setState({ editingFile: null });
  //     store.value.toast('修改已保存 ✨');
  //     store.value.refreshFiles();
  //   } catch (e) {
  //     console.error(e);
  //     store.value.toast('保存失败');
  //   }
  // },
});

export const FileStore = store;

export const useFileStore = () => useStore(FileStore);
