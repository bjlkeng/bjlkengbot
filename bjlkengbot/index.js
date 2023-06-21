import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";

const chunkSize = 1000;
const embeddingModelName = 'text-embedding-ada-002';
const modelName = "gpt-3.5-turbo";
const maxTokens = 256;
const numDocsRetrieved = 4;
const temperature = 0.2;
const template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that "I am not programmed to answer that", don't try to make up an answer.

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

    if (pathname !== "/bjlkengbot") {
      return new Response('Unknown API', { status: 400 });
    }

    const query  = searchParams.get('query');
    if (query == null) {
      return new Response('Missing "query" parameter', { status: 400 });
    }

    // Re-index all documents every call because there's not easy way to load an
    // index from the filesystem using Workers (and I didn't want to setup a
    // separate database)
    const r2obj = await env.r2bucket.get(env.DOC_PATH);
    const docs = await r2obj.json();
    const embeddingModel = new OpenAIEmbeddings({ 
      model: embeddingModelName, 
      chunkSize: chunkSize,
      openAIApiKey: env.OPENAI_API_KEY,
    });
    const vectorStore = await MemoryVectorStore.fromTexts(
      docs.map(d => d.content),
      docs.map(d => d.metadata),
      embeddingModel,
    );

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
  },
};