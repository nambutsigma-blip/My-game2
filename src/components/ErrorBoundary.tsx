import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    if (typeof (this as any).setState === 'function') {
      (this as any).setState({ errorInfo });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetDataAndReload = () => {
    try {
      const keysToClear = [
        'egg_thief_crystals',
        'egg_thief_stolen_eggs',
        'egg_thief_hatched_pets',
        'egg_thief_stealth_boots',
        'egg_thief_unlocked_units',
        'egg_thief_completed_units',
        'egg_thief_skill_tree',
        'egg_thief_admin_session_active',
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleOpenNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // ignore
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Khôi Phục Giao Diện Game</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đã phát hiện sự cố hiển thị hoặc dữ liệu tạm thời chưa đồng bộ. Bạn có thể nhấn tải lại hoặc làm mới bộ nhớ đệm để vào lại game ngay lập tức.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại màn hình</span>
              </button>

              <button
                onClick={this.handleOpenNewTab}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở trong Tab Trình Duyệt Mới</span>
              </button>

              <button
                onClick={this.handleResetDataAndReload}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm mới Cache & Khôi phục gốc</span>
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-rose-300 overflow-auto max-h-32">
                <summary className="cursor-pointer font-semibold text-slate-400 hover:text-slate-200">
                  Chi tiết kỹ thuật (Debug Info)
                </summary>
                <pre className="mt-2 text-[10px] whitespace-pre-wrap break-all text-slate-400 font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
