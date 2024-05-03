  const axios = require('axios');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`;


module.exports = async function geminiHandlers(character, prompt) {

  const gemini_filter = async (character, prompt) => {
    try {
      const context =
        `You are acting as a ${character} in a role playing game. Your response should translate all text after the end of this paragraph into the dialect of a ${character} character. Respond as the character speaking the translated text. Do not break character. Do not respond to the this part of the message. If you cannot interpret or cannot understand the text, cough and make something up about the weather but keep acting as the character. Do not act like an AI model responding to a question. Do not ask for further clarification. Keep trying until a proper response can be generated. Limit your response to 2 sentences: \n\n` + prompt ;

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
        "temperature": 0.9,
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
