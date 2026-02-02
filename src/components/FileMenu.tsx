import { Copy, Download, Eye, Link, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { COS } from '@/cos';
import { type COSFile, FileStore } from '@/store';

interface FileAction {
  label: string;
  icon: any;
  color?: string;
  action: (file: COSFile) => void;
  active?: (file: COSFile) => boolean;
}

const kFileActions = {
  preview: {
    icon: Eye,
    label: '预览',
    action: (file) => {
      // todo
      try {
        const link = document.createElement('a');
        link.href = COS.instance.getUrl(file.Key);
        link.target = '_blank';
        link.click();
      } catch (err) {
        console.error(err);
        toast.error('预览失败');
      }
    },
  },
  download: {
    icon: Download,
    label: '下载',
    action: (file) => {
      try {
        const link = document.createElement('a');
        link.href = COS.instance.getUrl(file.Key, { download: true });
        link.download = file.Key;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        toast.error('下载失败');
      }
    },
  },
  copyLink: {
    icon: Link,
    label: '链接',
    action: async (file) => {
      try {
        const url = COS.instance.getUrl(file.Key);
        await navigator.clipboard.writeText(url);
        toast.success('已复制链接');
      } catch (err) {
        console.error(err);
        toast.error('复制失败');
      }
    },
  },
  copyText: {
    icon: Copy,
    label: '复制',
    active: (file) => {
      return file.isMsg;
    },
    action: async (file) => {
      try {
        const text = file.text || (await COS.instance.readString(file.Key));
        await navigator.clipboard.writeText(text);
        toast.success('已复制');
      } catch (err) {
        console.error(err);
        toast.error('复制失败');
      }
    },
  },
  delete: {
    icon: Trash2,
    label: '删除',
    color: 'text-red-500',
    action: async (file) => {
      if (!confirm('确认删除？')) return;
      try {
        await COS.instance.delete(file.Key);
        toast.success('已删除');
        FileStore.value.refreshFiles();
      } catch (e) {
        console.error(e);
        toast.error('删除失败');
      }
    },
  },
} as const satisfies Record<string, FileAction>;

export function handleFileAction(
  key: keyof typeof kFileActions,
  file: COSFile,
) {
  const action = kFileActions[key] as FileAction;
  if (!action) return;
  if (action.active && !action.active(file)) return;
  return action.action(file);
}

export const ChatActionMenu = ({ file }) => {
  return (
    <div className="zoom-in-95 flex animate-in items-center p-1 duration-150">
      {Object.entries(kFileActions as Record<string, FileAction>)
        .filter(([_, e]) => !e.active || e.active(file))
        .map(([key, action]) => (
          <div className="group/tooltip relative" key={key}>
            <button
              className={`rounded p-2 transition-colors hover:bg-slate-100 ${action.color || 'text-slate-600'}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFileAction(key as any, file);
              }}
            >
              <action.icon size={14} />
            </button>
            <span className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
              {action.label}
            </span>
          </div>
        ))}
    </div>
  );
};

export const FileActionPopover = ({
  file,
  position,
  onClose,
  onMouseEnter,
}) => {
  if (!position) return null;

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
      {Object.entries(kFileActions as Record<string, FileAction>)
        .filter(([_, e]) => !e.active || e.active(file))
        .map(([key, action]) => (
          <button
            className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${action.color || 'text-slate-600'}`}
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              onClose(true);
              handleFileAction(key as any, file);
            }}
          >
            <action.icon size={16} />
            <span className="font-medium">{action.label}</span>
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
          onClose={closeFilePopover}
          onMouseEnter={handleMouseEnterMenu}
          position={activeMenu.position}
        />
      )
    );
  };

  return { FileMenuPopover, openFilePopover, closeFilePopover };
}
