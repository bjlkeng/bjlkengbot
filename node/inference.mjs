import fs from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const index_filename = "index_vectors.json";
const modelName = "gpt-3.5-turbo";
const maxTokens = 256;
const numDocsRetrieved = 4;

// Load the vector store from the same directory
const loadedVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
const memoryVectors = JSON.parse(fs.readFileSync(index_filename, 'utf8'));
loadedVectorStore.memoryVectors = memoryVectors;

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

const retriever = loadedVectorStore.asRetriever(numDocsRetrieved);
const model = new OpenAI({ model: modelName, temperature: 0.2, maxTokens: maxTokens, });
const chain = new RetrievalQAChain( {
    combineDocumentsChain: loadQAStuffChain(model, {prompt: prompt }),
    retriever: retriever,
    returnSourceDocuments: true,
})

const res = await chain.call({
    query: "What are your dislikes?",
});
console.log(res);
for (let i = 0; i < res.sourceDocuments.length; i++) {
    console.log(res.sourceDocuments[i].metadata);
}