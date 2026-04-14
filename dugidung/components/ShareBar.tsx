"use client";
import { useState, useEffect } from "react";

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

type KakaoLink = { mobileWebUrl: string; webUrl: string };
interface KakaoStatic {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (options: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: KakaoLink;
      };
      buttons?: Array<{ title: string; link: KakaoLink }>;
    }) => void;
  };
}
declare global {
  interface Window {
    Kakao?: KakaoStatic;
  }
}

export default function ShareBar({
  url,
  title,
  description,
  imageUrl,
}: {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!key) return;
    if (window.Kakao?.isInitialized()) {
      setKakaoReady(true);
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${KAKAO_SDK_URL}"]`,
    );
    const onReady = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
      setKakaoReady(true);
    };
    if (script) {
      if (window.Kakao) {
        onReady();
      } else {
        script.addEventListener("load", onReady, { once: true });
      }
      return;
    }
    script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    document.head.appendChild(script);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }

  function shareKakao() {
    if (!window.Kakao?.Share) return;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        {
          title: "결과 보기",
          link: { mobileWebUrl: url, webUrl: url },
        },
      ],
    });
  }

  return (
    <div className="flex justify-center gap-6 mt-8 text-sm">
      <button
        type="button"
        onClick={copyLink}
        className="text-accent border-b border-accent-dim hover:border-accent pb-0.5"
      >
        {copied ? "복사됨" : "링크 복사"}
      </button>
      {kakaoReady && (
        <button
          type="button"
          onClick={shareKakao}
          className="text-accent border-b border-accent-dim hover:border-accent pb-0.5"
        >
          카카오톡
        </button>
      )}
    </div>
  );
}
