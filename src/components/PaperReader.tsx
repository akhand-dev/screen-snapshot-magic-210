import { useEffect, useState } from "react";

export type ReaderPaper = {
  standard: string;
  subject: string;
  year: string;
  set?: string | undefined;
  paperUrl: string;
  solutionUrl?: string | undefined;
};

export function PaperReader({
  paper,
  initial = "paper",
  onClose,
}: {
  paper: ReaderPaper;
  initial?: "paper" | "solution";
  onClose: () => void;
}) {
  const [mode, setMode] = useState(initial);
  const url = mode === "solution" && paper.solutionUrl ? paper.solutionUrl : paper.paperUrl;
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const tab = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-xs font-semibold ${on ? "bg-brand text-on-brand" : "hover:bg-accent"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-5xl flex-col gap-3 rounded-3xl bg-background p-4 shadow-2xl"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-auto font-semibold">
            Class {paper.standard} · {paper.subject} · {paper.year}
            {paper.set ? ` · ${paper.set}` : ""}
          </p>
          {paper.solutionUrl && (
            <div className="glass-soft flex rounded-full p-1">
              <button className={tab(mode === "paper")} onClick={() => setMode("paper")}>
                Question Paper
              </button>
              <button className={tab(mode === "solution")} onClick={() => setMode("solution")}>
                Marking Scheme
              </button>
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-soft rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            ↗ Open in New Tab
          </a>
          <button
            onClick={onClose}
            className="glass-soft rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            ✕ Close Modal
          </button>
        </div>
        <iframe
          key={url}
          src={url}
          className="h-[80vh] w-full rounded-lg border-0 bg-muted"
          allow="autoplay"
          title={paper.subject}
        />
      </div>
    </div>
  );
}
