import Editor, { loader } from '@monaco-editor/react';
import { CheckCircle2, FileCode, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { COS } from '@/cos';
import { FileStore } from '@/store';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' },
});

export const CodeEditor = ({ file }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');

  // 获取高亮语言映射
  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      md: 'markdown',
      json: 'json',
      html: 'html',
      css: 'css',
      sql: 'sql',
      sh: 'shell',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      c: 'cpp',
      cpp: 'cpp',
      java: 'java',
      go: 'go',
      rs: 'rust',
    };
    return map[ext || ''] || 'plaintext';
  };

  // 1. 加载文件内容
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const text = await COS.instance.readString(file.Key);
        if (isMounted) {
          setContent(text);
          setIsDirty(false); // 加载完后初始状态为未修改
        }
      } catch (err: any) {
        toast.error(`读取失败: ${err.message}`);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [file.Key]);

  // 2. 纯手动保存逻辑
  const handleSave = useCallback(async () => {
    if (content === null || !isDirty || isSaving) return;

    setIsSaving(true);
    try {
      await FileStore.value.writeString(file.Key, content);
      setIsDirty(false);
      toast.success('已保存');
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [file.Key, content, isDirty, isSaving]);

  // 3. 变更监听 (仅标记 dirty，不触发自动保存)
  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
    if (!isDirty) setIsDirty(true);
  };

  // 4. 快捷键支持: Cmd+S 保存, Alt+Z 切换换行
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.altKey && e.key === 'z') {
        e.preventDefault();
        setWordWrap((prev) => (prev === 'on' ? 'off' : 'on'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (content === null)
    return (
      <div className="flex h-full w-full items-center justify-center dark:bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-slate-400" size={24} />
          <p className="text-slate-500 text-sm">正在载入代码...</p>
        </div>
      </div>
    );

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#1e1e1e]">
      {/* 编辑器顶部工具栏 */}
      <div className="flex h-10 items-center justify-between border-slate-200 border-b bg-slate-50 px-4 dark:border-white/5 dark:bg-[#252526]">
        <div className="flex items-center gap-2 text-slate-500">
          <FileCode size={16} />
          <span className="font-mono text-xs opacity-80">{file.Key}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-[11px]">
            {isSaving ? (
              <span className="flex items-center gap-1 text-blue-500">
                <RefreshCw className="animate-spin" size={12} /> 保存中
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1 text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                待保存
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500/80">
                <CheckCircle2 size={12} /> 已就绪
              </span>
            )}
          </div>

          <button
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-bold text-xs transition-all active:scale-95 ${
              isDirty
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-600'
            }`}
            disabled={!isDirty || isSaving}
            onClick={handleSave}
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>

      {/* Monaco 编辑器主体 */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage(file.Key)}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            wordWrap: wordWrap,
            minimap: {
              enabled: true,
              maxColumn: 80,
              renderCharacters: false, // 提高大文件滚动性能
            },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            renderWhitespace: 'selection',
            folding: true, // 开启代码折叠
            bracketPairColorization: { enabled: true }, // 括号着色对齐
            guides: { bracketPairs: true },
            padding: { top: 10, bottom: 10 },
          }}
          theme={isDark ? 'vs-dark' : 'light'}
          value={content}
        />
      </div>
    </div>
  );
};
