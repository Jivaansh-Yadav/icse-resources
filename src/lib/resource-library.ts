import type { FileNode } from './schemas';

export interface LibraryFile { name: string; id: string; path: string }
export interface LibraryCategory { name: string; files: LibraryFile[]; count: number }
export interface LibrarySubject {
  name: string;
  slug: string;
  description: string;
  categories: LibraryCategory[];
  count: number;
}

// Retain folder context to distinguish similarly named school/year papers.
export function collectLibraryFiles(node: FileNode, parents: string[] = []): LibraryFile[] {
  if (node.type === 'file') return node.id ? [{ name: node.name, id: node.id, path: parents.join(' / ') }] : [];
  return (node.children || []).flatMap(child => collectLibraryFiles(child, [...parents, node.name]));
}

export function getLibraryCategories(node: FileNode): LibraryCategory[] {
  const children = node.children || [];
  const files = children.filter(child => child.type === 'file').flatMap(child => collectLibraryFiles(child));
  return [
    ...(files.length ? [{ name: 'Notes, guides & question banks', files, count: files.length }] : []),
    ...children.filter(child => child.type === 'folder').map(child => {
      const files = collectLibraryFiles(child);
      return { name: child.name, files, count: files.length };
    }),
  ].filter(category => category.count > 0);
}
