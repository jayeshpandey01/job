import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
].filter(Boolean);

let _genAI = null;
let _resolvedModel = null;

export const getGenAI = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured. Default mode requires a Gemini API key.");
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
};

export const getGeminiModel = () => {
  if (_resolvedModel) return getGenAI().getGenerativeModel({ model: _resolvedModel });
  const modelName = DEFAULT_MODELS[0] || "gemini-2.0-flash";
  _resolvedModel = modelName;
  return getGenAI().getGenerativeModel({ model: modelName });
};

export const resetGeminiModelCache = () => {
  _resolvedModel = null;
};

export const resolveWorkingGeminiModel = async () => {
  if (_resolvedModel) return _resolvedModel;

  const candidates = [...new Set(DEFAULT_MODELS)];
  let lastError = null;

  for (const modelName of candidates) {
    try {
      const model = getGenAI().getGenerativeModel({ model: modelName });
      await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 8 },
      });
      _resolvedModel = modelName;
      return modelName;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working Gemini model found");
};
