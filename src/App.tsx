import { jsonDecode, jsonEncode } from '@del-wang/utils';
import { Cloud, FileText, MessageCircle, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useStore } from 'zenbox';

import { FileDrop } from './components/FileDrop';
import { FilePicker } from './components/FilePicker';
import { FilePreview } from './components/FilePreview';
import { ChatPage } from './pages/ChatPage';
import { FilePage } from './pages/FilePage';
import { LoginPage } from './pages/LoginPage';
import { FileStore } from './store';

export default function App() {
  const { mainTab, setMainTab, refreshFiles, isLoading } = useStore(FileStore);

  // --- 密码保护逻辑 ---
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!jsonDecode(localStorage.getItem('config'))?.SecretKey,
  );

  const handleLogin = async (password: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PREFIX}/${password}.json`,
      );
      const data = await res.json();
      if (!data.SecretKey) throw new Error('404');
      localStorage.setItem('config', jsonEncode(data));
      setIsAuthenticated(true);
      toast.success('验证成功');
      return true;
    } catch {
      toast.error('验证失败');
      return false;
    }
  };

  useEffect(() => {
    // 只有在通过验证后才加载文件
    if (!isAuthenticated) return;

    refreshFiles();

    // 页面回到前台/重新聚焦时刷新列表，避免长时间挂起的页面看到的是旧数据
    let lastRefresh = Date.now();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastRefresh < 2000) return;
      lastRefresh = now;
      refreshFiles();
    };

    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [isAuthenticated, refreshFiles]);

  // 如果未登录，渲染登录界面
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // --- 原有的 App 主体逻辑 ---
  return (
    <div className="flex h-screen w-full flex-1 flex-col overflow-hidden bg-[#F5F5F7] font-sans text-slate-900 antialiased select-none dark:bg-black">
      <header className="sticky top-0 z-[60] flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-xl md:h-16 md:px-8 dark:border-white/10 dark:bg-[#1C1C1E]/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-blue-500 p-1.5 text-white shadow-md md:p-2">
            <Cloud size={18} strokeWidth={2.5} />
          </div>
          <h1 className="hidden text-[19px] font-bold tracking-tight sm:block">
            Popo
          </h1>
        </div>

        <div className="flex items-center rounded-lg bg-slate-200/50 p-1 dark:bg-white/10">
          {[
            { id: 'chat', icon: MessageCircle, label: '消息' },
            { id: 'files', icon: FileText, label: '文件' },
          ].map((tab) => (
            <button
              className={`relative flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
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
          <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95">
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

      {/* 手动刷新列表 */}
      <button
        aria-label="刷新列表"
        className={`fixed right-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-200/60 bg-white/80 text-slate-600 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all hover:bg-white active:scale-90 disabled:cursor-default md:h-14 md:w-14 dark:border-white/10 dark:bg-[#1C1C1E]/80 dark:text-slate-300 dark:hover:bg-[#2C2C2E] ${
          mainTab === 'chat'
            ? 'bottom-24 md:right-[calc(max(2rem,calc(50%_-_24rem))_+_0.25rem)] md:bottom-32'
            : 'bottom-6 md:right-8 md:bottom-8'
        }`}
        disabled={isLoading}
        onClick={() => refreshFiles()}
        title="刷新列表"
        type="button"
      >
        <RefreshCw
          className={`md:h-[22px] md:w-[22px] ${isLoading ? 'animate-spin' : ''}`}
          size={20}
        />
      </button>

      <style>{`
        body { background-color: #F5F5F7; }
        @media (prefers-color-scheme: dark) {
          body { background-color: #000; }
        }
        .fade-in { animation: ios-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes ios-fade { 
          from { opacity: 0; transform: scale(0.99) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
      `}</style>
    </div>
  );
}
