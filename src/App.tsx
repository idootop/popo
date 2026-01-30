import { Cloud, FileText, MessageCircle, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from 'zenbox';

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
    <div className="flex h-screen w-full select-none overflow-hidden bg-[#f8f9fb] font-sans text-slate-700">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航 */}
        <header className="z-[60] flex h-14 items-center justify-between border-slate-100 border-b bg-white px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 text-white shadow-lg md:rounded-xl md:p-2">
              <Cloud className="md:h-5 md:w-5" size={18} strokeWidth={2.5} />
            </div>
            <h1 className="hidden font-black text-lg text-slate-800 tracking-tight sm:block md:text-xl">
              Popo
            </h1>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            {[
              { id: 'chat', icon: MessageCircle, label: '消息' },
              { id: 'files', icon: FileText, label: '文件' },
            ].map((tab) => (
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-bold text-xs transition-all md:px-5 md:text-sm ${
                  mainTab === tab.id
                    ? 'bg-white text-amber-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
              >
                <tab.icon size={16} />
                <span
                  className={mainTab === tab.id ? 'block' : 'hidden md:block'}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50">
            <Settings size={20} />
          </button>
        </header>

        <main className="relative flex flex-1 flex-col overflow-hidden">
          {mainTab === 'chat' && <ChatPage />}
          {mainTab === 'files' && <FilePage />}
        </main>
      </div>

      <FilePreview />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
