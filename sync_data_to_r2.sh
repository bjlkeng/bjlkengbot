
# Get untracked files of type JSON or TXT
untracked_files=$(git status --porcelain | grep '^??' | grep -E '\.json$|\.txt$' | cut -c 4-)

# Upload each untracked file to Cloudflare R2
for file in $untracked_files; do
    npx wrangler r2 object put "bjlkengbot/data/$file" --file=$file
done
