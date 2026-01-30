import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { FileIcon } from '@/components/FileIcon';
import { useFileActionPopover } from '@/components/FileMenu';
import { useFileStore } from '@/store';

export function FilePage() {
  const {
    files,
    viewMode,
    sortConfig,
    setSortConfig,
    setPreviewFile,
    setViewMode,
  } = useFileStore();

  const { FileMenuPopover, openFilePopover, closeFilePopover } =
    useFileActionPopover();

  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let valA = a[sortConfig.key],
        valB = b[sortConfig.key];
      if (sortConfig.key === 'LastModified') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortConfig.key === 'Key') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (sortConfig.key === 'Size') {
        valA = Number(valA);
        valB = Number(valB);
      }
      const comp = valA > valB ? 1 : -1;
      return sortConfig.order === 'asc' ? comp : -comp;
    });
  }, [files, sortConfig]);

  return (
    <>
      <div className="z-40 flex items-center justify-between border-slate-100 border-b bg-white/50 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-[11px] text-slate-600 shadow-sm hover:border-amber-300 md:text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
              }}
            >
              <ArrowUpDown className="text-amber-500" size={14} />
              <span className="xs:block hidden">排序</span>
              <ChevronDown size={12} />
            </button>
            {showSortMenu && (
              <div className="zoom-in-95 absolute top-full left-0 z-[70] mt-2 w-40 animate-in rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xl">
                {['LastModified', 'Key', 'Size'].map((k) => (
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs hover:bg-slate-50"
                    key={k}
                    onClick={() => {
                      setSortConfig((p) => ({
                        key: k,
                        order:
                          p.key === k
                            ? p.order === 'asc'
                              ? 'desc'
                              : 'asc'
                            : 'desc',
                      }));
                      setShowSortMenu(false);
                    }}
                  >
                    <span
                      className={
                        sortConfig.key === k ? 'font-bold text-amber-600' : ''
                      }
                    >
                      {k === 'Key'
                        ? '文件名'
                        : k === 'Size'
                          ? '大小'
                          : '修改日期'}
                    </span>
                    {sortConfig.key === k &&
                      (sortConfig.order === 'asc' ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex rounded-lg bg-slate-100/50 p-1">
            <button
              className={`rounded-md p-1 transition-all ${viewMode === 'grid' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`rounded-md p-1 transition-all ${viewMode === 'list' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-white text-xs shadow-amber-200 shadow-lg transition-all hover:bg-amber-600 active:scale-95 md:rounded-xl md:px-4 md:py-2 md:text-sm">
          <Plus size={16} /> <span className="hidden sm:block">上传</span>
        </button>
      </div>

      <div className="custom-scrollbar relative flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-32">
        {/* 网格视图 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-4 sm:grid-cols-4 md:gap-6 lg:grid-cols-6">
            {sortedFiles.map((file) => (
              <div
                className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-95 md:p-5"
                key={file.Key}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewFile(file);
                }}
              >
                <div
                  className={`absolute top-2 right-2 z-30 opacity-0 transition-opacity group-hover:opacity-100`}
                  onMouseEnter={(e) => openFilePopover(e, file)}
                  onMouseLeave={() => closeFilePopover()}
                >
                  <div
                    className={`cursor-pointer rounded-lg bg-white p-1 text-slate-400 transition-all hover:text-slate-700`}
                  >
                    <MoreVertical size={16} />
                  </div>
                </div>
                <div className="relative mb-3 flex h-12 w-12 items-center justify-center md:mb-4 md:h-16 md:w-16">
                  {file.type === 'image' ? (
                    <div className="h-full w-full overflow-hidden rounded-lg border border-slate-100">
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={file.url}
                      />
                    </div>
                  ) : (
                    <FileIcon
                      className="md:h-12 md:w-12"
                      fileName={file.Key}
                      size={40}
                    />
                  )}
                </div>
                <span className="line-clamp-2 h-8 break-all px-1 text-center font-bold text-[11px] text-slate-700 md:text-xs">
                  {file.Key}
                </span>
                <span className="mt-1.5 font-black text-[9px] text-slate-300 uppercase tracking-tighter md:text-[10px]">
                  {file.size}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm md:rounded-2xl">
            <table className="w-full min-w-[500px] border-collapse text-left">
              <thead>
                <tr className="border-slate-100 border-b bg-slate-50/50 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-4 md:px-6">文件名</th>
                  <th className="hidden px-4 py-4 sm:table-cell md:px-6">
                    日期
                  </th>
                  <th className="px-4 py-4 md:px-6">大小</th>
                  <th className="w-10 px-4 py-4 text-right md:px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedFiles.map((file) => (
                  <tr
                    className={`group transition-colors hover:bg-slate-50/80`}
                    key={file.Key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                  >
                    <td className="px-4 py-3 md:px-6">
                      <div className="flex items-center gap-3">
                        <FileIcon fileName={file.Key} size={18} />
                        <span className="max-w-[120px] truncate font-bold text-slate-700 text-xs md:max-w-xs md:text-sm">
                          {file.Key}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-[10px] text-slate-400 sm:table-cell md:px-6 md:text-xs">
                      {new Date(file.LastModified).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 md:px-6 md:text-xs">
                      {file.size}
                    </td>
                    <td className="relative px-4 py-3 text-right md:px-6">
                      <div
                        className={`inline-block cursor-pointer p-1.5 text-slate-300 opacity-0 transition-all hover:text-slate-600 group-hover:opacity-100`}
                        onMouseEnter={(e) => openFilePopover(e, file)}
                        onMouseLeave={() => closeFilePopover()}
                      >
                        <MoreVertical size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FileMenuPopover />
    </>
  );
}
