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

adults_request = requests.get(f'{source_host}/api/v1/org/adults', cookies=source_login_request.cookies)
if adults_request.status_code != 200:
    print(f'Failed to fetch adults. Status code: {adults_request.status_code}')
    sys.exit(1)

adults = json.loads(adults_request.content)

for adult in adults:
    create_request = requests.post(f'{target_host}/api/v1/org/adult', json=adult, cookies=target_login_request.cookies)
    if create_request.status_code != 200:
        print(f'Failed to create adult. Status code: {create_request.status_code}')
        sys.exit(1)