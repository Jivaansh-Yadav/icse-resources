import fs from "node:fs";
import path from "node:path";
import { type FileNode, validateResourcesData } from "./schemas";

export interface SubjectSummary {
  name: string;
  fileCount: number;
  path: string;
  icon: string;
  description: string;
}

const SUBJECT_METADATA: Record<string, { icon: string; description: string; slug: string }> = {
  "Biology": {
    icon: "Dna",
    description: "Comprehensive notes, diagrams, chapterwise weightage, and solved sample papers for Class 10 Biology.",
    slug: "biology",
  },
  "Chemistry": {
    icon: "FlaskConical",
    description: "Periodic table trends, chemical bonding, mole concept, organic chemistry, and sample papers.",
    slug: "chemistry",
  },
  "Physics": {
    icon: "Zap",
    description: "Formula sheets, numerical problem guides, diagrams, and sample papers covering light, sound, and electricity.",
    slug: "physics",
  },
  "Maths": {
    icon: "Calculator",
    description: "Selina solutions, Oswal sample papers, formula notes, and 100+ MCQ practice sets.",
    slug: "maths",
  },
  "English": {
    icon: "BookOpen",
    description: "Language composition guides, precis, letters, and literature study materials for Julius Caesar & Treasure Chest.",
    slug: "english",
  },
  "Geography": {
    icon: "Globe",
    description: "Topography map marking guides, climate, soil, mineral resources, and solved papers.",
    slug: "geography",
  },
  "Hindi": {
    icon: "Languages",
    description: "Sahitya Sagar workbooks, chapter summaries, poem explanations, and grammar notes.",
    slug: "hindi",
  },
  "History & Civics": {
    icon: "Landmark",
    description: "Civics cheatsheets, Indian National Movement notes, contemporary world analysis, and sample papers.",
    slug: "history-civics",
  },
  "Commercial Applications": {
    icon: "Briefcase",
    description: "Fundamental commercial concepts, accounting basics, and board examination reference materials.",
    slug: "commercial-applications",
  },
  "Computer Applications": {
    icon: "Code",
    description: "Java OOP concepts, class designs, array handling, string manipulation, and solved programs.",
    slug: "computer-applications",
  },
  "PYQ Prelims": {
    icon: "FileText",
    description: "Extensive archive of over 5,500 preliminary exam papers from top ICSE schools across India.",
    slug: "pyq-prelims",
  },
};

/**
 * Counts total files recursively in a FileNode tree
 */
export function countFiles(node: FileNode): number {
  if (node.type === "file") return 1;
  let count = 0;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countFiles(child);
    }
  }
  return count;
}

function resolveDataPath(filename: string): string {
  const root = process.cwd();
  const filePath = path.resolve(root, "public/data", filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found at ${filePath}. Ensure public/data/${filename} exists.`);
  }
  return filePath;
}

/**
 * Synchronously loads and validates study materials JSON data
 */
export function getStudyMaterialsSync(): FileNode {
  const filePath = resolveDataPath("study-materials.json");
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    return validateResourcesData(json);
  } catch (err: any) {
    throw new Error(`Failed to load or validate study-materials.json: ${err.message}`);
  }
}

/**
 * Asynchronously loads and validates study materials JSON data
 */
export async function getStudyMaterials(): Promise<FileNode> {
  return getStudyMaterialsSync();
}

/**
 * Synchronously loads and validates CISCE resources JSON data
 */
export function getCisceResourcesSync(): FileNode {
  const filePath = resolveDataPath("cisce-resources.json");
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    return validateResourcesData(json);
  } catch (err: any) {
    throw new Error(`Failed to load or validate cisce-resources.json: ${err.message}`);
  }
}

/**
 * Asynchronously loads and validates CISCE resources JSON data
 */
export async function getCisceResources(): Promise<FileNode> {
  return getCisceResourcesSync();
}

/**
 * Extracts all 11 core subjects with file count, icon, path, and description
 */
export function getSubjectSummary(studyMaterials?: FileNode): SubjectSummary[] {
  const materials = studyMaterials ?? getStudyMaterialsSync();
  const folders = (materials.children || []).filter((c) => c.type === "folder");

  const results: SubjectSummary[] = [];

  // Expected 11 subject order
  const targetSubjects = [
    "Biology",
    "Chemistry",
    "Physics",
    "Maths",
    "English",
    "Geography",
    "Hindi",
    "History & Civics",
    "Commercial Applications",
    "Computer Applications",
    "PYQ Prelims",
  ];

  for (const name of targetSubjects) {
    const folder = folders.find((f) => f.name === name);
    const meta = SUBJECT_METADATA[name] || {
      icon: "BookOpen",
      description: `Study materials and notes for ${name}.`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    const fileCount = folder ? countFiles(folder) : 0;

    results.push({
      name,
      fileCount,
      path: `/study-materials#${meta.slug}`,
      icon: meta.icon,
      description: meta.description,
    });
  }

  return results;
}
