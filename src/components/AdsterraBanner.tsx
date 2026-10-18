import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AdsterraProps {
  className?: string;
  showLabel?: boolean;
}

const AD_KEY_728X90 = "24db24ac52baa4d83feb7aababed142e";
const AD_URL_728X90 = `https://www.highrevenueformat.com/${AD_KEY_728X90}/invoke.js`;

/**
 * Builds the isolated HTML document for the Adsterra iframe.
 * Includes messaging hooks to report success, script blocking, or empty delivery.
 */
function getAdHtml(key: string, width: number, height: number, url: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
    }
  </style>
  <script>
    // Capture script blocking or network errors inside iframe
    window.addEventListener('error', function(e) {
      if (e.target && e.target.tagName === 'SCRIPT') {
        window.parent.postMessage({
          type: 'adsterra-status',
          key: '${key}',
          status: 'blocked',
          details: 'Script URL was blocked by browser extension, ad blocker, or DNS filter.'
        }, '*');
      }
    }, true);
  </script>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="${url}" onload="checkAdRender()"></script>
  <script>
    function checkAdRender() {
      // Check after 2.5s if Adsterra injected the creative iframe
      setTimeout(function() {
        var iframes = document.querySelectorAll('iframe');
        var images = document.querySelectorAll('img');
        var links = document.querySelectorAll('a');
        if (iframes.length > 0 || images.length > 0 || links.length > 0) {
          window.parent.postMessage({
            type: 'adsterra-status',
            key: '${key}',
            status: 'rendered',
            details: 'Ad creative rendered successfully.'
          }, '*');
        } else {
          window.parent.postMessage({
            type: 'adsterra-status',
            key: '${key}',
            status: 'empty',
            details: 'Adsterra script executed, but returned an empty ad or 403 Forbidden. (Check if domain is approved in Adsterra dashboard).'
          }, '*');
        }
      }, 2500);
    }

    // Safety timeout in case onload never fires
    setTimeout(function() {
      var iframes = document.querySelectorAll('iframe');
      if (iframes.length === 0) {
        window.parent.postMessage({
          type: 'adsterra-status',
          key: '${key}',
          status: 'empty_timeout',
          details: 'Ad delivery timed out. Adsterra server did not return creative content.'
        }, '*');
      }
    }, 4500);
  </script>
</body>
</html>`;
}

type AdStatus = "probing" | "rendered" | "blocked" | "empty" | "empty_timeout";

/**
 * Adsterra 728x90 Leaderboard Banner with Live Diagnostic Error Display
 */
export function AdsterraLeaderboard({ className = "", showLabel = false }: AdsterraProps) {
  const [adStatus, setAdStatus] = useState<AdStatus>("probing");
  const [statusMessage, setStatusMessage] = useState<string>("Initializing ad unit...");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Probe network accessibility for Adsterra domain
  useEffect(() => {
    let isMounted = true;

    // Listen for iframe health reports
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "adsterra-status" && event.data?.key === AD_KEY_728X90) {
        if (!isMounted) return;
        const newStatus = event.data.status as AdStatus;
        setAdStatus(newStatus);
        setStatusMessage(event.data.details || "");
      }
    };

    window.addEventListener("message", handleMessage);

    // Initial pre-flight check to test if client blocks highrevenueformat.com
    fetch(AD_URL_728X90, { mode: "no-cors", cache: "no-store" }).catch((err) => {
      if (!isMounted) return;
      setAdStatus("blocked");
      setStatusMessage(
        `Network fetch blocked: ${err?.message || "ERR_BLOCKED_BY_CLIENT"}. An ad-blocker or browser shield is preventing connection to Adsterra.`,
      );
    });

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setAdStatus("probing");
    setStatusMessage("Retrying ad delivery...");
    setReloadKey((prev) => prev + 1);
  };

  const isFailed = adStatus === "blocked" || adStatus === "empty" || adStatus === "empty_timeout";

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      {showLabel && (
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Advertisement
        </span>
      )}

      {/* Main 728x90 ad container */}
      <div
        ref={containerRef}
        style={{
          width: "728px",
          maxWidth: "100%",
          minHeight: "90px",
          margin: "0 auto",
        }}
        className="relative flex items-center justify-center overflow-hidden"
      >
        {/* Isolated Adsterra iframe */}
        <iframe
          key={reloadKey}
          title="Adsterra 728x90"
          width="728"
          height="90"
          style={{
            border: "0",
            width: "728px",
            height: "90px",
            minWidth: "728px",
            minHeight: "90px",
            overflow: "hidden",
            display: isFailed ? "none" : "block",
            background: "transparent",
          }}
          scrolling="no"
          srcDoc={getAdHtml(AD_KEY_728X90, 728, 90, AD_URL_728X90)}
        />

        {/* Diagnostic Panel displayed ONLY if ad fails to load */}
        {isFailed && (
          <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground backdrop-blur-md shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {adStatus === "blocked" ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div>
                  <span className="font-semibold text-foreground">
                    {adStatus === "blocked"
                      ? "Ad Blocked by Client/Browser"
                      : "No Ad Delivered by Adsterra"}
                  </span>
                  <span className="mx-2 text-muted-foreground/60">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {adStatus === "blocked"
                      ? "uBlock, AdBlock, or Brave Shields is blocking highrevenueformat.com"
                      : "Domain may still be 'Pending' approval in Adsterra Dashboard"}
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

            {/* Expandable Technical Details */}
            {showDetails && (
              <div className="mt-2.5 rounded-lg border border-border/40 bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>
                    <strong className="text-foreground">Ad Key:</strong> {AD_KEY_728X90}
                  </div>
                  <div>
                    <strong className="text-foreground">Current URL:</strong>{" "}
                    {typeof window !== "undefined"
                      ? window.location.hostname
                      : "topit.akhand2152.workers.dev"}
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="text-foreground">Diagnostic Status:</strong> {statusMessage}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                  <strong>Resolution:</strong>{" "}
                  {adStatus === "blocked"
                    ? "Turn off ad blocker or whitelist topit.akhand2152.workers.dev to allow ad scripts to execute."
                    : "Verify in your Adsterra dashboard (Websites tab) that 'topit.akhand2152.workers.dev' is marked 'Active' (green). New placements take 15–30 min to activate."}
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

/**
 * Responsive Adsterra Banner
 */
export function AdsterraBanner({ className = "", showLabel = false }: AdsterraBannerProps) {
  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`}>
      <AdsterraLeaderboard showLabel={showLabel} />
    </div>
  );
}

export default AdsterraBanner;
