import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FileIcon } from '@/components/FileIcon';
import { useFileActionPopover } from '@/components/FileMenu';
import { useFileStore } from '@/store';

export function FilePage() {
  const { files, setPreviewFile } = useFileStore();
  const [sort, setSort] = useState({ key: 'LastModified', order: 'desc' });
  const { FileMenuPopover, openFilePopover } = useFileActionPopover();

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (sort.key === 'Key') {
        return sort.order === 'asc'
          ? a.Key.localeCompare(b.Key, undefined, { numeric: true })
          : b.Key.localeCompare(a.Key, undefined, { numeric: true });
      }
      const valA =
        sort.key === 'LastModified'
          ? new Date(a.LastModified).getTime()
          : a.Size;
      const valB =
        sort.key === 'LastModified'
          ? new Date(b.LastModified).getTime()
          : b.Size;
      return sort.order === 'asc' ? valA - valB : valB - valA;
    });
  }, [files, sort]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F5F5F7] dark:bg-[#000000]">
      {/* Header: iOS/macOS 磨砂质感顶部 */}
      <header className="sticky top-0 z-30 border-slate-200/60 border-b bg-white/80 px-4 py-3 backdrop-blur-md md:hidden md:px-8 dark:border-white/5 dark:bg-[#1C1C1E]/80">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
          {/* 移动端专用排序：仿 iOS 分段控制器 */}
          <div className="flex items-center rounded-lg bg-slate-200/50 p-0.5 md:hidden dark:bg-white/10">
            {[
              { label: '名称', key: 'Key' },
              { label: '日期', key: 'LastModified' },
              { label: '大小', key: 'Size' },
            ].map((item) => (
              <button
                className={`flex flex-1 items-center justify-center gap-1 rounded-[6px] px-2 py-1.5 font-medium text-[12px] transition-all ${
                  sort.key === item.key
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-blue-400'
                    : 'text-slate-500'
                }`}
                key={item.key}
                onClick={() => handleSort(item.key)}
              >
                {item.label}
                {sort.key === item.key &&
                  (sort.order === 'asc' ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  ))}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl">
          {/* PC 端：macOS Finder 风格 */}
          <div className="hidden bg-white md:block">
            <table className="mt-12 hidden w-full table-fixed border-separate border-spacing-0 md:table">
              <thead className="sticky top-0 z-10 bg-white dark:bg-[#000000]/95">
                <tr className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                  {/* 限制为 1/3 宽度 */}
                  <SortableHeader
                    className="w-[100%] pl-8"
                    current={sort}
                    label="名称"
                    onClick={handleSort}
                    sortKey="Key"
                  />
                  <SortableHeader
                    className="w-[120px]"
                    current={sort}
                    label="修改日期"
                    onClick={handleSort}
                    sortKey="LastModified"
                  />
                  <SortableHeader
                    className="w-[120px]"
                    current={sort}
                    label="大小"
                    onClick={handleSort}
                    sortKey="Size"
                  />
                  <th className="w-[36px] border-slate-200/60 border-b pr-8 dark:border-white/5"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1C1C1E]">
                {sortedFiles.map((file) => (
                  <tr
                    className="group cursor-default select-none transition-colors hover:bg-blue-500/[0.06]"
                    key={file.Key}
                    onDoubleClick={() => setPreviewFile(file)}
                  >
                    {/* 名称列：确保容器 min-w-0 否则 truncate 无效 */}
                    <td className="min-w-0 border-slate-100 border-b py-2.5 pr-4 pl-8 dark:border-white/[0.02]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0">
                          <FileIcon fileName={file.Key} size={20} />
                        </div>
                        <span className="truncate text-[13px] text-slate-700 dark:text-slate-300">
                          {file.Key}
                        </span>
                      </div>
                    </td>
                    <td className="truncate border-slate-100 border-b px-2 py-2.5 font-medium text-[13px] text-slate-500 dark:border-white/[0.02]">
                      {new Date(file.LastModified).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="truncate border-slate-100 border-b px-2 py-2.5 font-mono text-[13px] text-slate-500 dark:border-white/[0.02]">
                      {file.size}
                    </td>
                    <td className="border-slate-100 border-b py-2.5 pr-8 text-right dark:border-white/[0.02]">
                      <button
                        className="rounded-md p-1 text-slate-400 opacity-0 transition-all hover:bg-slate-200/50 group-hover:opacity-100 dark:hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePopover(e, file);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 mb-12 hidden p-4 text-center text-gray-400 text-sm md:block">
            没有更多了～
          </p>

          {/* 移动端：iOS 列表风格 */}
          <div className="border-slate-200/50 border-y bg-white md:hidden dark:border-white/5 dark:bg-[#1C1C1E]">
            {sortedFiles.map((file, index) => (
              <div
                className="relative transition-colors active:bg-slate-100 dark:active:bg-white/5"
                key={file.Key}
                onClick={() => setPreviewFile(file)}
              >
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex-shrink-0 drop-shadow-sm">
                    <FileIcon fileName={file.Key} size={36} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-[16px] text-slate-900 tracking-tight dark:text-slate-100">
                      {file.Key}
                    </span>
                    <div className="flex items-center gap-2 font-medium text-[12px] text-slate-400">
                      <span>
                        {new Date(file.LastModified).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span>{file.size}</span>
                    </div>
                  </div>
                  <button
                    className="-mr-2 p-2 text-blue-500 active:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFilePopover(e, file);
                    }}
                  >
                    <MoreHorizontal size={22} />
                  </button>
                </div>
                {/* 仿 iOS 分割线：不穿过图标区域 */}
                {index !== sortedFiles.length - 1 && (
                  <div className="ml-16 border-slate-100 border-b dark:border-white/5" />
                )}
              </div>
            ))}
            <p className="pt-4 pb-12 text-center text-gray-400 text-sm">
              没有更多了～
            </p>
          </div>
        </div>
      </main>

      <FileMenuPopover />
    </div>
  );
}

function SortableHeader({ label, sortKey, current, onClick, className = '' }) {
  const isActive = current.key === sortKey;
  return (
    <th
      className={`cursor-default border-slate-200/60 border-b py-3 transition-colors hover:bg-slate-200/30 dark:border-white/5 ${className}`}
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <div
          className={`text-blue-500 transition-all ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
        >
          {current.order === 'asc' ? (
            <ChevronUp size={13} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={13} strokeWidth={2.5} />
          )}
        </div>
      </div>
    </th>
  );
}
