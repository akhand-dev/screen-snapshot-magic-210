import { useEffect, useRef, useState } from "react";

interface AdsterraProps {
  className?: string;
  showLabel?: boolean;
}

const AD_CONFIG_728X90 = {
  key: "adc80d9f75af763d0c8c5631759aec45",
  format: "iframe",
  height: 90,
  width: 728,
  url: "https://www.highrevenueformat.com/adc80d9f75af763d0c8c5631759aec45/invoke.js",
};

const AD_CONFIG_320X50 = {
  key: "d475729d8709db61ab24a1caf5d55711",
  format: "iframe",
  height: 50,
  width: 320,
  url: "https://www.highrevenueformat.com/d475729d8709db61ab24a1caf5d55711/invoke.js",
};

/**
 * Adsterra 728x90 Leaderboard Banner
 * - Uses document-ordered script injection (async = false) so Adsterra can locate document.currentScript
 * - Fixed 728x90 container to eliminate Cumulative Layout Shift (CLS)
 * - Strict HTTPS URL
 * - Protected against double mounting
 */
export function AdsterraLeaderboard({ className = "", showLabel = false }: AdsterraProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    if (isLoadedRef.current || container.children.length > 0) {
      return;
    }

    isLoadedRef.current = true;

    try {
      // 1. Configuration script defining atOptions
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `atOptions = {
        'key' : '${AD_CONFIG_728X90.key}',
        'format' : '${AD_CONFIG_728X90.format}',
        'height' : ${AD_CONFIG_728X90.height},
        'width' : ${AD_CONFIG_728X90.width},
        'params' : {}
      };`;

      // 2. External invoke script
      // async = false ensures execution in exact DOM order so document.currentScript is preserved
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = AD_CONFIG_728X90.url;
      invokeScript.async = false;

      container.appendChild(confScript);
      container.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra 728x90] Injection error:", err);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      {showLabel && (
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </span>
      )}
      <div
        style={{
          width: "728px",
          height: "90px",
          minHeight: "90px",
          margin: "0 auto",
          overflow: "hidden",
        }}
        className="max-w-full flex items-center justify-center"
      >
        <div
          ref={bannerRef}
          style={{
            width: "728px",
            height: "90px",
            minHeight: "90px",
            overflow: "hidden",
          }}
          className="flex items-center justify-center"
        />
      </div>
    </div>
  );
}

/**
 * Adsterra 320x50 Mobile Banner
 */
export function AdsterraMobileBanner({ className = "", showLabel = false }: AdsterraProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    if (isLoadedRef.current || container.children.length > 0) {
      return;
    }

    isLoadedRef.current = true;

    try {
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `atOptions = {
        'key' : '${AD_CONFIG_320X50.key}',
        'format' : '${AD_CONFIG_320X50.format}',
        'height' : ${AD_CONFIG_320X50.height},
        'width' : ${AD_CONFIG_320X50.width},
        'params' : {}
      };`;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = AD_CONFIG_320X50.url;
      invokeScript.async = false;

      container.appendChild(confScript);
      container.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra 320x50] Injection error:", err);
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      {showLabel && (
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </span>
      )}
      <div
        style={{
          width: "320px",
          height: "50px",
          minHeight: "50px",
          margin: "0 auto",
          overflow: "hidden",
        }}
        className="max-w-full flex items-center justify-center"
      >
        <div
          ref={bannerRef}
          style={{
            width: "320px",
            height: "50px",
            minHeight: "50px",
            overflow: "hidden",
          }}
          className="flex items-center justify-center"
        />
      </div>
    </div>
  );
}

export type AdSize = "auto" | "320x50" | "728x90";

interface AdsterraBannerProps extends AdsterraProps {
  size?: AdSize;
}

/**
 * Responsive Adsterra Banner
 * Mounts ONLY one banner variant (728x90 on desktop, 320x50 on mobile)
 * to prevent global window.atOptions collisions between concurrent scripts.
 */
export function AdsterraBanner({
  className = "",
  showLabel = false,
  size = "auto",
}: AdsterraBannerProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (size === "728x90" || (size === "auto" && !isMobile)) {
    return <AdsterraLeaderboard className={className} showLabel={showLabel} />;
  }

  return <AdsterraMobileBanner className={className} showLabel={showLabel} />;
}

export default AdsterraBanner;
