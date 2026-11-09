import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LoginPageProps {
  onLogin: (password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const empty = password.length === 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    if (loading || empty) return;
    setLoading(true);
    const ok = await onLogin(password);
    setLoading(false);
    if (ok) {
      setPassword('');
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div className="login-root relative flex h-[100dvh] w-full min-w-0 items-center justify-center overflow-hidden bg-[#F5F5F7] px-6 text-slate-900 dark:bg-black dark:text-white">
      {/* 背景：细网格 + 光晕 */}
      <div aria-hidden className="login-grid absolute inset-0" />
      <div aria-hidden className="login-orb login-orb-a" />
      <div aria-hidden className="login-orb login-orb-b" />

      <form
        className="relative z-10 w-full max-w-[360px] min-w-0"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* 顶部：图标 + 标题（无卡片、无阴影） */}
        <div className="login-intro">
          <div className="login-ring">
            <Lock size={24} strokeWidth={2.2} />
          </div>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase dark:text-white/40">
            Access required
          </p>
          <h1 className="mt-3 text-[42px] leading-none font-semibold tracking-[-0.04em]">
            Popo
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-500 dark:text-white/50">
            这里是私人空间，需要验证密码才能进入。
          </p>
        </div>

        {/* 输入区：只有一条底线，聚焦时展开 */}
        <div
          className={`login-field ${focused ? 'is-focused' : ''} ${shake ? 'shake' : ''}`}
        >
          <div className="flex items-center gap-3">
            <input
              autoComplete="current-password"
              className="w-full min-w-0 flex-1 bg-transparent pt-4 pb-3 text-[17px] font-medium tracking-tight outline-none placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-white/30"
              onBlur={() => setFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="输入访问密码"
              ref={inputRef}
              type={visible ? 'text' : 'password'}
              value={password}
            />

            <button
              aria-label={visible ? '隐藏密码' : '显示密码'}
              className="-mr-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setVisible((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              {visible ? (
                <EyeOff size={17} strokeWidth={2} />
              ) : (
                <Eye size={17} strokeWidth={2} />
              )}
            </button>

            <button
              aria-label="进入"
              className="group flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100 dark:bg-white dark:text-black dark:disabled:bg-white/15"
              disabled={empty || loading}
              type="submit"
            >
              {loading ? (
                <span className="login-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowRight
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  size={18}
                  strokeWidth={2.5}
                />
              )}
            </button>
          </div>

          <div className="login-underline">
            <span className="login-underline-fill" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[12px] text-slate-400 dark:text-white/30">
          <ShieldCheck size={14} strokeWidth={2} />
          <span>仅本地会话保存，不会上传</span>
        </div>
      </form>

      <style>{`
        .login-root { user-select: none; }

        /* 细网格，向内淡出 */
        .login-grid {
          background-image:
            linear-gradient(to right, rgba(15, 23, 42, 0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.055) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%);
          mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%);
          animation: grid-drift 30s linear infinite alternate;
        }
        @media (prefers-color-scheme: dark) {
          .login-grid {
            background-image:
              linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          }
        }
        @keyframes grid-drift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 28px 28px, 28px 28px; }
        }

        /* 柔和光晕，代替卡片阴影 */
        .login-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          opacity: 0.5;
          animation: orb-float 14s ease-in-out infinite;
        }
        .login-orb-a {
          width: 420px; height: 420px;
          top: -120px; right: -100px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.55), transparent 70%);
        }
        .login-orb-b {
          width: 380px; height: 380px;
          bottom: -140px; left: -120px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%);
          animation-delay: -7s;
        }
        .login-orb-c {
          width: 320px; height: 320px;
          left: 50%; top: 50%;
          margin: -160px 0 0 -160px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 70%);
          filter: blur(90px);
          animation-delay: -3.5s;
        }
        @media (prefers-color-scheme: dark) {
          .login-orb { opacity: 0.55; filter: blur(80px); }
        }
        @keyframes orb-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(24px, 36px, 0) scale(1.08); }
        }

        /* 入场 */
        .login-intro > * { animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .login-intro > *:nth-child(2) { animation-delay: 0.06s; }
        .login-intro > *:nth-child(3) { animation-delay: 0.12s; }
        .login-intro > *:nth-child(4) { animation-delay: 0.18s; }
        .login-field { animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both; }
        .login-field + div { animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.36s both; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 圆形徽标：细描边 + 静态光环，无阴影 */
        .login-ring {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 56px; height: 56px;
          border-radius: 9999px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          color: rgb(15 23 42);
        }
        .login-ring::before {
          content: '';
          position: absolute; inset: -9px;
          border-radius: 9999px;
          border: 1px dashed rgba(15, 23, 42, 0.14);
          animation: spin 24s linear infinite;
        }
        @media (prefers-color-scheme: dark) {
          .login-ring { border-color: rgba(255, 255, 255, 0.16); color: #fff; }
          .login-ring::before { border-color: rgba(255, 255, 255, 0.16); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* 底线输入 */
        .login-underline {
          position: relative;
          height: 1px;
          background: rgba(15, 23, 42, 0.15);
        }
        @media (prefers-color-scheme: dark) {
          .login-underline { background: rgba(255, 255, 255, 0.18); }
        }
        .login-underline-fill {
          position: absolute; left: 0; bottom: 0;
          height: 1.5px; width: 100%;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .login-field.is-focused .login-underline-fill { transform: scaleX(1); }

        /* 错误抖动 */
        .shake { animation: shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        .login-spin { animation: spin 0.7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .login-grid, .login-orb, .login-ring::before, .login-spin { animation: none; }
          .login-intro > *, .login-field, .login-field + div { animation-duration: 0.01s; }
        }
      `}</style>
    </div>
  );
}
