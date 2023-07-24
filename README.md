# bjlkengbot
Playing around with LLM's.

Note: I know the code is a mess but this is a one-off project to play with LLM's and Cloudflare, not anything close to production, so don't judge!

# Notes

## 2023-07-10

* Trained a davinci model with default settings and it was terrible even when I asked the exact question from the training set.
* Some examples of the output:

```
id: ft-NxVsXyzoQHobbU8nga6x5CrY, model: davinci, status: pending
model: davinci
prompt: QUESTION: What is the metaphor for happiness when having a child?

###


{
  "id": "cmpl-7avdjIHv7uppfSz9StfPjjT0mHVi0",
  "object": "text_completion",
  "created": 1689035731,
  "model": "davinci",
  "choices": [
    {
      "text": "\n\n\n\n\n\n[1] In one of the best-known works in literary criticism, The Rhetoric of Fiction (1949), Wayne C. Booth contends that the \u201cassumption of a metaphor\u201d is the \u201cbasic rhetorical operation\u201d of fiction (3). The metaphor is \u201ca kind of induction from the particular to the general\u201d (4). For Booth, the metaphor is a rhetorical device, not unlike a syllogism, and indeed, one",
      "index": 0,
      "logprobs": null,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 100,
    "total_tokens": 118
  }
}

id: ft-NxVsXyzoQHobbU8nga6x5CrY, model: davinci, status: pending
model: davinci
prompt: QUESTION: What is the metaphor for happiness when having a child?

###


{
  "id": "cmpl-7avaeV6VZReyJIqnNjaF9GtclbsxB",
  "object": "text_completion",
  "created": 1689035540,
  "model": "davinci",
  "choices": [
    {
      "text": "\n\n\n\nThe 18th Annual Doubletake Open Mike was officially selected as a",
      "index": 0,
      "logprobs": null,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 16,
    "total_tokens": 34
  }
}
```

NEXT:
* Going to downgrade to a chepaer model (Curie) and do some hyperparam sweep along batch size, learning rate, epoch

## 2023-07-23

* Adding finetuning API (did a bunch of finetuning on OpenAI APIs before)
* Had to use a seperate trick since OpenAI Node library doesn't quite support Cloudeflare workers: https://community.openai.com/t/cloudflare-pages-typeerror-adapter-is-not-a-function/163299/5
  * `npm install @vespaiach/axios-fetch-adapter`

```const configuration = new Configuration({
  apiKey: apiKey,
  baseOptions: {
    adapter: fetchAdapter
  }
});```

## 2023-07-09

* Got the OpenAI API up and running fine-tuning a model
* Davinci is expensive! 


## 2023-07-06
* Got resonable questions generated from chunking my blog post by doing some light processing (probably more to do but just eye balled a few ones and added some filters):
    * Chunks of 250 tokens
    * Split chunks on "\n\n" since sometimes it breaks between paragraphs
    * For each chunk, pick the chunk with the longest line that doesn't start with "Related Posts"
    * Only include a chunk in the Q&A if it's greater than 20 tokens
* Generated the data file
* NEXT: 
    * Fine-tune a GPT 3.5 model using OpenAI API

## 2023-06-27
* Got the site working on Cloudflare, embeddings in a vector database, and calling the OpenAI API with langchainJS etc.  Hardest part was getting the HTML/CSS/JS to work!  I made liberal use of ChatGPT to help me generate the code and figure out what to do.
* NEXT:
    * Working with trying to just ChatGPT to generate a Q&A so that I can fine-tune a model
    * ChatGPT does not work well if I try to ask it to generate questions and quote answers from the text.  The quotes seem to be off sometimes it uses third person ("The author's blog...").  I think if I use it to generate questions, then perhaps ask each question of the source text to generate an answer it might do better.  The long sequenece might lose some of the initial instructions.


## 2023-06-16
* Got `worker.bjlkeng.io` using custom domains (had to wait for thing sto propagate)
* Next: get a WAF rate limiting working
    * To use the free rule I have to ensure that worker returns only for specified path (e.g. bjlkengbot)
    * Then I can make a rule around it


## 2023-06-14
Got it working end to end!  It reads it from R2, indexes it, and then runs the query usign langchainjs.  
On the `*.workers.dev` domain Cloudflare seems to not enforce the CPU limits, but when I route it through
my `bjlkeng.io` domain, it looks like it enforces the 10ms CPU time.  Looks like I'll have to jump on the paid
plan and use the unbounded worker type.

## 2023-06-13
Instead of serializing index, just re-build index from scratch using the
crawled, split JSON because none of the indexes in langchainJS can read from
arbitrary strings.  All the non-server index save/load functionality require a
filesystem (and they seem to be written in C/C++), so it's too complicated to do it otherwise.  It'll be a bit more CPU time to re-index every call, but the actual filesize is roughly the same anyways, let's see if Workers can handle that.