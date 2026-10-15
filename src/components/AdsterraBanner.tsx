import { useEffect, useRef, useState } from "react";

interface AdsterraLeaderboardProps {
  className?: string;
  showLabel?: boolean;
}

interface AdsterraMobileBannerProps {
  className?: string;
  showLabel?: boolean;
}

export type AdSize = "auto" | "320x50" | "728x90";

interface AdsterraBannerProps {
  className?: string;
  showLabel?: boolean;
  size?: AdSize;
}

// Strict hardcoded HTTPS endpoints
const HTTPS_LEADERBOARD_URL =
  "https://www.highrevenueformat.com/329ec398cfd98cca6de8b31af412a0ae/invoke.js";
const HTTPS_MOBILE_URL =
  "https://www.highrevenueformat.com/d475729d8709db61ab24a1caf5d55711/invoke.js";

/**
 * Dedicated 728x90 Leaderboard Ad
 * Features:
 * 1. Explicit hardcoded HTTPS protocol to avoid redirect degradation.
 * 2. Pre-rendered fixed dimensions (728x90) preventing layout collapse during 307 redirects.
 * 3. Double-injection guard protecting in-flight redirect requests from fast React reconciliation.
 */
export function AdsterraLeaderboard({
  className = "",
  showLabel = true,
}: AdsterraLeaderboardProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef<boolean>(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    // Check to prevent script double-injection during fast reconciliation / auth state re-renders
    if (injectedRef.current || slot.getAttribute("data-adsterra-injected") === "true") {
      return;
    }

    injectedRef.current = true;
    slot.setAttribute("data-adsterra-injected", "true");

    try {
      // 1. Config script defining atOptions
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `atOptions = {
        'key' : '329ec398cfd98cca6de8b31af412a0ae',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };`;

      // 2. Hardcoded strict HTTPS invoke script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = HTTPS_LEADERBOARD_URL;
      invokeScript.async = true;

      invokeScript.onerror = () => {
        console.warn("[Adsterra] 728x90 script failed to load or was blocked by an ad-blocker.");
        setIsBlocked(true);
      };

      slot.appendChild(confScript);
      slot.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra] Leaderboard injection error:", err);
    }
  }, []);

  return (
    <div
      className={`mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-4 ${className}`}
    >
      {showLabel && (
        <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement (728×90)
        </span>
      )}

      {/* Pre-rendered exact dimensions (728px x 90px) to prevent container collapse during 307 redirects */}
      <div
        className="glass-soft relative flex items-center justify-center overflow-x-auto rounded-2xl border border-border/50 p-1.5 shadow-sm"
        style={{
          width: "740px",
          maxWidth: "100%",
          minHeight: "102px",
        }}
      >
        <div
          style={{
            width: "728px",
            height: "90px",
            minWidth: "728px",
            minHeight: "90px",
          }}
          className="flex items-center justify-center overflow-hidden"
        >
          {/* Isolated DOM node managed exclusively by useEffect */}
          <div
            ref={slotRef}
            style={{
              width: "728px",
              height: "90px",
              minWidth: "728px",
              minHeight: "90px",
            }}
            className="flex items-center justify-center"
          />
        </div>

        {isBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 p-2 text-center backdrop-blur-xs">
            <span className="text-xs font-semibold text-amber">Ad Blocker Detected</span>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              highrevenueformat.com was blocked by a browser extension or Brave Shields.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dedicated 320x50 Mobile Banner Ad
 */
export function AdsterraMobileBanner({
  className = "",
  showLabel = true,
}: AdsterraMobileBannerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef<boolean>(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    // Check to prevent double-injection during fast reconciliation
    if (injectedRef.current || slot.getAttribute("data-adsterra-injected") === "true") {
      return;
    }

    injectedRef.current = true;
    slot.setAttribute("data-adsterra-injected", "true");

    try {
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `atOptions = {
        'key' : 'd475729d8709db61ab24a1caf5d55711',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };`;

      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = HTTPS_MOBILE_URL;
      invokeScript.async = true;

      invokeScript.onerror = () => {
        console.warn("[Adsterra] 320x50 script failed to load or was blocked by an ad-blocker.");
        setIsBlocked(true);
      };

      slot.appendChild(confScript);
      slot.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra] Mobile banner injection error:", err);
    }
  }, []);

  return (
    <div
      className={`mx-auto flex w-full max-w-sm flex-col items-center justify-center py-4 ${className}`}
    >
      {showLabel && (
        <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement (320×50)
        </span>
      )}

      {/* Pre-rendered exact dimensions (320px x 50px) */}
      <div
        className="glass-soft relative flex items-center justify-center rounded-2xl border border-border/50 p-1.5 shadow-sm"
        style={{
          width: "332px",
          maxWidth: "100%",
          minHeight: "62px",
        }}
      >
        <div
          style={{
            width: "320px",
            height: "50px",
            minWidth: "320px",
            minHeight: "50px",
          }}
          className="flex items-center justify-center overflow-hidden"
        >
          <div
            ref={slotRef}
            style={{
              width: "320px",
              height: "50px",
              minWidth: "320px",
              minHeight: "50px",
            }}
            className="flex items-center justify-center"
          />
        </div>

        {isBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 p-2 text-center backdrop-blur-xs">
            <span className="text-xs font-semibold text-amber">Ad Blocker Detected</span>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              highrevenueformat.com was blocked by a browser extension.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Responsive Adsterra Banner
 * Automatically displays the 728x90 Leaderboard on desktop (>=768px)
 * and the 320x50 Banner on mobile devices (<768px).
 */
export function AdsterraBanner({
  className = "",
  showLabel = true,
  size = "auto",
}: AdsterraBannerProps) {
  if (size === "728x90") {
    return <AdsterraLeaderboard className={className} showLabel={showLabel} />;
  }

  if (size === "320x50") {
    return <AdsterraMobileBanner className={className} showLabel={showLabel} />;
  }

  // Responsive mode: CSS-level display to ensure exact container dimensions
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
