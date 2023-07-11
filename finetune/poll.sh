watch --color -n 60 "openai api fine_tunes.list | jq '.data[] | \"\(.id), \(.status)\"'"
# watch --color -n 60 'openai api fine_tunes.get -i ft-NxVsXyzoQHobbU8nga6x5CrY | grep --color=always -B100 -A100 "status"'
#openai api fine_tunes.follow -i ft-NxVsXyzoQHobbU8nga6x5CrY
