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

participants_request = requests.get(f"{host}/api/v1/org/participants?sort=id&order=desc&deleted=true", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}. Text: {participants_request.text}")
    sys.exit(1)

with open('participants-backup.json', 'w') as file:
    file.write(participants_request.content.decode("utf-8"))
