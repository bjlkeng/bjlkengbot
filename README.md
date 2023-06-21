# bjlkengbot
Playing around with LLM's.

Note: I know the code is a mess but this is a one-off project to play with LLM's and Cloudflare, not anything close to production, so don't judge!

# Notes

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