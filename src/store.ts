import { toast } from 'sonner';
import { createStore } from 'zenbox';

import { COS } from './cos';

interface COSFile {
  Key: string;
  LastModified: string;
  Size: number;
  isImage: boolean;
  isText: boolean;
}

type ViewMode = 'chat' | 'grid';

const store = createStore({
  files: [],
  viewMode: 'chat',
  isLoading: false,
  editingFile: null,

  setViewMode: (viewMode: ViewMode) => store.setState({ viewMode }),
  toast: (msg: string) => toast(msg),
  setEditingFile: (editingFile: COSFile) => store.setState({ editingFile }),

  refreshFiles: async () => {
    store.setState({ isLoading: true });
    try {
      const rawFiles = await COS.instance.getFiles();
      const processed = rawFiles
        .map((f) => ({
          ...f,
          isImage: /\.(jpg|jpeg|png|gif|webp)$/i.test(f.Key),
          isText: /\.(txt|md|js|json|css|html|msg_.*\.txt)$/i.test(f.Key),
        }))
        .sort(
          (a, b) =>
            new Date(b.LastModified).getTime() -
            new Date(a.LastModified).getTime(),
        );
      store.setState({ files: processed, isLoading: false });
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

  previewFile: async (file: COSFile) => {
    if (file.isImage) {
      const url = await COS.instance.getSignedUrl(file.Key);
      store.setState({
        editingFile: { key: file.Key, content: url, type: 'image' },
      });
    } else if (file.isText) {
      try {
        const content = await COS.instance.getObjectContent(file.Key);
        store.setState({
          editingFile: { key: file.Key, content: content, type: 'text' },
        });
      } catch (e) {
        console.error(e);
        store.value.toast('读取失败');
      }
    } else {
      store.value.download(file.Key);
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

  saveEdit: async (key: string, content: string) => {
    try {
      await COS.instance.uploadFile(key, content);
      store.setState({ editingFile: null });
      store.value.toast('修改已保存 ✨');
      store.value.refreshFiles();
    } catch (e) {
      console.error(e);
      store.value.toast('保存失败');
    }
  },
});

export const FileStore = store;
