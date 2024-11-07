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

final = []

for participant in participants:
    jury = participant["jury"]
    if not jury:
        continue

    jury_bureau = {
        "Матюхин Андрей": "1D",
        "Кириевский Дмитрий": "Салют",
        "Каменева Вероника": "Звёздное",
        "Овчинников Илья": "Родное",
        "Калинкин Александр": "Око",
    }[jury["name"]]

    final.append({
        "Пустота": "",
        "Конструкторское Бюро": jury_bureau,
        "ФИО участника": participant["info"]["name"],
        "Телефон участника": participant["info"]["phone_number"],
        "Email участника": participant["info"]["email"],
        "ФИО наставника": participant["info"]["responsible_adult_name"],
        "Email наставника": participant["info"]["responsible_adult_phone_number"],
        "Регион": participant["info"]["district"],
        "Город":  participant["info"]["city"],
        "Учереждение": participant["info"]["edu_org"],
    })

final_sorted = sorted(final, key=lambda participant: participant["ФИО наставника"])

columns = ["Пустота", "Конструкторское Бюро", "ФИО участника", "Телефон участника", "Email участника", "ФИО наставника", "Email наставника", "Регион", "Город", "Учереждение"]

with open("Финалисты.csv", mode="w") as file:
    file.write("|".join(columns) + "\n")

    for participant in final_sorted:
        for column in columns:
            file.write(participant[column] + "|")
        
        file.write("\n")
