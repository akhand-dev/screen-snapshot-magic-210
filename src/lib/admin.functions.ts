import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";

// Passcode is checked on the server so unauthorized users cannot write directly.
function checkPass(pass: string) {
  const expected = process.env["ADMIN_PASSCODE"] || "admin123";
  if (pass !== expected) throw new Error("Wrong passcode");
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { pass: string }) => d)
  .handler(async ({ data }) => {
    checkPass(data.pass);
    return { ok: true };
  });

type NewPaper = {
  pass: string;
  standard: "10" | "12";
  subject: string;
  year: string;
  paper_type: "Board Paper" | "SQP";
  set_number: string;
  paper_url: string;
  solution_url: string;
};

const isUrl = (u: string) => /^https?:\/\/\S+$/i.test(u);

export const addPaper = createServerFn({ method: "POST" })
  .inputValidator((d: NewPaper) => {
    if (!["10", "12"].includes(d.standard)) throw new Error("Invalid class");
    if (!["Board Paper", "SQP"].includes(d.paper_type)) throw new Error("Invalid type");
    if (!d.subject.trim() || d.subject.length > 100) throw new Error("Subject required");
    if (!/^\d{4}$/.test(d.year.trim())) throw new Error("Year must be 4 digits");
    if (!isUrl(d.paper_url.trim())) throw new Error("Paper URL must start with http(s)://");
    if (d.solution_url.trim() && !isUrl(d.solution_url.trim()))
      throw new Error("Solution URL invalid");
    return d;
  })
  .handler(async ({ data }) => {
    checkPass(data.pass);
    const docRef = await addDoc(collection(db, "cbse_pyqs"), {
      standard: data.standard,
      subject: data.subject.trim(),
      year: data.year.trim(),
      paper_type: data.paper_type,
      set_number: data.set_number.trim() || null,
      paper_url: data.paper_url.trim(),
      solution_url: data.solution_url.trim() || null,
      created_at: new Date().toISOString(),
    });
    return { ok: true, id: docRef.id };
  });

export const deletePaper = createServerFn({ method: "POST" })
  .inputValidator((d: { pass: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPass(data.pass);
    await deleteDoc(doc(db, "cbse_pyqs", data.id));
    return { ok: true };
  });
