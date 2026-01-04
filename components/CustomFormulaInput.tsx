import React, { useState, useEffect, useRef } from 'react';
import { generateMatlabCodeForFormula } from '../services/geminiService';
import { saveSnippet, saveFormulaDraft, getFormulaDraft } from '../services/storageService';
import { SavedSnippet } from '../types';
import CodeBlock from './CodeBlock';
import { Play, Calculator, Loader2, Sparkles, BarChart3, Info, Rotate3D, BookOpen, AlertCircle, Save, Sliders, Trash2, Cloud, Move } from 'lucide-react';

interface CustomFormulaInputProps {
  initialData?: SavedSnippet | null;
}

const MATH_FUNCTIONS = new Set([
  // Standard functions
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh',
  'exp', 'log', 'log10', 'sqrt', 'cbrt',
  'abs', 'sign', 'floor', 'ceil', 'round', 'fix',
  'mod', 'rem',
  'pi', 'e', 'inf', 'nan', 'i', 'j',
  'x', 'y', 'z', 't', // standard independent variables
  'linspace', 'meshgrid', 'plot', 'surf', 'mesh', 'figure', 'grid', 'hold',
  // LaTeX command keywords to ignore
  'frac', 'text', 'mathrm', 'mathbf', 'mathit', 'mathcal', 'mathbb', 
  'left', 'right', 'big', 'Big', 'bigg', 'Bigg',
  'cdot', 'times', 'div', 'pm', 'mp', 
  'sum', 'prod', 'int', 'oint', 'partial', 'nabla', 'infty',
  'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde', 'check', 'breve',
  'sim', 'approx', 'equiv', 'propto', 'leq', 'geq', 'neq', 'll', 'gg',
  'quad', 'qquad', 'space', 'limits', 'begin', 'end'
]);

const PARAM_DESCRIPTIONS: Record<string, string> = {
  // Greek Letters
  'alpha': 'Alpha / Angular Accel.',
  'beta': 'Beta / Ratio',
  'gamma': 'Gamma / Lorentz Factor',
  'delta': 'Delta / Difference',
  'epsilon': 'Epsilon / Permittivity',
  'zeta': 'Zeta / Damping Ratio',
  'eta': 'Eta / Efficiency',
  'theta': 'Theta / Angle',
  'iota': 'Iota',
  'kappa': 'Kappa / Curvature',
  'lambda': 'Lambda / Wavelength',
  'mu': 'Mu / Mean / Friction',
  'nu': 'Nu / Frequency',
  'xi': 'Xi',
  'omicron': 'Omicron',
  'rho': 'Rho / Density',
  'sigma': 'Sigma / Std Dev / Stress',
  'tau': 'Tau / Time Constant / Torque',
  'upsilon': 'Upsilon',
  'phi': 'Phi / Phase Angle',
  'chi': 'Chi / Susceptibility',
  'psi': 'Psi / Wave Function',
  'omega': 'Omega / Angular Frequency',
  
  // Common Physics/Math Vars
  'A': 'Amplitude / Area',
  'a': 'Acceleration / Coefficient',
  'B': 'Magnetic Field',
  'b': 'Y-intercept / Bias',
  'C': 'Constant / Capacitance',
  'c': 'Speed of Light / Constant',
  'D': 'Diffusion Coeff. / Distance',
  'd': 'Distance / Diameter',
  'E': 'Energy / Electric Field',
  'e': 'Charge / Euler\'s Number',
  'F': 'Force',
  'f': 'Frequency (Hz)',
  'G': 'Gravitational Constant',
  'g': 'Gravity (9.81 m/s²)',
  'H': 'Height / Enthalpy',
  'h': 'Height / Planck Constant',
  'I': 'Current / Inertia',
  'J': 'Current Density / Impulse',
  'K': 'Kinetic Energy / Constant',
  'k': 'Spring Constant / Wave Number',
  'L': 'Length / Inductance',
  'l': 'Length',
  'M': 'Mass / Molar Mass',
  'm': 'Mass / Slope',
  'N': 'Number of Items / Normal Force',
  'n': 'Index / Refractive Index',
  'P': 'Power / Pressure',
  'p': 'Momentum / Pressure',
  'Q': 'Charge / Heat',
  'q': 'Charge',
  'R': 'Radius / Resistance / Gas Const.',
  'r': 'Radius / Distance',
  'S': 'Entropy / Surface Area',
  's': 'Displacement / Seconds',
  'T': 'Period / Temperature / Tension',
  't': 'Time',
  'U': 'Potential Energy',
  'u': 'Velocity / Energy Density',
  'V': 'Voltage / Volume',
  'v': 'Velocity',
  'W': 'Work / Weight',
  'w': 'Width / Angular Frequency',
  'X': 'Position X / Reactance',
  'x': 'Position X',
  'Y': 'Position Y',
  'y': 'Position Y',
  'Z': 'Position Z / Impedance',
  'z': 'Position Z'
};

const getSmartDescription = (param: string): string | null => {
  // 1. Direct match
  if (PARAM_DESCRIPTIONS[param]) return PARAM_DESCRIPTIONS[param];
  
  // 2. Case insensitive match
  const lower = param.toLowerCase();
  if (PARAM_DESCRIPTIONS[lower]) return PARAM_DESCRIPTIONS[lower];

  // 3. Subscript handling (e.g., x0, x_0, x1, v_init, v_max)
  const match = param.match(/^([a-zA-Z]+)(?:_?([0-9a-zA-Z]+))$/);
  
  if (match) {
    const base = match[1];
    const sub = match[2];
    
    // Look up base variable description (even if base is 'x' which is usually excluded from params)
    const baseDesc = PARAM_DESCRIPTIONS[base] || PARAM_DESCRIPTIONS[base.toLowerCase()];
    
    if (baseDesc) {
      // Extract primary meaning (before the first slash)
      const primaryDesc = baseDesc.split(' / ')[0];
      
      const lowerSub = sub.toLowerCase();
      if (['0', 'o', 'init', 'i', 'start'].includes(lowerSub)) {
        return `Initial ${primaryDesc}`;
      }
      if (['f', 'final', 'end'].includes(lowerSub)) {
        return `Final ${primaryDesc}`;
      }
      if (['x', 'y', 'z'].includes(lowerSub)) {
        return `${primaryDesc} (${sub}-axis)`;
      }
      if (['max', 'min', 'avg', 'tot'].includes(lowerSub)) {
        return `${primaryDesc} (${lowerSub})`;
      }
      if (!isNaN(Number(sub))) {
        return `${primaryDesc} ${sub}`;
      }
      
      return `${primaryDesc} (Index ${sub})`;
    }
  }
  
  return null;
};

const validateParameterInput = (value: string): string | null => {
  if (!value || !value.trim()) return "Required";
  
  // Check for characters that often indicate injection or non-math syntax in this context
  if (/[=;%#]/.test(value)) return "Invalid symbol";
  if (/['"]/.test(value)) return "No strings";

  // Check brackets balance
  const openP = (value.match(/\(/g) || []).length;
  const closeP = (value.match(/\)/g) || []).length;
  if (openP !== closeP) return "Unbalanced ( )";

  const openB = (value.match(/\[/g) || []).length;
  const closeB = (value.match(/\]/g) || []).length;
  if (openB !== closeB) return "Unbalanced [ ]";

  return null;
};

const CustomFormulaInput: React.FC<CustomFormulaInputProps> = ({ initialData }) => {
  const [formula, setFormula] = useState<string>('');
  const [instruction, setInstruction] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [enableZoomPan, setEnableZoomPan] = useState(false);
  const [show3DExplanation, setShow3DExplanation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Parameter state
  const [detectedParams, setDetectedParams] = useState<string[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({});

  // Ref to track if the initial load has happened
  const isLoadedRef = useRef(false);

  // Load initial data or draft
  useEffect(() => {
    if (initialData && initialData.type === 'formula') {
      setFormula(initialData.data.formula || '');
      setInstruction(initialData.data.instruction || '');
      setGeneratedCode(initialData.code);
      setIs3D(initialData.data.is3D || false);
      setEnableZoomPan(initialData.data.enableZoomPan || false);
      setSaveName(initialData.name);
      if (initialData.data.paramValues) {
        setParamValues(initialData.data.paramValues);
      }
      if (initialData.data.is3D) setShow3DExplanation(true);
    } else {
      const draft = getFormulaDraft();
      if (draft) {
        setFormula(draft.formula || '');
        setInstruction(draft.instruction || '');
        setGeneratedCode(draft.code || null);
        setIs3D(draft.is3D || false);
        setEnableZoomPan(draft.enableZoomPan || false);
        setSaveName(draft.name || '');
        if (draft.paramValues) {
          setParamValues(draft.paramValues);
        }
        if (draft.is3D) setShow3DExplanation(true);
      }
    }
    isLoadedRef.current = true;
  }, [initialData]);

  // Extract parameters when formula changes
  useEffect(() => {
    if (!formula) {
      setDetectedParams([]);
      return;
    }

    // 1. Identify LHS variable to exclude it
    let lhsVar = null;
    const equalsParts = formula.split('=');
    if (equalsParts.length > 1) {
      const lhs = equalsParts[0].trim();
      // Match simple variable names, possibly with subscripts
      const lhsMatch = lhs.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      if (lhsMatch) {
        lhsVar = lhs;
      }
    }

    // 2. Extract potential variables using regex
    // This regex catches words including those with underscores (e.g. x0, alpha_1)
    // It works well with LaTeX commands like \alpha (returns 'alpha') which is desired for params
    // but might return 'frac' for \frac, which we filter out via MATH_FUNCTIONS.
    const tokens = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    const uniqueTokens: string[] = Array.from(new Set(tokens));
    
    // 3. Filter out standard functions, known vars, and LHS
    const params = uniqueTokens.filter(t => {
      // Basic filter: ignore known functions and LHS
      if (MATH_FUNCTIONS.has(t)) return false;
      if (t === lhsVar) return false;
      
      // Filter out pure underscores or numbers starting identifiers (regex handles numbers start, but check just in case)
      if (/^_+$/.test(t)) return false;
      
      return true;
    });

    setDetectedParams(params.sort());
  }, [formula]);

  // Auto-save effect
  useEffect(() => {
    if (!isLoadedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      saveFormulaDraft({
        formula,
        instruction,
        is3D,
        enableZoomPan,
        paramValues,
        code: generatedCode,
        name: saveName
      });
      
      if (formula || instruction || generatedCode) {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formula, instruction, is3D, enableZoomPan, paramValues, generatedCode, saveName]);

  const validateFormula = (input: string): string | null => {
    // Balanced brackets check
    const stack: string[] = [];
    const pairs: { [key: string]: string } = { '(': ')', '[': ']', '{': '}' };
    
    for (const char of input) {
      if (['(', '[', '{'].includes(char)) {
        stack.push(char);
      } else if ([')', ']', '}'].includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          return `Syntax Error: Unexpected closing bracket '${char}'`;
        }
      }
    }
    
    if (stack.length > 0) {
      return `Syntax Error: Missing closing bracket for '${stack[stack.length - 1]}'`;
    }

    if ((input.match(/=/g) || []).length > 1) {
       return "Syntax Error: Multiple '=' signs found. Only one assignment is allowed.";
    }

    if (/[+\-*/^]\s*$/.test(input)) {
        return "Syntax Error: Formula cannot end with an operator.";
    }

    return null;
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormula(val);
    setValidationError(null);
    setAutoSaved(false);
    
    // Check for variables x, y, z to auto-detect 3D mode
    const hasX = /\bx\b/i.test(val);
    const hasY = /\by\b/i.test(val);
    const hasZ = /\bz\b/i.test(val);
    
    if ((hasX && hasY) || (hasX && hasZ) || (hasY && hasZ)) {
      setIs3D(true);
    }
  };

  const handleParamValueChange = (param: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [param]: value
    }));

    // Validate input
    const error = validateParameterInput(value);
    setParamErrors(prev => {
      const next = { ...prev };
      if (error) next[param] = error;
      else delete next[param];
      return next;
    });

    setAutoSaved(false);
  };

  const handleClear = () => {
    setFormula('');
    setInstruction('');
    setGeneratedCode(null);
    setIs3D(false);
    setEnableZoomPan(false);
    setShow3DExplanation(false);
    setValidationError(null);
    setDetectedParams([]);
    setParamValues({});
    setParamErrors({});
    setSaveName('');
    setIsSaving(false);
    setAutoSaved(false);
  };

  const handleGenerate = async () => {
    if (!formula.trim()) return;

    const error = validateFormula(formula);
    if (error) {
      setValidationError(error);
      return;
    }

    // Validate all parameters are present and correct
    let hasParamErrors = false;
    const newParamErrors: Record<string, string> = {};

    detectedParams.forEach(p => {
        const val = paramValues[p] || '';
        const err = validateParameterInput(val);
        if (err) {
            newParamErrors[p] = err;
            hasParamErrors = true;
        }
    });

    if (hasParamErrors) {
        setParamErrors(newParamErrors);
        return;
    }

    setLoading(true);
    setGeneratedCode(null);
    setShow3DExplanation(false);
    setIsSaving(false);
    
    try {
      const definedParams = detectedParams
        .map(p => `${p} = ${paramValues[p]}`);
      
      let paramInstruction = "";
      if (definedParams.length > 0) {
        paramInstruction = `Define the following parameters variables at the top of the script: ${definedParams.join('; ')}. `;
      }

      const modePrompt = is3D 
        ? "Generate a 3D surface or mesh plot. You MUST use 'meshgrid' to define the domain for the independent variables. Use 'surf', 'mesh', or 'plot3' for visualization. Enable 3D interactivity by adding 'rotate3d on' and 'grid on' at the end of the script." 
        : "";
      
      const zoomPanPrompt = enableZoomPan 
        ? "Enable interactive zooming and panning for the figure. Add 'zoom on' and 'pan on' (or equivalent commands) to the end of the script."
        : "";
      
      const finalInstruction = `${paramInstruction} ${modePrompt} ${zoomPanPrompt} ${instruction}`.trim();

      const code = await generateMatlabCodeForFormula(formula, finalInstruction);
      setGeneratedCode(code);
      
      if (is3D || enableZoomPan) {
        setShow3DExplanation(true);
      }
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

    const relevantParams: Record<string, string> = {};
    detectedParams.forEach(p => {
      if (paramValues[p]) {
        relevantParams[p] = paramValues[p];
      }
    });

    const snippet: SavedSnippet = {
      id: Date.now().toString(),
      name: saveName,
      type: 'formula',
      code: generatedCode,
      timestamp: Date.now(),
      data: {
        formula,
        instruction,
        is3D,
        enableZoomPan,
        paramValues: relevantParams
      }
    };

    saveSnippet(snippet);
    setIsSaving(false);
    setSaveName('');
    alert('Code saved to library!');
  };

  const loadExample = () => {
    setIs3D(false);
    setEnableZoomPan(false);
    setFormula('y = A * e^(-B*x) * cos(omega*x + phi)');
    setInstruction('Plot from x = 0 to 10');
    setParamValues({
      A: '5',
      B: '0.5',
      omega: '2*pi',
      phi: '0'
    });
    setParamErrors({});
    setValidationError(null);
  };

  const load3DExample = () => {
    setIs3D(true);
    setEnableZoomPan(true);
    setFormula('z = A * sin(sqrt(x^2 + y^2)) / sqrt(x^2 + y^2)');
    setInstruction('Use a range of -10 to 10 for both x and y.');
    setParamValues({ A: '10' });
    setParamErrors({});
    setValidationError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              Formula Plotter
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400">Describe a math formula and get the MATLAB code to visualize it.</p>
              {autoSaved && (
                <span className="text-xs text-slate-500 flex items-center gap-1 animate-fade-in">
                  <Cloud className="w-3 h-3" /> Auto-saved
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <button
              onClick={loadExample}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              2D Example
            </button>
            <button
              onClick={load3DExample}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              3D Example
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Formula Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mathematical Formula
              </label>
              <div className="relative">
                <input
                    type="text"
                    value={formula}
                    onChange={handleFormulaChange}
                    placeholder="e.g. z = sin(r)/r"
                    className={`
                      w-full bg-slate-950 border rounded-lg pl-4 pr-4 py-3 text-slate-300 outline-none placeholder-slate-600 font-mono transition-all
                      ${validationError 
                        ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'}
                    `}
                />
              </div>
              
              {validationError && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Supports LaTeX syntax like \alpha, \beta
                </p>
                
                <div className="flex items-center gap-2">
                  <label className={`
                    flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors px-2 py-1.5 rounded border select-none
                    ${enableZoomPan 
                      ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}
                  `}>
                    <input 
                      type="checkbox" 
                      checked={enableZoomPan} 
                      onChange={(e) => setEnableZoomPan(e.target.checked)}
                      className="hidden" 
                    />
                    <Move className="w-3.5 h-3.5" />
                    Interactive Zoom/Pan
                  </label>

                  <label className={`
                    flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors px-2 py-1.5 rounded border select-none
                    ${is3D 
                      ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}
                  `}>
                    <input 
                      type="checkbox" 
                      checked={is3D} 
                      onChange={(e) => setIs3D(e.target.checked)}
                      className="hidden" 
                    />
                    <Rotate3D className="w-3.5 h-3.5" />
                    3D Plotting
                  </label>
                </div>
              </div>
            </div>

            {/* Parameter Inputs */}
            {detectedParams.length > 0 && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 animate-fade-in">
                <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Define Parameters
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {detectedParams.map(param => {
                    const desc = getSmartDescription(param);
                    const error = paramErrors[param];
                    
                    return (
                      <div key={param} className="flex flex-col gap-1">
                        <div className={`
                          group relative flex items-center gap-2 bg-slate-900 border rounded-md px-3 py-2 transition-colors
                          ${error 
                            ? 'border-red-500/50 focus-within:border-red-500/70' 
                            : 'border-slate-700 focus-within:border-emerald-500/50'}
                        `}>
                          <span className="text-emerald-400 font-mono font-medium text-sm">{param} =</span>
                          <input
                            type="text"
                            value={paramValues[param] || ''}
                            onChange={(e) => handleParamValueChange(param, e.target.value)}
                            placeholder="1.0"
                            className="bg-transparent border-none outline-none text-slate-200 text-sm w-full font-mono placeholder-slate-600"
                          />
                          {desc && (
                            <div 
                              className="relative flex-shrink-0"
                              onMouseLeave={() => setActiveTooltip(null)}
                            >
                               <button
                                 type="button"
                                 onClick={() => setActiveTooltip(activeTooltip === param ? null : param)}
                                 onMouseEnter={() => setActiveTooltip(param)}
                                 className={`
                                   transition-colors focus:outline-none flex items-center justify-center
                                   ${error ? 'text-red-400 hover:text-red-300' : 'text-slate-600 hover:text-emerald-400'}
                                 `}
                                 aria-label={`Info for parameter ${param}`}
                               >
                                 {error ? <AlertCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                               </button>
                               
                               {activeTooltip === param && (
                                 <div className="absolute bottom-full right-0 mb-2 w-44 p-3 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-xl z-50 animate-fade-in">
                                    <div className="font-semibold text-emerald-400 mb-1">{param}</div>
                                    <div className="leading-relaxed text-slate-400">{desc}</div>
                                    <div className="absolute bottom-[-5px] right-1.5 w-2.5 h-2.5 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                        {error && <span className="text-[10px] text-red-400 pl-1">{error}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Plot Customization (Optional)
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. Add title, labels, or change colors"
                className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none placeholder-slate-600"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClear}
                disabled={!formula && !instruction && !generatedCode}
                className={`
                  px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border
                  ${!formula && !instruction && !generatedCode
                    ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10'}
                `}
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear All</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading || !formula.trim() || !!validationError || Object.keys(paramErrors).length > 0}
                className={`
                  flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                  ${loading || !formula.trim() || !!validationError || Object.keys(paramErrors).length > 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20'}
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
                           className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 w-32"
                           value={saveName}
                           onChange={(e) => setSaveName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                         />
                         <button onClick={handleSave} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Confirm</button>
                         <button onClick={() => setIsSaving(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                       </div>
                     ) : (
                       <button 
                        onClick={handleSave}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save to Library
                      </button>
                     )}
                  </div>
                )}
             </div>
            <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden flex flex-col min-h-[300px]">
              {generatedCode ? (
                <div className="p-1 h-full overflow-auto custom-scrollbar flex flex-col">
                   <CodeBlock code={generatedCode} language="matlab" />
                   
                   {show3DExplanation && (
                     <div className="mx-4 mb-6 mt-2 p-5 bg-slate-900/50 border border-slate-800 rounded-xl animate-fade-in">
                       <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                         <BookOpen className="w-4 h-4" />
                         Understanding the Code
                       </h4>
                       <div className="space-y-4 text-sm text-slate-300">
                         {is3D && (
                          <>
                           <p className="mb-4 text-slate-400 leading-relaxed">
                             To plot a 3D surface (e.g., <span className="font-mono text-slate-200">z = f(x,y)</span>), MATLAB requires a grid of coordinate points.
                           </p>
                           
                           <div className="flex gap-3">
                             <div className="min-w-[80px]">
                               <code className="text-xs font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-blue-300">meshgrid</code>
                             </div>
                             <p className="leading-relaxed text-slate-400">
                               Expands two 1D vectors into two 2D matrices, representing every coordinate pair in the grid.
                             </p>
                           </div>

                           <div className="flex gap-3">
                             <div className="min-w-[80px]">
                               <code className="text-xs font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-blue-300">surf</code>
                             </div>
                             <p className="leading-relaxed text-slate-400">
                               Renders the colored surface connecting these points. <span className="font-mono text-slate-300">mesh</span> draws only the wireframe.
                             </p>
                           </div>
                          </>
                         )}

                         {enableZoomPan && (
                           <div className="flex gap-3 pt-2 border-t border-slate-800 mt-2">
                             <div className="min-w-[80px]">
                               <code className="text-xs font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-blue-300">zoom/pan</code>
                             </div>
                             <p className="leading-relaxed text-slate-400">
                               Interactive modes are enabled. Use <span className="font-mono text-slate-300">zoom on</span> or <span className="font-mono text-slate-300">pan on</span> in the command window to switch modes if needed.
                             </p>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
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

export default CustomFormulaInput;