So my idea is to build a webwhich will be very simple by the script thatwhen I press the hot key for example out plus onethen it will be triggered the microphone will be triggered automatically it will start listening to my voice and then I press out and one again if you stop recording and then will send this audio to a crock API whisper which will return the transcriptionand it will automatically copy the text to clipboardThat's itGive me the utility functions for this application and let's build them and then build a file that combines everything together so that it works I will provide the grok API with exact model and the API key. for the frontend use the shacn-ui mcp and find the most relevant components that you would need for this app if any and if the platform for development you chose can work with shadcn ui library:

groq api call for transcript - 

import fs from "fs";
import Groq from "groq-sdk";

const groq = new Groq();
async function main() {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream("audio.m4a"),
    model: "whisper-large-v3-turbo",
    temperature: 0,
    response_format: "verbose_json",
  });
  console.log(transcription.text);
}
    

groq api call for simple message and answer from llm -
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "model": "openai/gpt-oss-20b",
  "temperature": 1,
  "max_completion_tokens": 8192,
  "top_p": 1,
  "stream": true,
  "reasoning_effort": "medium",
  "stop": null
});

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

exa quick search and answer:
curl -X POST 'https://api.exa.ai/answer' \
  -H 'x-api-key: YOUR-EXA-API-KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "What is the latest valuation of SpaceX?",
    "text": true
  }'

  the envs are added in the .env file - GROQ_API_KEY and EXA_API_KEY