import { Configuration, OpenAIApi } from "openai";

const finetuneModelName = "curie:ft-personal:bjlkengbot-2023-07-12-11-18-23";
const maxTokens = 256;
const temperature = 0.2;

const query = "What's your experience at Rotman?"
 
console.log("1");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
console.log("2");
const openai = new OpenAIApi(configuration);
// Fine tuning structure:
// - All prompts end with suffix `\n\n###\n\n`
// - All prompts start with prefix `QUESTION: `
// - All completions end with suffix ` END`
console.log("3");
const completion = await openai.createCompletion({
    model: finetuneModelName,
    prompt: `QUESTION: ${query}\n\n###\n\n`,
    max_tokens: maxTokens,
    temperature: temperature,
    stop: [" END"],
});
console.log(completion.data);
const res = {
  'completion': completion.data.choices[0].text,
  'query': query
};
console.log("5");
const json = JSON.stringify(res, null, 2);
console.log(json);
