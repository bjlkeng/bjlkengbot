import jsonlines
from langchain.text_splitter import RecursiveCharacterTextSplitter

filename = 'briankeng-2023-06-12.jsonl'
out_filename = 'briankeng-split-2023-06-12.jsonl'

# Since langchainjs doesn't have access to tiktoken (OpenAI tokenizer), we have
# to do it manually here and pre-split it for them.
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=900, chunk_overlap=100)

output = []
print('Splitting text from', filename, '...')
with jsonlines.open(filename) as reader:
    for obj in reader:
        title = obj['title']
        content = obj['content']
        url = obj['url']
        chunks = text_splitter.split_text(content)
        for chunk in chunks:
            output.append({'title': title, 'content': chunk, 'url': url})

print('Writing to', out_filename, '...')
with jsonlines.open(out_filename, mode='w') as writer:
    writer.write_all(output)