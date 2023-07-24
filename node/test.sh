curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "curie:ft-personal:bjlkengbot-2023-07-12-11-18-23",
    "prompt": "Say this is a test",
    "max_tokens": 7,
    "temperature": 0
  }'
