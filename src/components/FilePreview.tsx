import {
  Check,
  Download,
  Edit3,
  Loader2,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FileStore, useFileStore } from '@/store';

import { FileIcon } from './FileIcon';
import { useFileActionPopover } from './FileMenu';

export function FilePreview() {
  const { previewFile, setPreviewFile } = useFileStore();

  useEffect(() => {
    if (!previewFile) return;

    // 1. 处理返回键 (History API)
    const state = { view: 'preview' };
    window.history.pushState(state, '');

    const handlePopState = () => {
      setPreviewFile(null);
    };

    // 2. 处理 Esc 按键
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    // 3. 锁定滚动
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // 清理历史记录
      if (window.history.state?.view === 'preview') {
        window.history.back();
      }
    };
  }, [previewFile]);

  if (!previewFile) return null;

  return (
    <div className="fade-in zoom-in fixed inset-0 z-[200] flex animate-in flex-col bg-white duration-200 dark:bg-[#1C1C1E]">
      <PreviewHeader
        file={previewFile}
        onClose={() => window.history.back()} // 统一通过 history 退出
      />
      <div className="relative flex-1 overflow-hidden bg-[#F5F5F7] dark:bg-black">
        <PreviewBody file={previewFile} />
      </div>
    </div>
  );
}

// --- 内容渲染分发器 ---
const PreviewBody = ({ file }) => {
  switch (file.type) {
    case 'text':
    case 'code':
      return <CodePreview file={file} />;
    case 'image':
      return <ImagePreview url={file.url} />;
    case 'audio':
      return <AudioPreview url={file.url} />;
    case 'video':
      return <VideoPreview url={file.url} />;
    case 'pdf':
    case 'word':
    case 'excel':
    case 'ppt':
      return <DocPreview type={file.type} url={file.url} />;
    default:
      return <FallbackPreview file={file} />;
  }
};

// --- 顶部操作栏 ---
const PreviewHeader = ({ file, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.Key);
  const { FileMenuPopover, openFilePopover } = useFileActionPopover({
    excludes: ['preview', 'edit', 'rename'],
    options: {
      close: {
        icon: X,
        label: '关闭',
        action: () => onClose(),
      },
    },
  });

  const handleRename = async () => {
    setIsEditing(false);
    if (isRenaming) return;
    setIsRenaming(true);
    if (newName.trim() !== file.Key && newName.trim()) {
      try {
        await FileStore.value.rename(file.Key, newName.trim());
        FileStore.value.setPreviewFile(
          FileStore.value.files.find((e) => e.Key === newName.trim()),
        );
      } catch (err) {
        toast.error(`重命名失败: ${err.message || '未知错误'}`);
        setNewName(file.Key);
      }
    }
    setIsRenaming(false);
  };

  return (
    <header className="flex h-14 items-center justify-between border-slate-200 border-b px-4 dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileIcon fileName={file.Key} size={24} />
        {isEditing ? (
          <div className="flex max-w-md flex-1 items-center gap-2">
            <input
              autoFocus
              className="w-full rounded bg-slate-100 px-2 py-1 text-sm outline-none ring-2 ring-blue-500 dark:bg-white/5"
              onBlur={handleRename}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              value={newName}
            />
            <button className="text-blue-500" onClick={handleRename}>
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div
            className="group flex cursor-pointer items-center gap-2 overflow-hidden"
            onClick={() => {
              if (!isRenaming) setIsEditing(true);
            }}
          >
            <h2 className="truncate font-semibold text-slate-700 text-sm dark:text-slate-200">
              {file.Key}
            </h2>
            {isRenaming ? (
              <Loader2 className="animate-spin text-blue-500" size={16} />
            ) : (
              <Edit3
                className="text-slate-400 opacity-0 group-hover:opacity-100"
                size={14}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="ml-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:bg-white/10 dark:text-slate-300"
          onClick={(e) => {
            e.stopPropagation();
            openFilePopover(e, file);
          }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <FileMenuPopover />
    </header>
  );
};

// --- 多媒体预览 ---
export const ImagePreview = ({ url }) => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <img
      alt="Preview"
      className="zoom-in max-h-full max-w-full animate-in object-contain shadow-2xl duration-300"
      src={url}
    />
  </div>
);

export const VideoPreview = ({ url }) => (
  <div className="flex h-full w-full items-center justify-center bg-black">
    <video autoPlay className="max-h-full max-w-full" controls src={url} />
  </div>
);

export const AudioPreview = ({ url }) => (
  <div className="flex h-full w-full flex-col items-center justify-center bg-white dark:bg-black">
    <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-3xl bg-blue-500 text-white shadow-2xl">
      <FileIcon fileName="audio.mp3" size={80} />
    </div>
    <audio className="w-80" controls src={url} />
  </div>
);

// --- 文档预览 (PDF/Office) ---
export const DocPreview = ({ url, type }) => {
  const src =
    type === 'pdf'
      ? `${url}#toolbar=0`
      : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  return (
    <iframe
      className="h-full w-full"
      frameBorder="0"
      src={src}
      title="Document Preview"
    />
  );
};

// --- 兜底下载 ---
export const FallbackPreview = ({ file }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-6">
    <FileIcon fileName={file.Key} size={100} />
    <div className="text-center">
      <h3 className="font-bold text-xl dark:text-white">{file.Key}</h3>
      <p className="text-slate-500 uppercase">{file.size} · 不支持预览</p>
    </div>
    <button
      className="flex items-center gap-2 rounded-full bg-blue-500 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      onClick={() => window.open(file.url)}
    >
      <Download size={20} /> 下载文件
    </button>
  </div>
);

// --- 文本与代码预览 (Monaco) ---
export const CodePreview = ({ file }) => {
  return (
    <div className="h-full w-full bg-white p-6 dark:bg-[#1e1e1e]">
      <textarea
        className="h-full w-full resize-none border-none bg-transparent font-mono text-[14px] text-slate-800 leading-relaxed outline-none dark:text-slate-300"
        spellCheck={false}
      />
    </div>
  );
};
