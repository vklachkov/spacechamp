import json
import sys
import requests

source_host = sys.argv[1]
source_login = sys.argv[2]
source_password = sys.argv[3]
target_host = sys.argv[4]
target_login = sys.argv[5]
target_password = sys.argv[6]

source_login_request = requests.post(f'{source_host}/api/v1/login', json={'name': source_login, 'password': source_password})
if source_login_request.status_code != 200:
    print(f'Failed to login on source. Status code: {source_login_request.status_code}')
    sys.exit(1)

target_login_request = requests.post(f'{target_host}/api/v1/login', json={'name': target_login, 'password': target_password})
if target_login_request.status_code != 200:
    print(f'Failed to login on target. Status code: {target_login_request.status_code}')
    sys.exit(1)

participants_request = requests.get(f'{source_host}/api/v1/org/participants?sort=id&order=desc', cookies=source_login_request.cookies)
if participants_request.status_code != 200:
    print(f'Failed to fetch participants. Status code: {participants_request.status_code}')
    sys.exit(1)

participants = json.loads(participants_request.content)

for participant in participants:
    participant['jury_id'] = None

    create_request = requests.post(f'{target_host}/api/v1/org/participant', json=participant, cookies=target_login_request.cookies)
    if create_request.status_code != 200:
        print(f'Failed to create participant. Status code: {create_request.status_code}')
        sys.exit(1)