import json
import sys
import requests

host = sys.argv[1]
login = sys.argv[2]
password = sys.argv[3]
generator_host = sys.argv[4]

login_request = requests.post(f"{host}/api/v1/login", json={"name": login, "password": password})
if login_request.status_code != 200:
    print(f"Failed to login. Status code: {login_request.status_code}")
    sys.exit(1)

participants_request = requests.get(f"{host}/api/v1/org/participants?sort=id&order=desc", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}")
    sys.exit(1)

report_data = []

for participant in json.loads(participants_request.content):
    code = participant['code']
    rates = {
        '1D': participant['rates']['9']['salary'] if participant['rates']['9'] else None,
        'Салют': participant['rates']['4']['salary'] if participant['rates']['4'] else None,
        'Звёздное': participant['rates']['5']['salary'] if participant['rates']['5'] else None,
        'Родное': participant['rates']['8']['salary'] if participant['rates']['8'] else None,
        'Око': participant['rates']['10']['salary'] if participant['rates']['10'] else None,
    }

    report_data.append({ 'code': code, 'rates': rates })

report = requests.post(generator_host, json=report_data)

with open('Отчёт_Кандидаты_КЧ.pdf', 'wb') as doc:
    doc.write(report.content)
