import { Copy, Download, Edit3, Eye, Share2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { FileStore } from '@/store';

export const kFileActions = (action, file) => {
  if (action === 'preview') FileStore.value.setPreviewFile(file);
  if (action === 'copy-text') {
    const text = file.content || file.Key;
    document.execCommand('copy');
    navigator.clipboard.writeText(text);
    toast.success('文本已复制');
  }
  if (action === 'delete') {
    toast.promise(FileStore.value.deleteFile(file.Key), {
      loading: '正在删除...',
      success: '已成功移除',
      error: '删除失败',
    });
  }
  if (action === 'share') {
    toast.success('分享链接已复制');
  }
};

export const ChatActionMenu = ({ file }) => {
  const actions = [
    { icon: Copy, label: '复制', action: 'copy-text' },
    { icon: Share2, label: '分享', action: 'share' },
    { icon: Trash2, label: '删除', action: 'delete', color: 'text-red-500' },
  ];

  return (
    <div className="zoom-in-95 flex animate-in items-center rounded-lg border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black/5 duration-150">
      {actions.map((item) => (
        <div className="group/tooltip relative" key={item.action}>
          <button
            className={`rounded p-2 transition-colors hover:bg-slate-100 ${item.color || 'text-slate-600'}`}
            onClick={(e) => {
              e.stopPropagation();
              kFileActions(item.action, file);
            }}
          >
            <item.icon size={14} />
          </button>
          <span className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export const FileActionPopover = ({
  file,
  onAction,
  position,
  onClose,
  onMouseEnter,
}) => {
  if (!position) return null;

  const actions = [
    { icon: Eye, label: '预览文件', action: 'preview' },
    { icon: Download, label: '下载到本地', action: 'download' },
    { icon: Share2, label: '创建分享', action: 'share' },
    { icon: Edit3, label: '重命名', action: 'rename' },
    {
      icon: Trash2,
      label: '移至废纸篓',
      action: 'delete',
      color: 'text-red-500',
    },
  ];

  return (
    <div
      className="fade-in zoom-in-95 w-44 animate-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 duration-100"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      {actions.map((item) => (
        <button
          className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${item.color || 'text-slate-600'}`}
          key={item.action}
          onClick={(e) => {
            e.stopPropagation();
            onAction(item.action, file);
            onClose(true); // 立即关闭
          }}
        >
          <item.icon size={16} />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export function useFileActionPopover() {
  const [activeMenu, setActiveMenu] = useState(null); // { file, position }
  const closeTimerRef = useRef(null);

  const openFilePopover = (e, file) => {
    e.stopPropagation();
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    setActiveMenu({
      file,
      position: { top: rect.bottom + 5, left: rect.left - 140 },
    });
  };

  const closeFilePopover = (immediate = false) => {
    if (immediate) {
      setActiveMenu(null);
      return;
    }
    // 延迟关闭，防止图标与菜单之间的间隙导致菜单消失
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const handleMouseEnterMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const FileMenuPopover = () => {
    return (
      activeMenu && (
        <FileActionPopover
          file={activeMenu.file}
          onAction={kFileActions}
          onClose={closeFilePopover}
          onMouseEnter={handleMouseEnterMenu}
          position={activeMenu.position}
        />
      )
    );
  };

  return { FileMenuPopover, openFilePopover, closeFilePopover };
}
