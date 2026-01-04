import React, { useState, useEffect } from 'react';
import { SavedSnippet } from '../types';
import { getSavedSnippets, deleteSnippet } from '../services/storageService';
import { Trash2, ExternalLink, Calendar, Code2, Database } from 'lucide-react';
import CodeBlock from './CodeBlock';

interface SavedLibraryProps {
  onLoad: (snippet: SavedSnippet) => void;
}

const SavedLibrary: React.FC<SavedLibraryProps> = ({ onLoad }) => {
  const [snippets, setSnippets] = useState<SavedSnippet[]>([]);

  useEffect(() => {
    setSnippets(getSavedSnippets());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved snippet?')) {
      deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" />
          Saved Library
        </h2>
        <p className="text-slate-400 mt-1">Access your previously generated MATLAB codes and configurations.</p>
      </div>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
          <Database className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No saved snippets yet</p>
          <p className="text-sm mt-2">Generate code in Custom Formula or Data Plot to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {snippets.map((snippet) => (
            <div 
              key={snippet.id}
              className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-all shadow-sm hover:shadow-lg hover:shadow-amber-900/10 cursor-pointer flex flex-col"
              onClick={() => onLoad(snippet)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${snippet.type === 'formula' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {snippet.type === 'formula' ? <Code2 className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">{snippet.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {formatDate(snippet.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, snippet.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow mb-4 relative overflow-hidden h-32 rounded bg-slate-950 border border-slate-800">
                <div className="absolute inset-0 p-3 opacity-60 text-xs font-mono text-slate-400 pointer-events-none select-none overflow-hidden">
                  {snippet.code.slice(0, 300)}...
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {snippet.type === 'formula' ? 'Formula Plot' : 'Data Plot'}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-amber-500 group-hover:underline">
                  Load <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedLibrary;
