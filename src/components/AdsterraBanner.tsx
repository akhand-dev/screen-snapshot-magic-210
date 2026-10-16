import { useEffect, useRef } from "react";

interface AdsterraProps {
  className?: string;
  showLabel?: boolean;
}

const AD_CONFIG_728X90 = {
  key: "329ec398cfd98cca6de8b31af412a0ae",
  format: "iframe",
  height: 90,
  width: 728,
  url: "https://www.highrevenueformat.com/329ec398cfd98cca6de8b31af412a0ae/invoke.js",
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
 *
 * Fixes applied:
 * 1. Strict HTTPS URL: "https://www.highrevenueformat.com/..." (no protocol-relative //)
 * 2. React 18 / Next.js Strict Mode resilient: Does NOT wipe container.innerHTML on cleanup,
 *    allowing in-flight 307 redirects and iframe rendering to complete without being aborted.
 * 3. Explicit invokeScript.async = true for fast, non-blocking execution.
 * 4. Fixed CSS styling (width: 728px, height: 90px, min-height: 90px, margin: 0 auto, overflow: hidden)
 *    to completely eliminate Cumulative Layout Shift (CLS).
 * 5. Zero ad blocker fallback text or overlays.
 */
export function AdsterraLeaderboard({ className = "", showLabel = false }: AdsterraProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    // Prevent double-injection during React 18 Strict Mode double mounts
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

      // 2. External invoke script with explicit HTTPS and async = true
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = AD_CONFIG_728X90.url;
      invokeScript.async = true;

      container.appendChild(confScript);
      container.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra 728x90] Injection error:", err);
    }

    // NOTE: In React 18 Strict Mode, DO NOT wipe container.innerHTML on unmount.
    // Wiping innerHTML aborts in-flight 307 redirects and kills the Adsterra iframe.
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
      invokeScript.async = true;

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
 * Automatically displays 728x90 on desktop and 320x50 on mobile screens.
 */
export function AdsterraBanner({
  className = "",
  showLabel = false,
  size = "auto",
}: AdsterraBannerProps) {
  if (size === "728x90") {
    return <AdsterraLeaderboard className={className} showLabel={showLabel} />;
  }

  if (size === "320x50") {
    return <AdsterraMobileBanner className={className} showLabel={showLabel} />;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="hidden md:block">
        <AdsterraLeaderboard showLabel={showLabel} />
      </div>
      <div className="block md:hidden">
        <AdsterraMobileBanner showLabel={showLabel} />
      </div>
    </div>
  );
}

export default AdsterraBanner;
