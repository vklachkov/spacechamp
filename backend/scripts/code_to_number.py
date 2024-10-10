import json
import sys
import requests

host = sys.argv[1]
login = sys.argv[2]
password = sys.argv[3]
codes_file_path = sys.argv[4]

login_request = requests.post(f"{host}/api/v1/login", json={"name": login, "password": password})
if login_request.status_code != 200:
    print(f"Failed to login. Status code: {login_request.status_code}")
    sys.exit(1)

participants_request = requests.get(f"{host}/api/v1/org/participants?sort=id&order=desc", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}")
    sys.exit(1)

participant_numbers = {}
for participant in participants_request.json():
    participant_numbers[participant['code']] = participant['id'] + 1

with open(codes_file_path, 'r') as codes:
    for line in codes.readlines():
        code = line.strip()
        
        if len(code) == 0:
            continue

        if code in participant_numbers:
            print(f'{code} => {participant_numbers[code]}')
        else:
            print(f'Шифр {code} не найден')