import { useEffect, useRef, useState } from "react";

interface AdsterraBannerProps {
  className?: string;
  showLabel?: boolean;
}

export function AdsterraBanner({ className = "", showLabel = true }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        if (availableWidth > 0 && availableWidth < 468) {
          setScale(Math.max(0.65, Math.min(1, availableWidth / 468)));
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adHtml = `<!DOCTYPE html>
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
        width: 468px;
        height: 60px;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'ac00e75518177153b890dd677550d895',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/ac00e75518177153b890dd677550d895/invoke.js"></script>
  </body>
</html>`;

  return (
    <div
      ref={containerRef}
      className={`mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-4 ${className}`}
    >
      {showLabel && (
        <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </span>
      )}
      <div
        className="glass-soft flex items-center justify-center overflow-hidden rounded-2xl border border-border/50 p-1.5 shadow-sm transition-all"
        style={{
          width: scale < 1 ? `${Math.round(468 * scale)}px` : "480px",
          height: scale < 1 ? `${Math.round(60 * scale + 12)}px` : "72px",
        }}
      >
        <div
          style={{
            width: "468px",
            height: "60px",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="flex items-center justify-center"
        >
          <iframe
            title="Advertisement"
            width={468}
            height={60}
            srcDoc={adHtml}
            className="border-0 overflow-hidden"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
}

export default AdsterraBanner;
