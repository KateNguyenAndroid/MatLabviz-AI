import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractCode = (text: string | undefined): string => {
  if (!text) return "% Error: No response generated from AI.";
  
  // Clean up markdown tags if present to just get the code
  const codeMatch = text.match(/```matlab([\s\S]*?)```/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }
  
  // Fallback if generic code block
  const genericCodeMatch = text.match(/```([\s\S]*?)```/);
  if (genericCodeMatch && genericCodeMatch[1]) {
    return genericCodeMatch[1].trim();
  }

  return text;
};

export const generateMatlabCode = async (csvData: string, userInstruction: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    You are an expert MATLAB programmer.
    
    Task: Generate a complete, runnable MATLAB script to plot the CSV data provided below.
    
    User Instruction: ${userInstruction || "Plot this data appropriately."}
    
    CSV Data (First 20 lines preview):
    ${csvData.split('\n').slice(0, 20).join('\n')}
    
    Requirements:
    1. If the CSV is small (less than 20 rows), define the arrays directly in the MATLAB code variable.
    2. If the CSV is large, assume the file is named 'data.csv' and use 'readtable' or 'csvread'.
    3. Add clear comments explaining the code.
    4. Use 'grid on', 'title', 'xlabel', and 'ylabel' to make the plot professional.
    5. Return ONLY the MATLAB code within a markdown code block (e.g., \`\`\`matlab ... \`\`\`).
    6. Do not wrap the output in any other text outside the code block if possible, or keep the explanation very brief after the code.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return extractCode(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `% Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const generateMatlabCodeForFormula = async (formula: string, additionalInstructions: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `
    You are an expert MATLAB programmer.
    
    Task: Generate a complete, runnable MATLAB script to plot the following mathematical formula.
    
    Formula Input: "${formula}"
    Additional Instructions: "${additionalInstructions}"
    
    Requirements:
    1. Define an appropriate range for the independent variable(s) (e.g., x = linspace(...)) to show the interesting part of the curve.
    2. Implement the formula correctly using MATLAB syntax (use element-wise operations like .* and .^ where necessary).
    3. Add clear comments.
    4. Use 'grid on', 'title', 'xlabel', and 'ylabel'.
    5. Return ONLY the MATLAB code within a markdown code block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return extractCode(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `% Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};