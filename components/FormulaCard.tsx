import React from 'react';
import { FormulaTemplate } from '../types';
import MathRenderer from './MathRenderer';
import { ArrowRight } from 'lucide-react';

interface FormulaCardProps {
  template: FormulaTemplate;
  onClick: (template: FormulaTemplate) => void;
  isSelected?: boolean;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ template, onClick, isSelected }) => {
  return (
    <div 
      onClick={() => onClick(template)}
      className={`
        cursor-pointer rounded-xl p-5 border transition-all duration-300
        hover:shadow-lg hover:border-blue-500/50 hover:bg-slate-800/50
        flex flex-col h-full justify-between group
        ${isSelected 
          ? 'bg-blue-950/30 border-blue-500 shadow-blue-900/20 shadow-md' 
          : 'bg-slate-900 border-slate-700'}
      `}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {template.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">{template.name}</h3>
        <div className="mb-4 text-slate-400 text-sm overflow-hidden text-ellipsis line-clamp-2">
          {template.description}
        </div>
        
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex items-center justify-center min-h-[80px]">
          <MathRenderer latex={template.latex} />
        </div>
      </div>

      <div className="mt-4 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View Template <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default FormulaCard;