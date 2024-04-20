
module.exports = function geminiHandlers(socket, io, rooms) {

  const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const generationConfig = {
    maxOutputTokens: 300,
    temperature: 0.9,
    topP: 1,
    topK: 1,
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

  socket.on("send_prompt", async (userName, prompt, character) => {
    try {
      const context = `Translate the text after PROMPT into dialogue that a ${character} would say. Do not add any quotation marks around your response. 
                      If you cannot translate it, make up dialogue that a ${character} can say instead in a similar context. Do not say you cannot generate a response, make something up. Keep
                      trying until a proper response can be generated. PROMPT: ` + prompt;
      console.log(context);
      const result = await model.generateContent(context, safetySettings);
      const response = await result.response;
      const text = response.text();
      console.log(text);
      socket.emit("fetch_response", userName, text);

    } catch (error) {
      console.log("error");

      socket.emit('errorCatcher', "Failed to generate AI response.");
    }
  });
};
