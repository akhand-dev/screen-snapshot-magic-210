import { useEffect, useRef, useState } from "react";

export type AdSize = "auto" | "320x50" | "728x90";

interface AdsterraBannerProps {
  className?: string;
  showLabel?: boolean;
  size?: AdSize;
}

const AD_CONFIGS = {
  "320x50": {
    width: 320,
    height: 50,
    key: "d475729d8709db61ab24a1caf5d55711",
    scriptUrl: "https://www.highrevenueformat.com/d475729d8709db61ab24a1caf5d55711/invoke.js",
  },
  "728x90": {
    width: 728,
    height: 90,
    key: "329ec398cfd98cca6de8b31af412a0ae",
    scriptUrl: "https://www.highrevenueformat.com/329ec398cfd98cca6de8b31af412a0ae/invoke.js",
  },
} as const;

export function AdsterraBanner({
  className = "",
  showLabel = true,
  size = "auto",
}: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adSlotRef = useRef<HTMLDivElement>(null);

  const [resolvedSize, setResolvedSize] = useState<"320x50" | "728x90">(() => {
    if (size !== "auto") return size;
    if (typeof window !== "undefined" && window.innerWidth < 768) return "320x50";
    return "728x90";
  });

  const [scale, setScale] = useState(1);
  const [isBlocked, setIsBlocked] = useState(false);

  // Responsive size determination
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;

      if (size === "auto") {
        if (width >= 750) {
          setResolvedSize("728x90");
          setScale(1);
        } else {
          setResolvedSize("320x50");
          setScale(width > 0 && width < 320 ? Math.max(0.65, width / 320) : 1);
        }
      } else if (size === "728x90") {
        setResolvedSize("728x90");
        setScale(width > 0 && width < 728 ? Math.max(0.45, width / 728) : 1);
      } else {
        setResolvedSize("320x50");
        setScale(width > 0 && width < 320 ? Math.max(0.65, width / 320) : 1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const cfg = AD_CONFIGS[resolvedSize];

  // Dynamic React useEffect script injection
  useEffect(() => {
    const slot = adSlotRef.current;
    if (!slot) return;

    // Reset slot and state on size change / mount
    slot.innerHTML = "";
    setIsBlocked(false);

    try {
      // 1. Create config script that assigns atOptions
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.text = `atOptions = {
        'key' : '${cfg.key}',
        'format' : 'iframe',
        'height' : ${cfg.height},
        'width' : ${cfg.width},
        'params' : {}
      };`;

      // 2. Create the external invoke.js script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = cfg.scriptUrl;
      invokeScript.async = true;

      invokeScript.onerror = () => {
        console.warn(
          `[Adsterra] Ad script failed to load or was blocked by an ad-blocker: ${cfg.scriptUrl}`,
        );
        setIsBlocked(true);
      };

      // Append scripts sequentially into the slot container
      slot.appendChild(confScript);
      slot.appendChild(invokeScript);
    } catch (err) {
      console.error("[Adsterra] Injection error:", err);
    }

    return () => {
      if (slot) {
        slot.innerHTML = "";
      }
    };
  }, [resolvedSize, cfg.key, cfg.height, cfg.width, cfg.scriptUrl]);

  const containerWidth = scale < 1 ? Math.round(cfg.width * scale) : cfg.width + 16;
  const containerHeight = scale < 1 ? Math.round(cfg.height * scale + 10) : cfg.height + 14;

  return (
    <div
      ref={containerRef}
      className={`mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-4 ${className}`}
    >
      {showLabel && (
        <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement ({cfg.width}×{cfg.height})
        </span>
      )}

      <div
        className="glass-soft relative flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 p-1.5 shadow-sm transition-all"
        style={{
          width: `${containerWidth}px`,
          maxWidth: "100%",
          minHeight: `${containerHeight}px`,
        }}
      >
        <div
          style={{
            width: `${cfg.width}px`,
            minHeight: `${cfg.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="flex items-center justify-center"
        >
          {/* Managed by useEffect - React does not reconcile children of this element */}
          <div
            ref={adSlotRef}
            className="flex items-center justify-center overflow-hidden"
            style={{ width: `${cfg.width}px`, minHeight: `${cfg.height}px` }}
          />
        </div>

        {isBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 p-2 text-center backdrop-blur-xs">
            <span className="text-xs font-semibold text-amber">Ad Blocker Detected</span>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              highrevenueformat.com was blocked by your browser extension or Brave Shields.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdsterraMobileBanner(props: Omit<AdsterraBannerProps, "size">) {
  return <AdsterraBanner {...props} size="320x50" />;
}

export function AdsterraLeaderboard(props: Omit<AdsterraBannerProps, "size">) {
  return <AdsterraBanner {...props} size="728x90" />;
}

export default AdsterraBanner;
