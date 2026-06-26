"use client";

import { useState } from "react";

interface Props {
  onSuccess: (token: string) => void;
}

export default function PasswordModal({ onSuccess }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "x-access-token": value },
      });
      if (res.ok) {
        onSuccess(value);
      } else {
        setError("비밀번호가 올바르지 않습니다");
        setValue("");
      }
    } catch (err) {
      console.error("PasswordModal: 인증 요청 오류:", err);
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-8"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--bg-input)" }}
          >
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            접근 비밀번호
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-base"
            style={{
              background: "var(--bg-input)",
              color: "var(--text)",
              border: "1px solid var(--border-inner)",
              outline: "none",
            }}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !value}
            className="w-full py-3 rounded-xl font-semibold text-base transition-all"
            style={{
              background: "var(--accent)",
              color: "#000",
              opacity: loading || !value ? 0.5 : 1,
              cursor: loading || !value ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "확인 중..." : "확인"}
          </button>
        </form>
      </div>
    </div>
  );
}
