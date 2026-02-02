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
    <div className="flex h-full flex-col overflow-hidden bg-[#F5F5F7] dark:bg-black">
      {/* 移动端 Header */}
      <header className="sticky top-0 z-30 border-slate-200/60 border-b bg-white/80 px-4 py-3 backdrop-blur-md md:hidden dark:border-white/5 dark:bg-[#1C1C1E]/80">
        <div className="flex items-center rounded-lg bg-slate-200/50 p-0.5 dark:bg-white/10">
          {[
            { label: '名称', key: 'Key' },
            { label: '日期', key: 'LastModified' },
            { label: '大小', key: 'Size' },
          ].map((item) => (
            <button
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 font-semibold text-[12px] transition-all ${
                sort.key === item.key
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              key={item.key}
              onClick={() => handleSort(item.key)}
            >
              {item.label}
              {sort.key === item.key &&
                (sort.order === 'asc' ? (
                  <ChevronUp size={12} strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={12} strokeWidth={2.5} />
                ))}
            </button>
          ))}
        </div>
      </header>

      <main className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl">
          {/* PC 端：macOS Finder 列表风格 */}
          <div className="hidden md:block">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-[#F5F5F7]/95 backdrop-blur-md dark:bg-black/95">
                <tr className="font-bold text-[11px] text-slate-400/80 uppercase tracking-wider">
                  {/* 名称占 35% */}
                  <SortableHeader
                    className="w-[65%] pl-8"
                    current={sort}
                    label="名称"
                    onClick={handleSort}
                    sortKey="Key"
                  />
                  <SortableHeader
                    className="w-[30%]"
                    current={sort}
                    label="修改日期"
                    onClick={handleSort}
                    sortKey="LastModified"
                  />
                  <SortableHeader
                    className="w-[25%]"
                    current={sort}
                    label="大小"
                    onClick={handleSort}
                    sortKey="Size"
                  />
                  <th className="w-[10%] border-slate-200/60 border-b pr-8 dark:border-white/10"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1C1C1E]">
                {sortedFiles.map((file) => (
                  <tr
                    className="group cursor-default cursor-pointer transition-colors hover:bg-blue-500/[0.04] dark:hover:bg-blue-500/[0.1]"
                    key={file.Key}
                    onClick={() => setPreviewFile(file)}
                  >
                    <td className="border-slate-100 border-b py-3 pl-8 dark:border-white/[0.02]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileIcon
                          className="flex-shrink-0"
                          fileName={file.Key}
                          size={20}
                        />
                        <span className="truncate font-medium text-[13px] text-slate-700 dark:text-slate-200">
                          {file.Key}
                        </span>
                      </div>
                    </td>
                    <td className="border-slate-100 border-b px-2 py-3 text-[13px] text-slate-500 dark:border-white/[0.02]">
                      {new Date(file.LastModified).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="border-slate-100 border-b px-2 py-3 font-mono text-[12px] text-slate-400 dark:border-white/[0.02]">
                      {file.size}
                    </td>
                    <td className="border-slate-100 border-b py-3 pr-8 text-right dark:border-white/[0.02]">
                      <button
                        className="cursor-pointer rounded-full p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-100 group-hover:opacity-100 dark:hover:bg-white/10"
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

          {/* 移动端：iOS 文件列表风格 */}
          <div className="md:hidden">
            <div className="divide-y divide-slate-100 bg-white dark:divide-white/5 dark:bg-[#1C1C1E]">
              {sortedFiles.map((file) => (
                <div
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors active:bg-slate-50 dark:active:bg-white/5"
                  key={file.Key}
                  onClick={() => setPreviewFile(file)}
                >
                  <FileIcon
                    className="flex-shrink-0 drop-shadow-sm"
                    fileName={file.Key}
                    size={40}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-[16px] text-slate-900 tracking-tight dark:text-slate-100">
                      {file.Key}
                    </span>
                    <div className="flex items-center gap-2 font-medium text-[12px] text-slate-400">
                      <span>
                        {new Date(file.LastModified).toLocaleDateString()}
                      </span>
                      <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                      <span>{file.size}</span>
                    </div>
                  </div>
                  <button
                    className="cursor-pointer p-2 text-blue-500 active:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFilePopover(e, file);
                    }}
                  >
                    <MoreHorizontal size={22} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="py-12 text-center font-medium text-[13px] text-slate-400">
            没有更多了
          </p>
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
      className={`cursor-default border-slate-200/60 border-b py-2.5 transition-colors hover:bg-slate-200/50 dark:border-white/10 ${className}`}
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span className={isActive ? 'text-slate-900 dark:text-white' : ''}>
          {label}
        </span>
        {isActive && (
          <div className="fade-in zoom-in animate-in text-blue-500 duration-200">
            {current.order === 'asc' ? (
              <ChevronUp size={12} strokeWidth={3} />
            ) : (
              <ChevronDown size={12} strokeWidth={3} />
            )}
          </div>
        )}
      </div>
    </th>
  );
}
