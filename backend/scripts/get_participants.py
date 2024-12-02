# /// script
# dependencies = [
#   "requests",
# ]
# ///

import json
import sys
import requests

host = sys.argv[1]
login = sys.argv[2]
password = sys.argv[3]

login_request = requests.post(f"{host}/api/v1/login", json={"name": login, "password": password})
if login_request.status_code != 200:
    print(f"Failed to login. Status code: {login_request.status_code}")
    sys.exit(1)

participants_request = requests.get(f"{host}/api/v1/org/participants?sort=id&order=desc&deleted=false", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}")
    sys.exit(1)

participants = json.loads(participants_request.content)

juries = {
    "Матюхин Андрей": [],
    "Кириевский Дмитрий": [],
    "Каменева Вероника": [],
    "Овчинников Илья": [],
    "Калинкин Александр": [],
}

for participant in participants:
    if not participant["jury"]:
        continue
    
    juries[participant["jury"]["name"]].append({
        "id": participant["id"],
        "name": participant["info"]["name"],
        "city": participant["info"]["city"],
        "district": participant["info"]["district"], 
        "salary": participant["rates"][str(participant["jury"]["id"])]["salary"]
    })

for jury, participants in juries.items():
    with open(f"{jury}.txt", "w") as file:
        for participant in participants:
            file.write(f"{participant['name']} (№{participant['id'] + 1}) с ЗП {participant['salary']} из г. {participant['city']}, {participant['district']}\n")