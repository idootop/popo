import { Cloud, FileText, MessageCircle, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from 'zenbox';

import { FileDrop } from './components/FileDrop';
import { FilePicker } from './components/FilePicker';
import { FilePreview } from './components/FilePreview';
import { ChatPage } from './pages/ChatPage';
import { FilePage } from './pages/FilePage';
import { FileStore } from './store';

export default function App() {
  const { mainTab, setMainTab, refreshFiles } = useStore(FileStore);

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <div className="flex h-screen w-full flex-1 select-none flex-col overflow-hidden bg-[#F5F5F7] font-sans text-slate-900 antialiased dark:bg-black">
      {/* 顶部导航：吸顶逻辑 */}
      <header className="sticky top-0 z-[60] flex h-14 items-center justify-between border-slate-200/60 border-b bg-white/80 px-4 backdrop-blur-xl md:h-16 md:px-8 dark:border-white/10 dark:bg-[#1C1C1E]/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-blue-500 p-1.5 text-white shadow-md md:p-2">
            <Cloud size={18} strokeWidth={2.5} />
          </div>
          <h1 className="hidden font-bold text-[19px] tracking-tight sm:block">
            Popo
          </h1>
        </div>

        <div className="flex items-center rounded-lg bg-slate-200/50 p-1 dark:bg-white/10">
          {[
            { id: 'chat', icon: MessageCircle, label: '消息' },
            { id: 'files', icon: FileText, label: '文件' },
          ].map((tab) => (
            <button
              className={`relative flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 font-semibold text-[13px] transition-all duration-200 ${
                mainTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-white/20 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
            >
              <tab.icon size={15} strokeWidth={mainTab === tab.id ? 2.5 : 2} />
              <span
                className={mainTab === tab.id ? 'block' : 'hidden md:block'}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <FilePicker onSelect={FileStore.value.upload}>
          <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 font-bold text-[13px] text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95">
            <Plus size={16} strokeWidth={3} />
            <span className="hidden sm:block">上传</span>
          </button>
        </FilePicker>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {mainTab === 'chat' && <ChatPage />}
        {mainTab === 'files' && <FilePage />}
      </main>

      <FileDrop />
      <FilePreview />

      <style>{`
        body { background-color: #F5F5F7; }
        .fade-in { animation: ios-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes ios-fade { 
          from { opacity: 0; transform: scale(0.99) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
      `}</style>
    </div>
  );
}
