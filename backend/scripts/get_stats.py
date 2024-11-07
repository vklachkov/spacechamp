# Подсчёт статистики по каждому региону
#
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

per_district = {}
per_jury_per_district = {
    "Матюхин Андрей": {},
    "Кириевский Дмитрий": {},
    "Каменева Вероника": {},
    "Овчинников Илья": {},
    "Калинкин Александр": {},
}

for participant in participants:
    district = participant["info"]["district"]
    
    if district in per_district:
        per_district[district] += 1
    else:
        per_district[district] = 1

    jury = participant["jury"]
    if jury:
        stat = per_jury_per_district[jury["name"]]
        if district in stat:
            stat[district] += 1
        else:
            stat[district] = 1

with open("Статистика по всем заявкам.txt", "w") as file:
    file.write(f"Количество заявок по регионам\n")
    file.write(f"\n")
    
    stats = [(district, count) for district, count in per_district.items()]
    stats.sort(key=lambda stat: stat[0])
    
    for district, count in stats:
        file.write(f"{district}: {count}\n")

    file.write(f"\n")
    file.write(f"Всего регионов: {len(per_district)} шт.\n")
    file.write(f"Всего заявок: {len(participants)} шт.\n")

with open("Статистика по жюри.txt", "w") as file:
    file.write(f"Количество заявок по регионам для каждого жюри\n")
    file.write(f"\n")
    
    for jury, per_district in per_jury_per_district.items():
        file.write(f"{jury.upper()}\n")
        file.write("\n")

        stats = [(district, count) for district, count in per_district.items()]
        stats.sort(key=lambda stat: stat[0])
    
        for district, count in stats:
            file.write(f"{district}: {count}\n")

        file.write(f"\n")
