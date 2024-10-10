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

participants_request = requests.get(f"{host}/api/v1/org/participants?sort=id&order=desc", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}")
    sys.exit(1)

participants = json.loads(participants_request.content)

applications_per_district = {}
total = len(participants)

for participant in participants:
    district = participant["info"]["district"]
    
    if district in applications_per_district:
        applications_per_district[district] += 1
    else:
        applications_per_district[district] = 1

print("Количество заявок по регионам", end="\n\n")
for district, participants in applications_per_district.items():
    print(f"{district}: {participants}")

print()

print(f"Всего регионов: {len(applications_per_district)} шт.")
print(f"Всего заявок: {total} шт.")