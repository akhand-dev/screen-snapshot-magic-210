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

function buildAdDoc(cfg: (typeof AD_CONFIGS)["320x50"] | (typeof AD_CONFIGS)["728x90"]) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${cfg.width}px;
        height: ${cfg.height}px;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${cfg.key}',
        'format' : 'iframe',
        'height' : ${cfg.height},
        'width' : ${cfg.width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${cfg.scriptUrl}"></script>
  </body>
</html>`;
}

export function AdsterraBanner({
  className = "",
  showLabel = true,
  size = "auto",
}: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedSize, setResolvedSize] = useState<"320x50" | "728x90">(() => {
    if (size !== "auto") return size;
    if (typeof window !== "undefined" && window.innerWidth < 768) return "320x50";
    return "728x90";
  });
  const [scale, setScale] = useState(1);

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
  const srcDoc = buildAdDoc(cfg);

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
        className="glass-soft flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 p-1.5 shadow-sm transition-all"
        style={{
          width: `${containerWidth}px`,
          maxWidth: "100%",
          height: `${containerHeight}px`,
        }}
      >
        <div
          style={{
            width: `${cfg.width}px`,
            height: `${cfg.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="flex items-center justify-center"
        >
          <iframe
            key={`${cfg.key}-${resolvedSize}`}
            title={`Advertisement ${cfg.width}x${cfg.height}`}
            width={cfg.width}
            height={cfg.height}
            srcDoc={srcDoc}
            className="border-0 overflow-hidden"
            scrolling="no"
          />
        </div>
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
