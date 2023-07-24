import { Configuration, OpenAIApi } from "openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";


const modelName = "gpt-3.5-turbo";
const finetuneModelName = "curie:ft-personal:bjlkengbot-2023-07-12-11-18-23";
const maxTokens = 256;
const numDocsRetrieved = 4;
const temperature = 0.2;
const template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that "I am not programmed to answer that", don't try to make up an answer.  Answer in the first person as Brian Keng.

### Context ###
Your name is Brian Keng.

{context}

### Question ###
Question: {question}
Helpful answer in less than 100 words:`
const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["context", "question"],
});


export default {
  async fetch(request, env, context) {
    const { searchParams, pathname } = new URL(request.url);

    if (pathname !== "/api") {
      return new Response('Unknown API', { status: 400 });
    }

    const query  = searchParams.get('query');
    if (query == null) {
      return new Response('Missing "query" parameter', { status: 400 });
    }

    let model = searchParams.get('model');
    if (model == null) {
      model = 'qa';
    }
    if (!(model === 'qa' || model === 'finetune')) {
      return new Response('Invalid model parameter', { status: 400 });
    }

    if (model == 'qa') {
      // Load the vector store from the JSOn serialized memory vectors
      const r2obj = await env.r2bucket.get(env.DOC_PATH);
      const memoryVectors = await r2obj.json();
      const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings(
        {openAIApiKey: env.OPENAI_API_KEY}
      ));
      vectorStore.memoryVectors = memoryVectors;

      const retriever = vectorStore.asRetriever(numDocsRetrieved);
      const model = new OpenAI({ 
        model: modelName, 
        temperature: temperature, 
        maxTokens: maxTokens, 
        openAIApiKey: env.OPENAI_API_KEY,
      });
      const chain = new RetrievalQAChain( {
          combineDocumentsChain: loadQAStuffChain(model, {prompt: prompt }),
          retriever: retriever,
          returnSourceDocuments: true,
      })

      const res = await chain.call({
        query: query,
      });
      res['query'] = query;

      const json = JSON.stringify(res, null, 2);
      return new Response(json, {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    } else if (model == 'finetune') {
      const configuration = new Configuration({
          apiKey: env.OPENAI_API_KEY,
        baseOptions: {
          adapter: fetchAdapter
        }
      });

      const openai = new OpenAIApi(configuration);
      // Fine tuning structure:
      // - All prompts end with suffix `\n\n###\n\n`
      // - All prompts start with prefix `QUESTION: `
      // - All completions end with suffix ` END`
      const completion = await openai.createCompletion({
          model: finetuneModelName,
          prompt: `QUESTION: ${query}\n\n###\n\n`,
          max_tokens: maxTokens,
          temperature: temperature,
          stop: [" END"],
      });
      const res = {
        'text': completion.data.choices[0].text,
        'query': query
      };
      const json = JSON.stringify(res, null, 2);
      return new Response(json, {
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    }
  },
};