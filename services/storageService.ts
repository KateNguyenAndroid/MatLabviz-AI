import { SavedSnippet } from '../types';

const STORAGE_KEY = 'matlabviz_saved_snippets';
const DRAFT_KEY = 'matlabviz_formula_draft';

export const getSavedSnippets = (): SavedSnippet[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading from local storage', e);
    return [];
  }
};

export const saveSnippet = (snippet: SavedSnippet): void => {
  const snippets = getSavedSnippets();
  const newSnippets = [snippet, ...snippets];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnippets));
};

export const deleteSnippet = (id: string): void => {
  const snippets = getSavedSnippets();
  const newSnippets = snippets.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnippets));
};

export const saveFormulaDraft = (data: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
};

export const getFormulaDraft = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading draft from local storage', e);
    return null;
  }
};
