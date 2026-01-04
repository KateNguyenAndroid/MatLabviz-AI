import React, { useState, useEffect } from 'react';
import { generateMatlabCode } from '../services/geminiService';
import { saveSnippet } from '../services/storageService';
import { SavedSnippet } from '../types';
import CodeBlock from './CodeBlock';
import { Play, FileText, Loader2, Sparkles, BarChart3, Save } from 'lucide-react';

interface CsvInputProps {
  initialData?: SavedSnippet | null;
}

const CsvInput: React.FC<CsvInputProps> = ({ initialData }) => {
  const [csvData, setCsvData] = useState<string>('');
  const [instruction, setInstruction] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData && initialData.type === 'csv') {
      setCsvData(initialData.data.csvData || '');
      setInstruction(initialData.data.instruction || '');
      setGeneratedCode(initialData.code);
      setSaveName(initialData.name);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    if (!csvData.trim()) return;

    setLoading(true);
    setGeneratedCode(null);
    setIsSaving(false);
    try {
      const code = await generateMatlabCode(csvData, instruction);
      setGeneratedCode(code);
    } catch (error) {
      console.error(error);
      setGeneratedCode("% Error generating code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!generatedCode) return;
    
    if (!isSaving) {
      setIsSaving(true);
      return;
    }

    if (!saveName.trim()) {
      alert("Please enter a name for this snippet.");
      return;
    }

    const snippet: SavedSnippet = {
      id: Date.now().toString(),
      name: saveName,
      type: 'csv',
      code: generatedCode,
      timestamp: Date.now(),
      data: {
        csvData,
        instruction
      }
    };

    saveSnippet(snippet);
    setIsSaving(false);
    setSaveName('');
    alert('Code saved to library!');
  };

  const loadSampleData = () => {
    setCsvData(`Time,Voltage,Current
0,0,0
1,2.5,0.5
2,4.8,0.9
3,6.5,1.2
4,7.8,1.4
5,8.5,1.5
6,8.8,1.55
7,8.5,1.5
8,7.8,1.4
9,6.5,1.2
10,4.8,0.9`);
    setInstruction("Plot Voltage vs Time with red dashed lines, and Current vs Time on a secondary y-axis.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              AI Plot Generator
            </h2>
            <p className="text-slate-400 mt-1">Paste your CSV data and let Gemini write the MATLAB code for you.</p>
          </div>
          <button
            onClick={loadSampleData}
            className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Load sample data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> CSV Data
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste CSV data here...&#10;x,y,z&#10;1,2,3&#10;..."
                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none placeholder-slate-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Plot Instructions (Optional)
              </label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g., Use a logarithmic scale for the y-axis"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder-slate-600"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !csvData.trim()}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                ${loading || !csvData.trim() 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/20'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Code...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Generate MATLAB Code
                </>
              )}
            </button>
          </div>

          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
               <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Generated Script
                </label>
                {generatedCode && (
                  <div className="flex items-center gap-2">
                     {isSaving ? (
                       <div className="flex items-center gap-2 animate-fade-in">
                         <input 
                           type="text" 
                           placeholder="Enter name..." 
                           autoFocus
                           className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500 w-32"
                           value={saveName}
                           onChange={(e) => setSaveName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                         />
                         <button onClick={handleSave} className="text-xs text-purple-400 hover:text-purple-300 font-medium">Confirm</button>
                         <button onClick={() => setIsSaving(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                       </div>
                     ) : (
                       <button 
                        onClick={handleSave}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-400 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save to Library
                      </button>
                     )}
                  </div>
                )}
             </div>
            <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden flex flex-col min-h-[300px]">
              {generatedCode ? (
                <div className="p-1 h-full overflow-auto custom-scrollbar">
                   <CodeBlock code={generatedCode} language="matlab" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center border-2 border-dashed border-slate-800 m-4 rounded-lg">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Generated code will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvInput;
