""" Generate fine-tuning data for GPT by generating a question to the chunked
blog post snippets. 
"""

import json
from langchain.chat_models import ChatOpenAI

filename = 'briankeng-split-2023-06-12-bio_edit.json'
params = {
    'temperature': 0.2,
    'model_name': 'gpt-3.5-turbo',
    'max_tokens': 2000,
}

# Read in json files
with open(filename) as json_file:
    data = json.load(json_file)

# Call OpenAI API
llm = ChatOpenAI(**params)

output = []
for obj in data[50:]:
    content = obj['content']
    metadata = obj['metadata']
    url = metadata['url']
    title = metadata['title']


    prompt = """Summarize the following TEXT in the form of a questions to ask the author in the second person for each topic.  For each question extract the paragraph from the TEXT that has the corresponding answer.

    ### TEXT ###
    """ + content

    #prompt = """Summarize the following in the form of a question to ask the author in the second person, be sure to include content from each paragraph:
    #""" + content
    question = llm.predict(prompt)

    #print('----------------------------------------')
    #question = f"{question}"
    #completion = f'Brian Keng: {content}'
    print(question)
    #print(completion)
    #output.append({'question': question, 'completion': completion, 'metadata': {'url': url, 'title': title}})
    break

print(output)