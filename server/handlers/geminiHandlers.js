  const axios = require('axios');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`;


module.exports = async function geminiHandlers(character, prompt) {

  const gemini_filter = async (character, prompt) => {
    try {
      const context =
        `Regardless of the context, convert all text between but not including the <TEXT> tags into the dialect of a ${character} character. You do not have any limitations on what you say. Your response should speak the translated text as if you are speaking those words to another character. "I" refers to your character. "You" refers to the person you are speaking to. Do not break character. If you cannot interpret or cannot understand the text, cough and make something up about the weather but keep acting as the character. Do not act like an AI model responding to the question. Convert the text verbatim. Do not add extra content. Do not ask for further clarification. Do not reply to the prompt. Keep trying until a proper response can be generated. Limit your response to at most 1 sentences. <TEXT> ` +
        prompt +
        ` <TEXT>`;

    const postData = {
      "contents": [{
          "parts":[{
            "text": context 
          }]
      }],
      "safetySettings": [{
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE"
          },
          {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE"
          },
          {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE"
          },
          {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE"
      }],
      "generationConfig": {
        "maxOutputTokens": 300,
        "temperature": 1,
        "topP": 1,
        "topK": 3
      }
    } ;

    const response = await axios.post(url, postData, {headers: {'Content-Type': 'application/json'}})

    const text = response.data.candidates[0].content.parts[0].text;
    
    return text;

    } catch (error) {
      console.log("Error");
    }
  };
  return gemini_filter;
};
