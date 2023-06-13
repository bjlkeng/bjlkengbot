import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const jsonl_filename = "../crawler/briankeng-split-2023-06-09.jsonl";
const index_filename = "index.faiss";
const chunkSize = 1000;
const chunkOverlap = 100;
const modelName = "text-davinci-003";
const embeddingModelName = 'text-embedding-ada-002';
const maxTokens = 256;
const numDocsRetrieved = 4;

// Load the vector store from the same directory
const loadedVectorStore = await FaissStore.load(
    index_filename,
    new OpenAIEmbeddings()
);

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
    query: "What is your age?",
});
console.log(res);
for (let i = 0; i < res.sourceDocuments.length; i++) {
    console.log(res.sourceDocuments[i].metadata);
}