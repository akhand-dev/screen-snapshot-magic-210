import { useState, useEffect } from "react";
import { RefreshCw, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

interface AdsterraProps {
  className?: string;
  showLabel?: boolean;
}

const AD_KEY_728X90 = "24db24ac52baa4d83feb7aababed142e";
export const ADSTERRA_SMARTLINK =
  "https://www.profitableratecpmnetwork.com/t620i6dj6?key=f65901695c6f7334caa27dd74eb11c9c";

/**
 * Adsterra 728x90 Leaderboard Banner
 * Embeds /ad-728x90.html hosted directly on topit.akhand2152.workers.dev.
 * This guarantees:
 * 1. window.location.hostname matches 'topit.akhand2152.workers.dev' (no 'about:srcdoc' empty string).
 * 2. Adsterra verifies and approves the request against your Active website dashboard.
 * 3. document.currentScript is natively defined for invoke.js.
 */
export function AdsterraLeaderboard({ className = "", showLabel = false }: AdsterraProps) {
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [isAdBlockerActive, setIsAdBlockerActive] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    // 1. Detect if an ad-blocker extension is filtering ad elements in the browser
    const bait = document.createElement("div");
    bait.className = "adsbox pub_300x250 ad-placement ad-banner textads banner-ads banner_ads";
    bait.style.cssText = "position:absolute;top:-999px;left:-999px;width:1px;height:1px;";
    document.body.appendChild(bait);
    const isBaitHidden =
      window.getComputedStyle(bait).display === "none" ||
      bait.offsetParent === null ||
      bait.offsetHeight === 0;
    document.body.removeChild(bait);

    if (isBaitHidden) {
      setIsAdBlockerActive(true);
    }

    // 2. Listen for ad-loaded event from the static /ad-728x90.html iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "adsterra-loaded") {
        setAdLoaded(true);
      }
    };
    window.addEventListener("message", handleMessage);

    // 3. Network reachability test
    fetch(`https://www.highrevenueformat.com/${AD_KEY_728X90}/invoke.js`, {
      mode: "no-cors",
      cache: "no-store",
    }).catch(() => {
      setIsAdBlockerActive(true);
    });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setIsAdBlockerActive(false);
    setAdLoaded(false);
    setReloadKey((k) => k + 1);
  };

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
          maxWidth: "100%",
          minHeight: "90px",
          margin: "0 auto",
        }}
        className="relative flex items-center justify-center overflow-hidden"
      >
        {/* Real static iframe hosted on topit.akhand2152.workers.dev */}
        <iframe
          key={reloadKey}
          title="Adsterra Leaderboard (728x90)"
          src={`/ad-728x90?v=${reloadKey}`}
          width="728"
          height="90"
          style={{
            border: "0",
            width: "728px",
            height: "90px",
            minWidth: "728px",
            minHeight: "90px",
            overflow: "hidden",
            display: "block",
            background: "transparent",
          }}
          scrolling="no"
        />

        {/* Diagnostic helper only shown if ad blocker actively prevents ads */}
        {isAdBlockerActive && !adLoaded && (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground backdrop-blur-md shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <span className="font-semibold text-foreground">
                    Ad Blocker Detected in Browser
                  </span>
                  <span className="mx-2 text-muted-foreground/60">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    An extension (uBlock, AdBlock, or Brave Shields) is defusing ad scripts.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1 rounded-lg bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-secondary transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 rounded-lg border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:bg-background/50 transition-colors"
                >
                  Details
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="mt-2.5 rounded-lg border border-border/40 bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>
                    <strong className="text-foreground">Ad Key:</strong> {AD_KEY_728X90}
                  </div>
                  <div>
                    <strong className="text-foreground">Host Domain:</strong>{" "}
                    topit.akhand2152.workers.dev
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="text-foreground">Dashboard Status:</strong> Approved &amp;
                    Active (ID: 31778106)
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                  <strong>Resolution:</strong> In your browser toolbar, click the extension icon
                  (e.g. uBlock Origin red shield) and turn it OFF for this site.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type AdSize = "auto" | "320x50" | "728x90";

interface AdsterraBannerProps extends AdsterraProps {
  size?: AdSize;
}

export function AdsterraBanner({ className = "", showLabel = false }: AdsterraBannerProps) {
  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`}>
      <AdsterraLeaderboard showLabel={showLabel} />
    </div>
  );
}

export default AdsterraBanner;
