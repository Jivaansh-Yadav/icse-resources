import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, Clock3, FileText, FolderOpen, Search, X } from 'lucide-react';
import { collectLibraryFiles, getLibraryCategories, type LibraryCategory, type LibraryFile, type LibrarySubject } from '../../lib/resource-library';
import type { FileNode } from '../../lib/schemas';
import './resource-library.css';

const PREVIEW_COUNT = 3;
const PAGE_SIZE = 24;
const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function FileCard({ file }: { file: LibraryFile }) {
  const extension = file.name.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toUpperCase();
  const name = file.name.replace(/\.(pdf|jpe?g|png|docx?|pptx?|xlsx?)$/i, '');
  return <li><a className="library-file" href={`https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`} target="_blank" rel="noopener noreferrer">
    <span className="library-file-icon"><FileText size={18} aria-hidden="true" /></span>
    <span className="library-file-copy"><span className="library-file-name">{name}</span><span className="library-file-meta">{file.path || 'Study resource'} <span aria-hidden="true">·</span> {extension || 'File'}</span></span>
    <span className="library-open">Open <ArrowRight size={14} aria-hidden="true" /></span><span className="sr-only"> (opens in a new tab)</span>
  </a></li>;
}

function FileList({ files, id, count = files.length, loaded = true, preview = PREVIEW_COUNT }: { files: LibraryFile[]; id: string; count?: number; loaded?: boolean; preview?: number }) {
  const [limit, setLimit] = useState(preview);
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const hasMore = limit < count;
  const expanded = limit > preview;
  function showMore() {
    const previousLimit = limit;
    setLimit(limit + PAGE_SIZE);
    requestAnimationFrame(() => listRef.current?.querySelectorAll('a')[previousLimit]?.focus({ preventScroll: true }));
  }
  function showLess() {
    setLimit(preview);
    requestAnimationFrame(() => {
      moreRef.current?.focus({ preventScroll: true });
      listRef.current?.closest('.library-category, .library-results')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  return <div className="library-file-list">
    <ul id={id} ref={listRef} className="library-files">{files.slice(0, limit).map((file, index) => <FileCard key={`${file.id}-${index}`} file={file} />)}</ul>
    {hasMore && <div className={`library-more ${expanded ? 'is-expanded' : ''}`}>
      {!expanded && <div className="library-fade-preview" aria-hidden="true">{files.slice(preview, preview + 2).map((file, index) => <div key={index} className="library-ghost"><FileText size={18} /><span>{file.name}</span><ArrowRight size={14} /></div>)}</div>}
      <button ref={moreRef} type="button" className="library-more-button" disabled={!loaded} aria-controls={id} aria-expanded={expanded} onClick={showMore}>Show more <span>({(count - limit).toLocaleString()} more)</span><ChevronDown size={16} aria-hidden="true" /></button>
    </div>}
    {expanded && <div className="library-list-footer"><span>Showing {Math.min(limit, count).toLocaleString()} of {count.toLocaleString()} files</span><button type="button" onClick={showLess} aria-controls={id}>Show less <ArrowUp size={14} aria-hidden="true" /></button></div>}
  </div>;
}

function Category({ category, index, subject, loaded }: { category: LibraryCategory; index: number; subject: string; loaded: boolean }) {
  return <details className="library-category" open={index === 0}>
    <summary><span className="library-category-icon"><FolderOpen size={18} aria-hidden="true" /></span><h3>{category.name}</h3><span className="library-category-count">{category.count.toLocaleString()} <span>files</span></span><ChevronDown className="library-chevron" size={17} aria-hidden="true" /></summary>
    <FileList files={category.files} count={category.count} loaded={loaded} id={`${subject}-files-${index}`} />
  </details>;
}

export default function ResourceLibrary({ subjects: initialSubjects }: { subjects: LibrarySubject[] }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [grade, setGrade] = useState('10');
  const [activeSlug, setActiveSlug] = useState(initialSubjects[0]?.slug || '');
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSubject = subjects.find(subject => subject.slug === activeSlug) || subjects[0];
  const totalCount = subjects.reduce((sum, subject) => sum + subject.count, 0);
  const isSearching = normalize(query).length > 0;

  useEffect(() => {
    if (['9', '11', '12'].includes(new URLSearchParams(window.location.search).get('class') || '')) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch('/data/study-materials.json', { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Resource library could not be loaded');
      return response.json();
    }).then((materials: FileNode) => {
      if (!Array.isArray(materials.children)) throw new Error('Invalid resource library');
      setSubjects(initialSubjects.map(subject => {
        if (subject.slug === 'featured') {
          const files = materials.children!.filter(child => child.type === 'file').flatMap(child => collectLibraryFiles(child));
          return { ...subject, categories: [{ name: 'Question banks & handbooks', files, count: files.length }] };
        }
        const folder = materials.children!.find(child => child.type === 'folder' && child.name === subject.name);
        return { ...subject, categories: folder ? getLibraryCategories(folder) : [] };
      }));
      setLoaded(true);
    }).catch(error => { if (error.name !== 'AbortError') setLoadError(true); });
    return () => controller.abort();
  }, [initialSubjects, retry]);

  useEffect(() => {
    function syncLocation() {
      const requested = new URLSearchParams(window.location.search).get('class') || '10';
      const nextGrade = ['9', '10', '11', '12'].includes(requested) ? requested : '10';
      setGrade(nextGrade);
      const slug = window.location.hash.slice(1);
      if (initialSubjects.some(subject => subject.slug === slug)) { setActiveSlug(slug); setQuery(''); }
      else if (!slug) { setActiveSlug(initialSubjects[0]?.slug || ''); setQuery(''); }
      document.querySelectorAll<HTMLAnchorElement>('[data-class-link]').forEach(link => {
        if (link.dataset.classLink === nextGrade) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => { window.removeEventListener('popstate', syncLocation); window.removeEventListener('hashchange', syncLocation); };
  }, [initialSubjects]);

  const searchIndex = useMemo(() => subjects.flatMap(subject => subject.categories.flatMap(category => category.files.map(file => ({
    file, subject: subject.name, slug: subject.slug, category: category.name,
    searchable: normalize(`${subject.name} ${category.name} ${file.path} ${file.name}`),
  })))), [subjects]);
  const results = useMemo(() => {
    const terms = normalize(query).split(' ').filter(Boolean);
    return terms.length ? searchIndex.filter(item => (searchScope === 'all' || item.slug === searchScope) && terms.every(term => item.searchable.includes(term))) : [];
  }, [query, searchScope, searchIndex]);

  function chooseSubject(slug: string, scroll = false) {
    setActiveSlug(slug); setQuery(''); setSearchScope('all');
    const url = new URL(window.location.href); url.hash = slug; window.history.pushState(null, '', url);
    if (scroll) requestAnimationFrame(() => contentRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  if (grade !== '10') return <section className="library-placeholder" aria-labelledby="coming-soon-title">
    <span className="library-placeholder-icon"><BookOpen size={32} aria-hidden="true" /></span><span className="library-eyebrow"><Clock3 size={14} aria-hidden="true" /> Coming soon</span>
    <h1 id="coming-soon-title">Class {grade} resources are on the way.</h1><p>This space is reserved for Class {grade} notes, study guides and practice papers. Resources are currently available for Class 10 only.</p>
    <a href="/study-materials?class=10" className="library-primary-link">Explore Class 10 resources <ArrowRight size={16} aria-hidden="true" /></a>
  </section>;

  return <div className="resource-library">
    <header className="library-intro"><div><span className="library-eyebrow"><span className="library-status-dot" /> YOUR CLASS 10 STUDY SPACE</span><h1>Study Materials.<br className="sm:hidden" /> Made simple.</h1><p>Choose a subject, find what you need, and get started. All in one place, all free.</p></div><div className="library-stat"><strong>{totalCount.toLocaleString()}</strong><span>resources to explore</span></div></header>
    <div className="library-search-area">
      <div className="library-search-box"><Search size={21} aria-hidden="true" /><label htmlFor="resource-search" className="sr-only">Search all Class 10 resources</label><input ref={searchRef} id="resource-search" type="search" placeholder="Try “physics formula” or “maths sample paper”…" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={18} /></button>}<span className="library-search-hint">Search all subjects</span></div>
      <div className="library-search-examples"><span>Quick finds</span>{['Formula sheets', 'Sample papers', 'Selina solutions'].map((label, index) => <button key={label} type="button" onClick={() => { setQuery(['formula', 'sample paper', 'selina'][index]); setSearchScope('all'); }}>{label}<ArrowRight size={12} aria-hidden="true" /></button>)}</div>
    </div>
    {!loaded && <div className="library-load-status" role="status">{loadError ? <>The full library couldn’t load. File previews are still available. <button type="button" onClick={() => setRetry(retry + 1)}>Try again</button></> : 'Loading the full library for search and more files…'}</div>}
    <div className="library-layout">
      <aside className="library-sidebar" aria-label="Subject navigation"><div className="library-sidebar-title"><span>CHOOSE A SUBJECT</span><span>{subjects.filter(subject => subject.slug !== 'featured').length}</span></div>
        <div className="library-mobile-selector"><label htmlFor="mobile-subject">Choose a subject</label><select id="mobile-subject" value={activeSlug} onChange={event => chooseSubject(event.target.value, true)}>{subjects.map(subject => <option key={subject.slug} value={subject.slug}>{subject.name} ({subject.count.toLocaleString()})</option>)}</select></div>
        <nav className="library-subjects" aria-label="Class 10 subjects">{subjects.map((subject, index) => <a key={subject.slug} href={`#${subject.slug}`} aria-current={!isSearching && subject.slug === activeSlug ? 'true' : undefined} onClick={event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); chooseSubject(subject.slug, window.innerWidth < 900); }}><span className="library-subject-number">{subject.slug === 'featured' ? '★' : String(index + 1).padStart(2, '0')}</span><span>{subject.name}</span><span className="library-subject-count">{subject.count.toLocaleString()}</span>{!isSearching && subject.slug === activeSlug && <Check size={14} aria-hidden="true" />}</a>)}</nav>
        <div className="library-sidebar-help"><BookOpen size={18} aria-hidden="true" /><strong>New here?</strong><p>Start with your subject’s notes, then try a practice paper.</p><a href="/cisce">Find the official syllabus <ArrowRight size={13} aria-hidden="true" /></a></div>
      </aside>
      <div className="library-content" ref={contentRef}>
        {isSearching ? <section className="library-results" aria-labelledby="search-title">
          <div className="library-content-heading"><div><span className="library-eyebrow">FIND YOUR RESOURCE</span><h2 id="search-title">Search results</h2><p role="status">{loaded ? `${results.length.toLocaleString()} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”` : 'Searching available previews while the full library loads…'}</p></div><button type="button" className="library-text-button" onClick={() => setQuery('')}>Back to subjects <X size={14} aria-hidden="true" /></button></div>
          <div className="library-search-filter"><label htmlFor="search-subject">Subject</label><select id="search-subject" value={searchScope} onChange={event => setSearchScope(event.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject.slug} value={subject.slug}>{subject.name}</option>)}</select></div>
          {results.length ? <FileList key={`${query}-${searchScope}`} id="search-result-files" files={results.map(result => ({ ...result.file, path: `${result.subject} / ${result.file.path || result.category}` }))} preview={12} /> : <div className="library-empty"><Search size={28} aria-hidden="true" /><h3>{loaded ? 'No matching resources yet' : 'The full library is still loading'}</h3><p>{loaded ? 'Try a shorter phrase like “electricity”, check the spelling, or search another subject.' : 'Your search will update when the library is ready.'}</p><button type="button" className="library-more-button" onClick={() => { setSearchScope('all'); setQuery(''); searchRef.current?.focus(); }}>Clear search and start again</button></div>}
        </section> : activeSubject && <section key={activeSubject.slug} id={activeSubject.slug} aria-labelledby="subject-title">
          <div className="library-content-heading"><div><span className="library-eyebrow">CLASS 10 / STUDY MATERIALS</span><h2 id="subject-title">{activeSubject.name}<span>{activeSubject.count.toLocaleString()} resources</span></h2><p>{activeSubject.description}</p></div></div>
          <div className="library-category-help"><span><FolderOpen size={15} aria-hidden="true" /> {activeSubject.categories.length} {activeSubject.categories.length === 1 ? 'category' : 'categories'}</span><span>Open a category to explore its files</span></div>
          <div className="library-categories">{activeSubject.categories.map((category, index) => <Category key={`${activeSubject.slug}-${index}`} category={category} index={index} subject={activeSubject.slug} loaded={loaded} />)}</div>
          {!activeSubject.count && <div className="library-empty"><h3>Resources are being added</h3><p>Choose another subject to keep exploring.</p></div>}
          <div className="library-subject-footer"><span><Check size={14} aria-hidden="true" /> Free to access. No sign-up needed.</span><a href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a></div>
        </section>}
        <div className="library-next-step"><div><span className="library-eyebrow">READY FOR THE NEXT STEP?</span><h3>Put your preparation into practice.</h3></div><a href="/quizzes">Try a quiz <ArrowRight size={16} aria-hidden="true" /></a></div>
      </div>
    </div>
  </div>;
}
