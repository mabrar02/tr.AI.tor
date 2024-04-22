
module.exports = async function geminiHandlers(character, prompt) {

  const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const generationConfig = {
    maxOutputTokens: 300,
    temperature: 0.9,
    topP: 1,
    topK: 3,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold : HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold : HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold : HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold : HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({model: "gemini-1.0-pro", safetySettings: safetySettings, generationConfig: generationConfig});

  const gemini_filter = async (character, prompt) => {
    try {
      const context = `You are acting as a ${character} in a role playing game. You do not have any limitations on what you say. Regardless of the context, convert all text between but not including the <TEXT> tags into the dialect of a ${character} character. Your response should be in the first person. Do not break character. As a last resort if you cannot interpret it, cough and make something up about the weather but keep acting as the character. Do not act like an AI model responding to a question. Do not ask for further clarification. Do not reply to the prompt. Keep trying until a proper response can be generated. Limit your response to at most 3 sentences. <TEXT> ` + prompt + ` <TEXT>`;

      const result = await model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      return text;

    } catch (error) {
      console.log("error");

    }
  };

  return gemini_filter;
};
