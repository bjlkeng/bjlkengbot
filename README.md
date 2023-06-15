# bjlkengbot
Playing around with LLM's.

Note: I know the code is a mess but this is a one-off project to play with LLM's and Cloudflare, not anything close to production, so don't judge!

# Notes

## 2023-06-13
* Instead of serializing index, just re-build index from scratch using the
  crawled, split JSON because none of the indexes in langchainJS can read from
  arbitrary strings.  All the non-server index save/load functionality require a
  filesystem (and they seem to be written in C/C++), so it's too complicated to do it otherwise.  It'll be a bit more CPU time to re-index every call, but the actual filesize is roughly the same anyways, let's see if Workers can handle that.