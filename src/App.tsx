import {
  Cloud,
  Download,
  Edit3,
  File as FileIcon,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zenbox';

import { FileStore } from './store';

export default function App() {
  const store = useStore(FileStore);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    store.refreshFiles();
  }, []);

  useEffect(() => {
    if (store.viewMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [store.files, store.viewMode]);

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfaf5] font-sans text-[#5d576b]">
      {/* 导航栏 */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-orange-100 border-b bg-white/70 px-6 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 rotate-6 transform items-center justify-center rounded-2xl bg-amber-400 text-white shadow-lg">
            <Cloud size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-xl">Popo</h1>
          </div>
        </div>

        <div className="flex rounded-2xl bg-gray-100 p-1">
          <button
            className={`flex items-center space-x-2 rounded-xl px-4 py-1.5 font-bold text-sm transition-all ${store.viewMode === 'chat' ? 'bg-amber-400 text-white shadow-md' : 'text-gray-400'}`}
            onClick={() => store.setViewMode('chat')}
          >
            <MessageSquare size={16} /> <span>时光流</span>
          </button>
          <button
            className={`flex items-center space-x-2 rounded-xl px-4 py-1.5 font-bold text-sm transition-all ${store.viewMode === 'grid' ? 'bg-amber-400 text-white shadow-md' : 'text-gray-400'}`}
            onClick={() => store.setViewMode('grid')}
          >
            <LayoutGrid size={16} /> <span>文件库</span>
          </button>
        </div>

        <div />
      </header>

      {/* 主视图 */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {store.viewMode === 'chat' ? (
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {store.files.map((file) => (
                <div
                  className="group slide-in-from-bottom-2 flex animate-in flex-col duration-300"
                  key={file.Key}
                >
                  <span className="mb-1 ml-2 text-[10px] text-gray-300">
                    {new Date(file.LastModified).toLocaleTimeString()}
                  </span>
                  <div className="flex max-w-[90%] items-start">
                    <div
                      className={`cursor-pointer rounded-3xl rounded-tl-none border p-4 shadow-sm ${file.Key.startsWith('msg_') ? 'border-amber-50 bg-white' : 'border-amber-100 bg-amber-50/50'}`}
                      onClick={() => store.previewFile(file)}
                    >
                      {file.isImage ? (
                        <ImageIcon className="text-amber-200" size={48} />
                      ) : file.isText && file.Key.startsWith('msg_') ? (
                        <p className="whitespace-pre-wrap">
                          消息存档: {file.Key.slice(-10)}
                        </p>
                      ) : (
                        <div className="flex items-center space-x-2 font-bold">
                          <FileIcon size={18} />
                          <span>{file.Key}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 ml-4 flex space-x-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="flex items-center font-bold text-[10px] text-blue-400 hover:underline"
                      onClick={() => store.copyLink(file.Key)}
                    >
                      <Link2 className="mr-1" size={12} />
                      分享
                    </button>
                    <button
                      className="flex items-center font-bold text-[10px] text-gray-400 hover:underline"
                      onClick={() => store.download(file.Key)}
                    >
                      <Download className="mr-1" size={12} />
                      下载
                    </button>
                    <button
                      className="flex items-center font-bold text-[10px] text-red-300 hover:underline"
                      onClick={() => store.deleteFile(file.Key)}
                    >
                      <Trash2 className="mr-1" size={12} />
                      丢弃
                    </button>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* 输入框 */}
            <div className="p-4">
              <div className="flex items-end space-x-2 rounded-[32px] border border-amber-100 bg-white/80 p-2 shadow-xl backdrop-blur-sm">
                <button
                  className="rounded-2xl p-3.5 text-gray-400 hover:text-amber-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={24} />
                </button>
                <textarea
                  className="flex-1 resize-none border-none bg-transparent p-3 text-gray-700 focus:ring-0"
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      store.sendText(inputText);
                      setInputText('');
                    }
                  }}
                  placeholder="发送文字或拖入文件..."
                  rows={1}
                  value={inputText}
                />
                <button
                  className="rounded-2xl bg-amber-400 p-3.5 text-white disabled:opacity-30"
                  disabled={!inputText.trim()}
                  onClick={() => {
                    store.sendText(inputText);
                    setInputText('');
                  }}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
              {store.files.map((file) => (
                <div
                  className="group relative cursor-pointer rounded-[32px] border border-transparent bg-white p-4 transition-all hover:border-amber-200"
                  key={file.Key}
                  onClick={() => store.previewFile(file)}
                >
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-[24px] bg-gray-50 text-amber-200">
                    {file.isImage ? (
                      <ImageIcon size={40} />
                    ) : (
                      <FileIcon size={40} />
                    )}
                  </div>
                  <p className="truncate font-bold text-sm">{file.Key}</p>
                  <p className="text-[10px] text-gray-300">
                    {(file.Size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-red-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      store.deleteFile(file.Key);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 编辑/预览弹窗 */}
      {store.editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-md">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[48px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-8">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-500">
                  <Edit3 size={20} />
                </div>
                <h3 className="max-w-md truncate font-black">
                  {store.editingFile.key}
                </h3>
              </div>
              <button
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
                onClick={() => store.setEditingFile(null)}
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#fdfdfd] p-10">
              {store.editingFile.type === 'text' ? (
                <textarea
                  className="h-full w-full border-none bg-transparent font-mono text-sm leading-relaxed focus:ring-0"
                  onChange={(e) =>
                    store.setEditingFile({
                      ...store.editingFile,
                      content: e.target.value,
                    })
                  }
                  value={store.editingFile.content}
                />
              ) : (
                <img
                  alt="Preview"
                  className="mx-auto max-h-full rounded-3xl"
                  src={store.editingFile.content}
                />
              )}
            </div>
            <div className="flex justify-end space-x-3 border-t p-8">
              <button
                className="rounded-2xl bg-gray-100 px-8 py-3 font-bold"
                onClick={() => store.setEditingFile(null)}
              >
                关闭
              </button>
              {store.editingFile.type === 'text' && (
                <button
                  className="rounded-2xl bg-amber-400 px-10 py-3 font-black text-white"
                  onClick={() =>
                    store.saveEdit(
                      store.editingFile!.key,
                      store.editingFile!.content,
                    )
                  }
                >
                  保存修改
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        className="hidden"
        multiple
        onChange={(e) => store.upload(e.target.files)}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
