import React, { useState } from 'react';
import { ViewMode, FormulaTemplate, SavedSnippet } from './types';
import { FORMULA_TEMPLATES } from './constants';
import FormulaCard from './components/FormulaCard';
import CsvInput from './components/CsvInput';
import CustomFormulaInput from './components/CustomFormulaInput';
import SavedLibrary from './components/SavedLibrary';
import CodeBlock from './components/CodeBlock';
import MathRenderer from './components/MathRenderer';
import { LayoutGrid, FileInput, FlaskConical, X, Menu, Github, Calculator, Search, Database } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<FormulaTemplate | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedSnippet, setLoadedSnippet] = useState<SavedSnippet | null>(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const filteredTemplates = FORMULA_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoadSnippet = (snippet: SavedSnippet) => {
    setLoadedSnippet(snippet);
    if (snippet.type === 'formula') {
      setViewMode('custom-formula');
    } else {
      setViewMode('custom-csv');
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedTemplate(null);
    setLoadedSnippet(null); // Clear loaded snippet when manually switching views
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'custom-csv':
        return <CsvInput initialData={loadedSnippet} />;
      case 'custom-formula':
        return <CustomFormulaInput initialData={loadedSnippet} />;
      case 'saved-library':
        return <SavedLibrary onLoad={handleLoadSnippet} />;
      case 'templates':
      default:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Mathematical Models</h1>
                <p className="text-slate-400">Select a standard formula to view its MATLAB implementation.</p>
              </div>

              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-600 shadow-sm"
                />
              </div>
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <FormulaCard
                    key={template.id}
                    template={template}
                    onClick={setSelectedTemplate}
                    isSelected={selectedTemplate?.id === template.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                <p>No templates found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                MatLabviz AI
              </span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <div className="relative group">
                  <button
                    onClick={() => handleViewChange('templates')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'templates' 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <LayoutGrid className="inline-block w-4 h-4 mr-2" />
                    Formula Templates
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                    Browse standard mathematical models
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => handleViewChange('custom-formula')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'custom-formula' 
                        ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Calculator className="inline-block w-4 h-4 mr-2" />
                    Custom Formula
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                    Generate code from your equations
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => handleViewChange('custom-csv')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'custom-csv' 
                        ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FileInput className="inline-block w-4 h-4 mr-2" />
                    Custom Data Plot
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                    Visualize your CSV datasets
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => handleViewChange('saved-library')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'saved-library' 
                        ? 'bg-amber-600/10 text-amber-400 border border-amber-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="inline-block w-4 h-4 mr-2" />
                    Saved Library
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                    Access your saved code snippets
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={toggleMobileMenu} className="p-2 text-slate-400 hover:text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => { handleViewChange('templates'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  viewMode === 'templates' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Formula Templates
              </button>
              <button
                onClick={() => { handleViewChange('custom-formula'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  viewMode === 'custom-formula' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Formula
              </button>
              <button
                onClick={() => { handleViewChange('custom-csv'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  viewMode === 'custom-csv' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Data Plot
              </button>
              <button
                onClick={() => { handleViewChange('saved-library'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  viewMode === 'saved-library' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved Library
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Template Detail Modal */}
      {selectedTemplate && viewMode === 'templates' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
              <div>
                 <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                 <p className="text-slate-400 text-sm mt-1">{selectedTemplate.category}</p>
              </div>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Formula</h3>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center min-h-[120px]">
                    <MathRenderer latex={selectedTemplate.latex} block className="text-2xl" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-2">Description</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div>
                   <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">MATLAB Code</h3>
                   <CodeBlock code={selectedTemplate.matlabCode} language="matlab" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="border-t border-slate-800 py-6 mt-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-500 text-sm">© 2024 MatLabviz AI. Powered by Google Gemini.</p>
           <div className="flex gap-4">
             <Github className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
