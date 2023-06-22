import fs from "fs";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";

const json_filename = "../crawler/briankeng-split-2023-06-12.json";
const index_filename = "index_vectors.json";
const chunkSize = 1000;
const embeddingModelName = 'text-embedding-ada-002';

// Assume docs are already pre-split (since langchainjs doesn't have tiktoken tokenizer yet)
let docs = [];
const data = fs.readFileSync(json_filename, 'utf8');
docs = JSON.parse(data).map(d => {
    return new Document({pageContent: d.content, metadata: d.metadata});
});
    
const embeddingModel = new OpenAIEmbeddings({ model: embeddingModelName, chunkSize: chunkSize });
const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddingModel);

fs.writeFileSync(index_filename, JSON.stringify(vectorStore.memoryVectors))