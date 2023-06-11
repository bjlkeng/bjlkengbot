import { FaissStore } from "langchain/vectorstores/faiss";
import { JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { assert } from "console";

const jsonl_filename = "../crawler/briankeng-split-2023-06-09.jsonl";
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


//const template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
//{context}
//
//Question: {question}
//Helpful answer in less than 50 words:`
//
//const prompt = new PromptTemplate({
//  template: template,
//  inputVariables: ["context", "question"],
//});


// const model = new OpenAI({ temperature: 0.9, maxTokens: maxTokens, model: modelName, });
//const res = await model.call(
//    "What would be a good company name a company that makes colorful socks?"
//  );
//console.log(res);


/*

chunk_size = 900
chunk_overlap = 0
embedding_model = 'text-embedding-ada-002'
llm_model = 'text-davinci-003'
max_tokens = 256
temperature = 0.7

prompt = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful answer in less than 50 words:"""


loader = TextLoader('../test.txt')
documents = loader.load()

for d in documents:
    d.metadata['url'] = 'https://xyz'

[doc.metadata for doc in documents]

text_splitter = CharacterTextSplitter(chunk_size=chunk_size, 
                                      chunk_overlap=chunk_overlap) 
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings(model=embedding_model, 
                              chunk_size=chunk_size,)

db = Chroma.from_documents(texts, embeddings)

retriever = db.as_retriever(search_type="similarity", search_kwargs={"k":4})
llm = OpenAI(model=llm_model, max_tokens=max_tokens, temperature=temperature)
prompt_template = PromptTemplate(
    template=prompt, input_variables=["context", "question"]
)
chain_type_kwargs = {'prompt': prompt_template}
qa = RetrievalQA.from_chain_type(llm=llm, 
                                 chain_type="stuff", 
                                 retriever=retriever,
                                 chain_type_kwargs=chain_type_kwargs,
                                 return_source_documents=True)

query = "How are you doing?"
qa({'query': query})

*/