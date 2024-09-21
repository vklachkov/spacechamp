import sys
import json

file = sys.argv[1]

with open(file, "r") as file:
    participants = json.loads(file.read())
    for participant in participants:
        print(f"Участник {participant["info"]["name"]}, почта {participant["info"]["email"]}, код участника {participant["code"]}")