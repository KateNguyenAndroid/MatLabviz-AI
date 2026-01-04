
export interface FormulaTemplate {
  id: string;
  name: string;
  latex: string;
  description: string;
  matlabCode: string;
  category: 'Algebra' | 'Calculus' | 'Statistics' | 'Physics';
}

export type ViewMode = 'templates' | 'custom-csv' | 'custom-formula' | 'saved-library';

export interface GeneratedCodeResponse {
  code: string;
  explanation: string;
}

export interface SavedSnippet {
  id: string;
  name: string;
  type: 'formula' | 'csv';
  code: string;
  timestamp: number;
  data: {
    formula?: string;
    csvData?: string;
    instruction?: string;
    is3D?: boolean;
    enableZoomPan?: boolean;
    paramValues?: Record<string, string>;
  };
}