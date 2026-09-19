import { z } from "zod";

export interface FileNode {
  name: string;
  type: "folder" | "file";
  id?: string;
  mimeType?: string;
  path?: string;
  children?: FileNode[];
}

// Recursive Zod schema for folder/file tree using z.lazy()
export const FileNodeSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(["folder", "file"]),
    id: z.string().optional(),
    mimeType: z.string().optional(),
    path: z.string().optional(),
    children: z.array(FileNodeSchema).optional(),
  })
);

export const SearchItemSchema = z.object({
  name: z.string(),
  id: z.string(),
  path: z.string(),
});

export const SearchIndexSchema = z.array(SearchItemSchema);

export type SearchItem = z.infer<typeof SearchItemSchema>;

// Helper validation functions
export function validateResourcesData(data: unknown): FileNode {
  return FileNodeSchema.parse(data);
}

export function validateSearchIndex(data: unknown): SearchItem[] {
  return SearchIndexSchema.parse(data);
}
