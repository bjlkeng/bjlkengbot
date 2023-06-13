import { FaissStore } from "langchain/vectorstores/faiss";
import { JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { assert } from "console";

const jsonl_filename = "../crawler/briankeng-split-2023-06-12.jsonl";
const index_filename = "index.faiss";
const chunkSize = 1000;
const chunkOverlap = 100;
const modelName = "text-davinci-003";
const embeddingModelName = 'text-embedding-ada-002';
const maxTokens = 256;

// Assume docs are already pre-split (since langchainjs doesn't have tiktoken tokenizer yet)
const loader = new JSONLinesLoader(jsonl_filename, "/content");
const docs = await loader.load();

// Brute force load meta data because jsonl loader doesn't support extracting multiple fields
const urlLoader = new JSONLinesLoader(jsonl_filename, "/url");
const urlDocs = await urlLoader.load();
const titleLoader = new JSONLinesLoader(jsonl_filename, "/title");
const titleDocs = await titleLoader.load();

assert(docs.length == urlDocs.length, "docs and urlDocs must be the same length");
assert(docs.length == titleDocs.length, "docs and titleDocs must be the same length");

// add url metadata to docs
for (let i = 0; i < docs.length; i++) {
    docs[i].metadata["url"] = urlDocs[i].pageContent;
    docs[i].metadata["title"] = titleDocs[i].pageContent;
}

console.log(docs)

const embeddingModel = new OpenAIEmbeddings({ model: embeddingModelName, chunkSize: chunkSize });
const vectorStore = await FaissStore.fromDocuments(docs, embeddingModel);

await vectorStore.save(index_filename);