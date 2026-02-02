import { Download, Plus, Send } from 'lucide-react';
import { type ClipboardEventHandler, useMemo, useRef, useState } from 'react';

import { FileIcon } from '@/components/FileIcon';
import { ChatActionMenu, handleFileAction } from '@/components/FileMenu';
import { FilePicker } from '@/components/FilePicker';
import { FileStore, useFileStore } from '@/store';

export function ChatPage() {
  const { files, setPreviewFile, isLoading } = useFileStore();
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sortedFiles = useMemo(() => {
    return [...files].sort(
      (a, b) =>
        new Date(a.LastModified).getTime() - new Date(b.LastModified).getTime(),
    );
  }, [files]);

  // 封装发送逻辑
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    FileStore.value.sendText(text);

    // 发送后重置
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 重置高度到单行
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        // 纯回车：发送
        e.preventDefault(); // 阻止默认换行
        handleSend();
      }
      // 如果是 Shift + Enter，浏览器会自动处理换行
    }
  };

  const onPaste: ClipboardEventHandler = (e) => {
    const items = e.clipboardData.items;
    const files = Array.from(items)
      .filter((e) => e.kind === 'file')
      .map((e) => e.getAsFile());
    if (files.length) {
      e.stopPropagation();
      FileStore.value.upload(files.filter((f) => f !== null) as File[]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="relative flex w-full flex-1 flex-col-reverse overflow-y-auto p-4 pb-24 md:p-6 md:pb-32">
      <div className="mx-auto w-full max-w-3xl space-y-6 py-4 md:space-y-8 md:px-4">
        {isLoading && !sortedFiles.length ? (
          <div className="flex h-[80vh] items-center justify-center">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : (
          sortedFiles.map((file) => (
            <div
              className="group/item fade-in flex flex-col items-start"
              key={file.Key}
            >
              <div className="mb-2 w-full text-center font-medium text-[11px] text-slate-400/60 uppercase tracking-tighter">
                {new Date(file.LastModified).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              <div className="group/bubble relative max-w-[88%] md:max-w-[80%]">
                <div className="absolute -top-9 left-0 z-30 translate-y-1 opacity-0 transition-all duration-200 group-hover/bubble:translate-y-0 group-hover/bubble:opacity-100">
                  <div className="rounded-full bg-white/90 px-1 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:bg-slate-800/90">
                    <ChatActionMenu file={file} />
                  </div>
                </div>

                <div
                  className={`transition-all duration-300 ${
                    file.isMsg
                      ? 'rounded-[22px] rounded-tl-[4px] bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5 dark:bg-[#1C1C1E] dark:text-white dark:ring-white/10'
                      : 'rounded-2xl bg-white/40 p-2 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-white/5'
                  }`}
                >
                  {file.type === 'image' ? (
                    <div
                      className="cursor-pointer overflow-hidden rounded-xl"
                      onClick={() => setPreviewFile(file)}
                    >
                      <img
                        alt=""
                        className="max-h-72 w-auto object-cover md:max-h-[500px]"
                        src={file.url}
                      />
                    </div>
                  ) : file.isMsg ? (
                    <p className="whitespace-pre-wrap text-[15px] text-slate-800 leading-relaxed dark:text-slate-200">
                      {file.text}
                    </p>
                  ) : (
                    <div className="flex min-w-[220px] items-center gap-3 px-1 py-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                        <FileIcon fileName={file.Key} size={28} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[14px] text-slate-800 dark:text-slate-100">
                          {file.Key}
                        </div>
                        <div className="font-bold text-[11px] text-slate-400 uppercase tracking-tight">
                          {file.size}
                        </div>
                      </div>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-50"
                        onClick={() => handleFileAction('download', file)}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 输入框区域 */}
      <div className="fixed right-0 bottom-0 left-0 z-40 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7]/95 to-transparent p-4 pb-6 md:p-8 md:pb-10 dark:from-black">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[36px] border border-slate-200/50 bg-white/80 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all focus-within:ring-1 focus-within:ring-blue-500/20 md:gap-3 md:p-2 dark:border-white/10 dark:bg-[#1C1C1E]/90">
          <FilePicker onSelect={FileStore.value.upload}>
            <button className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-50 active:scale-90 md:h-12 md:w-12">
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </FilePicker>

          <textarea
            className="max-h-32 flex-1 resize-none border-none bg-transparent py-2.5 text-[16px] text-slate-800 leading-[1.4] placeholder:text-slate-400 focus:outline-none focus:ring-0 md:py-3.5 md:text-[17px]"
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={onPaste}
            placeholder="说点什么..."
            ref={textareaRef}
            rows={1}
            value={inputText}
          />

          <button
            className={`flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-all active:scale-95 md:h-12 md:w-12 ${
              inputText.trim()
                ? 'bg-blue-500 text-white shadow-blue-500/20 shadow-md'
                : 'bg-slate-100 text-slate-300 dark:bg-white/5'
            }`}
            disabled={!inputText.trim()}
            onClick={handleSend}
          >
            <Send fill={inputText.trim() ? 'currentColor' : 'none'} size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
