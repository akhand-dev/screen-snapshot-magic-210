// Representative MOCK data following the official CBSE academic link schema.
// URLs are illustrative — verify against cbseacademic.nic.in before relying on them.
export type CbsePaper = {
  id: string;
  standard: "10" | "12";
  subject: string;
  year: string;
  type: "Board Paper" | "SQP";
  set?: string;
  paperUrl: string;
  solutionUrl?: string;
};

export const SUBJECTS_BY_CLASS: Record<"10" | "12", string[]> = {
  "10": ["Mathematics (Standard)", "Mathematics (Basic)", "Science", "Social Science", "English (Lang & Lit)", "Hindi (Course A)", "Hindi (Course B)", "Information Technology (402)"],
  "12": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English Core", "Accountancy", "Economics", "Business Studies"],
};

export const YEARS = ["2021", "2022", "2023", "2024", "2025"];

const slug = (s: string) => s.replace(/[^A-Za-z0-9]/g, "");
const BASE = "https://cbseacademic.nic.in/web_material";

function build(): CbsePaper[] {
  const out: CbsePaper[] = [];
  (["10", "12"] as const).forEach((std) => {
    const roman = std === "10" ? "X" : "XII";
    SUBJECTS_BY_CLASS[std].forEach((subject) => {
      YEARS.forEach((year) => {
        const session = `${Number(year) - 1}_${year.slice(2)}`;
        out.push({
          id: `${std}-${slug(subject)}-${year}-sqp`,
          standard: std, subject, year, type: "SQP",
          paperUrl: `${BASE}/SQP/Class${roman}_${session}/${slug(subject)}-SQP.pdf`,
          solutionUrl: `${BASE}/SQP/Class${roman}_${session}/${slug(subject)}-MS.pdf`,
        });
        ["Set 1", "Set 2", "Set 3"].forEach((set, i) => {
          out.push({
            id: `${std}-${slug(subject)}-${year}-set${i + 1}`,
            standard: std, subject, year, type: "Board Paper", set,
            paperUrl: `${BASE}/QuestionPaper/Class${roman}_${year}/${slug(subject)}_Set${i + 1}.pdf`,
            solutionUrl: i < 2 ? `${BASE}/MarkingScheme/Class${roman}_${year}/${slug(subject)}_Set${i + 1}_MS.pdf` : undefined,
          });
        });
      });
    });
  });
  return out;
}

export const CBSE_PAPERS: CbsePaper[] = build();
