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

zp_per_jury = {}

for participant in participants:
    jury = participant["jury"]
    if not jury:
        continue
    
    jury_name = jury["name"]

    if jury_name not in zp_per_jury:
        zp_per_jury[jury_name] = 0
    
    jury_id = jury["id"]
    participant_salary = participant["rates"][str(jury_id)]["salary"]

    zp_per_jury[jury_name] += participant_salary

print("Сколько жюри потратят на ЗП", end="\n\n")
for name, total in zp_per_jury.items():
    print(f"{name}: {total}")
