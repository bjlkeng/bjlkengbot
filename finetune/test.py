import openai
import json


# - All prompts end with suffix `\n\n###\n\n`
# - All prompts start with prefix `QUESTION: `
# - All completions end with suffix ` END`


# Load data
with open('finetune.json') as f:
    data = json.load(f)

for entry in data['data']:
    print(f'id: {entry["id"]}, model: {entry["model"]}, status: {entry["status"]}')

model = entry['model']
text = 'What is the metaphor for happiness when having a child'
prompt = f'QUESTION: {text}?\n\n###\n\n'

print(f'model: {model}')
print(f'prompt: {prompt}')

completion = openai.Completion.create(model=model, prompt=prompt, max_tokens=100, 
                                      temperature=0.7, stop=[' END'])
print(completion)