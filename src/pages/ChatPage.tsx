import { Download, Plus, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FileIcon } from '@/components/FileIcon';
import { ChatActionMenu, kFileActions } from '@/components/FileMenu';
import { useFileStore } from '@/store';

export function ChatPage() {
  const { files, setPreviewFile } = useFileStore();

  const [inputText, setInputText] = useState('');

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const valA = new Date(a['LastModified']).getTime();
      const valB = new Date(b['LastModified']).getTime();
      return valA > valB ? 1 : -1;
    });
  }, [files]);

  const onPaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        toast.info(`捕捉到粘贴文件: ${file.name}`);
      }
    }
  };

  return (
    <>
      <div className="custom-scrollbar relative flex w-full flex-1 flex-col-reverse overflow-y-auto p-4 pb-24 md:p-6 md:pb-32">
        <div className="mx-auto w-full max-w-3xl space-y-6 md:space-y-8">
          {sortedFiles.map((file) => (
            <div
              className="group fade-in relative flex flex-col items-start"
              key={file.Key}
            >
              <div className="mb-1 ml-1 font-bold text-[10px] text-slate-300 uppercase tracking-wider">
                {new Date(file.LastModified).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="group/bubble relative max-w-[90%] md:max-w-[85%]">
                <div className="absolute -top-7 right-0 z-30 translate-y-1 opacity-0 transition-all group-hover/bubble:translate-y-0 group-hover/bubble:opacity-100">
                  <ChatActionMenu file={file} />
                </div>
                <div
                  className={`rounded-2xl border shadow-sm transition-all ${
                    file.isMsg
                      ? 'rounded-tl-none border-slate-100 bg-white p-3 text-slate-700 leading-relaxed md:p-4'
                      : 'border-slate-100 bg-white p-2'
                  } group-hover/bubble:border-amber-200`}
                >
                  {file.type === 'image' ? (
                    <div
                      className="cursor-pointer overflow-hidden rounded-xl"
                      onClick={() => setPreviewFile(file)}
                    >
                      <img
                        alt=""
                        className="max-h-60 w-auto object-cover md:max-h-80"
                        src={file.url}
                      />
                    </div>
                  ) : file.isMsg ? (
                    <p className="whitespace-pre-wrap text-sm md:text-[15px]">
                      {file.content}
                    </p>
                  ) : (
                    <div className="flex min-w-[180px] items-center gap-3 px-2 py-1">
                      <FileIcon fileName={file.Key} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-800 text-xs md:text-sm">
                          {file.Key}
                        </div>
                        <div className="font-bold text-[10px] text-slate-400 uppercase">
                          {file.size}
                        </div>
                      </div>
                      <button
                        className="p-2 text-slate-300 hover:text-amber-500"
                        onClick={() => kFileActions('download', file)}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-40 bg-gradient-to-t from-[#f8f9fb] via-[#f8f9fb] to-transparent p-4 md:p-6">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[20px] border border-amber-100 bg-white p-2 shadow-2xl ring-4 ring-amber-50/30 md:gap-3 md:rounded-[24px] md:ring-8">
          <button className="flex-shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-50 md:p-3">
            <Plus size={20} />
          </button>
          <textarea
            className="max-h-32 flex-1 resize-none border-none bg-transparent py-2.5 text-sm focus:outline-none focus:ring-0 md:py-3 md:text-[15px]"
            onChange={(e) => setInputText(e.target.value)}
            onPaste={onPaste}
            placeholder="说点什么..."
            rows={1}
            value={inputText}
          />
          <button
            className="flex-shrink-0 rounded-full bg-amber-500 p-2.5 text-white shadow-lg transition-all active:scale-95 disabled:opacity-20 md:p-3.5"
            disabled={!inputText.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
