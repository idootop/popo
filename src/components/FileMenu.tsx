import { Copy, Download, Eye, Link, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { COS } from '@/cos';
import { type COSFile, FileStore } from '@/store';

// --- 类型定义 ---
interface FileAction {
  label: string;
  icon: any;
  color?: string;
  action: (file: COSFile) => void;
  active?: (file: COSFile) => boolean;
}

// --- 配置定义 ---
const kFileActions = {
  preview: {
    icon: Eye,
    label: '预览',
    action: (file) => {
      FileStore.value.setPreviewFile(file);
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
  options?: any,
) {
  const action = { ...options, ...kFileActions }[key] as FileAction;
  if (action) action.action(file);
}

// --- 组件：Popover 菜单主体 ---
export const FileActionPopover = ({
  file,
  position,
  onClose,
  excludes,
  options,
}) => {
  if (!position) return null;

  return (
    <div
      className="fade-in zoom-in-95 fixed z-[9999] w-44 animate-in overflow-hidden rounded-xl border border-slate-200 bg-white/95 py-1 shadow-xl ring-1 ring-black/5 backdrop-blur-md duration-100 dark:border-white/10 dark:bg-[#1C1C1E]/95"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {Object.entries({ ...options, ...kFileActions } as Record<
        string,
        FileAction
      >)
        .filter(
          ([k, e]) => (!e.active || e.active(file)) && !excludes?.includes(k),
        )
        .map(([key, action]) => (
          <button
            className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors active:bg-slate-100 md:hover:bg-slate-50 dark:active:bg-white/10 dark:md:hover:bg-white/5 ${action.color || 'text-slate-700 dark:text-slate-200'}`}
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              handleFileAction(key as any, file, options);
              onClose();
            }}
          >
            <action.icon size={16} strokeWidth={2} />
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
    </div>
  );
};

// --- Hook：状态逻辑 ---
export function useFileActionPopover({
  excludes = [],
  options,
}: {
  excludes?: string[];
  options?: any;
} = {}) {
  const [activeMenu, setActiveMenu] = useState<{
    file: any;
    position: any;
  } | null>(null);

  const closeFilePopover = useCallback(() => {
    setActiveMenu(null);
  }, []);

  useEffect(() => {
    if (!activeMenu) return;

    const handleOutsideAction = () => {
      closeFilePopover();
    };

    // 使用 mousedown 拦截点击外部
    document.addEventListener('mousedown', handleOutsideAction);
    // 滚动时关闭
    window.addEventListener('wheel', handleOutsideAction, { passive: true });
    window.addEventListener('touchmove', handleOutsideAction, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleOutsideAction);
      document.removeEventListener('wheel', handleOutsideAction);
      document.removeEventListener('touchmove', handleOutsideAction);
    };
  }, [activeMenu, closeFilePopover]);

  const openFilePopover = (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176; // w-44 = 176px

    // 计算左右边界，防止溢出屏幕
    let leftPos = rect.left;
    if (leftPos + menuWidth > window.innerWidth) {
      leftPos = window.innerWidth - menuWidth - 12;
    }
    leftPos = Math.max(12, leftPos);

    // 计算上下边界，防止溢出屏幕
    let topPos = rect.bottom + 8;
    const menuHeight = 200; // 预估高度
    if (topPos + menuHeight > window.innerHeight) {
      topPos = rect.top - menuHeight - 8;
    }

    setActiveMenu({
      file,
      position: { top: topPos, left: leftPos },
    });
  };

  const FileMenuPopover = () => {
    if (!activeMenu) return null;
    return (
      <FileActionPopover
        excludes={excludes}
        file={activeMenu.file}
        onClose={closeFilePopover}
        options={options}
        position={activeMenu.position}
      />
    );
  };

  return { FileMenuPopover, openFilePopover, closeFilePopover };
}

export const ChatActionMenu = ({ file }) => {
  return (
    <div className="zoom-in-95 flex animate-in items-center p-1 duration-150">
      {Object.entries(kFileActions as Record<string, FileAction>)
        .filter(([_, e]) => !e.active || e.active(file))
        .map(([key, action]) => (
          <div className="group/tooltip relative" key={key}>
            <button
              className={`cursor-pointer rounded p-2 transition-colors hover:bg-slate-100 ${action.color || 'text-slate-600'}`}
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
