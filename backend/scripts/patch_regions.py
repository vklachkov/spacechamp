# Скрипт для автоматического исправления названия регионов в анкетах.
#
# /// script
# dependencies = [
#   "requests",
#   "thefuzz",
# ]
# ///

import json
import sys
import requests

from thefuzz import process

# Список городов федерального значения + "новые территории"
FEDERAL_CITY = [
    # Россия
    "Москва",
    "Санкт-Петербург",
    # Украина
    "Севастополь",
]

# Список субъектов + "новые территории"
DISTRICTS = [
    # Россия
    "Алтайский край",
    "Амурская область",
    "Архангельская область",
    "Белгородская область",
    "Брянская область",
    "Владимирская область",
    "Волгоградская область",
    "Вологодская область",
    "Воронежская область",
    "Еврейская автономная область",
    "Забайкальский край",
    "Ивановская область",
    "Иркутская область",
    "Кабардино-Балкарская Республика",
    "Калужская область",
    "Камчатский край",
    "Карачаево-Черкесская Республика",
    "Кемеровская область",
    "Кировская область",
    "Костромская область",
    "Краснодарский край",
    "Красноярский край",
    "Курганская область",
    "Курская область",
    "Ленинградская область",
    "Липецкая область",
    "Магаданская область",
    "Москва",
    "Московская область",
    "Мурманская область",
    "Ненецкий автономный округ",
    "Нижегородская область",
    "Новгородская область",
    "Новосибирская область",
    "Омская область",
    "Оренбургская область",
    "Орловская область",
    "Пензенская область",
    "Пермский край",
    "Приморский край",
    "Псковская область",
    "Республика Алтай",
    "Республика Башкортостан",
    "Республика Бурятия",
    "Республика Карелия",
    "Республика Коми",
    "Республика Марий Эл",
    "Республика Мордовия",
    "Республика Саха - Якутия",
    "Республика Северная Осетия - Алания",
    "Республика Татарстан",
    "Республика Тыва",
    "Республика Хакасия",
    "Ростовская область",
    "Рязанская область",
    "Самарская область",
    "Санкт-Петербург",
    "Саратовская область",
    "Сахалинская область",
    "Свердловская область",
    "Смоленская область",
    "Ставропольский край",
    "Тамбовская область",
    "Тверская область",
    "Томская область",
    "Тульская область",
    "Тюменская область",
    "Удмуртская Республика",
    "Ульяновская область",
    "Хабаровский край",
    "Ханты-Мансийский автономный округ - Югра",
    "Челябинская область",
    "Чувашская Республика",
    "Чукотский автономный округ",
    "Ямало-Ненецкий автономный округ",
    "Ярославская область",
    # Украина
    "Донецкая Народная Республика",
    "Донецкая область",
    "Запорожская Народная Республика",
    "Запорожская область",
    "Луганская Народная Республика",
    "Луганская область",
    "Республика Крым",
    "Севастополь",
    "Херсонская Народная Республика",
    "Херсонская область",
]

# Хак для корректной работы нечёткого поиска на областях
def fix_distict(district):
    is_federal_city = district in FEDERAL_CITY
    is_one_word = district.strip().count(" ") == 0

    if is_one_word and not is_federal_city:
        return f"{district} область"
    else:
        return district

# Замена названий на юридически правильные 
def remap_district(district):
    remap = {
        # Украина
        "Донецкая область": "Донецкая Народная Республика",
        "Луганская область": "Луганская Народная Республика",
        "Запорожская Народная Республика": "Запорожская область",
        "Херсонская Народная Республика": "Херсонская область",
    }

    if district in remap:
        return remap[district]
    else:
        return district

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

for participant in participants:
    bad_district = participant["info"]["district"]
    if bad_district in DISTRICTS:
        continue

    (good_district, match) = process.extractOne(fix_distict(bad_district), DISTRICTS)
    good_district = remap_district(good_district)

    if match < 90:
        raise ValueError(f"Unknown district {bad_district}")

    id = participant["id"]
    patch = {
        "name": participant["info"]["name"],
        "city": participant["info"]["city"],
        "district": good_district,
        "phone_number": participant["info"]["phone_number"],
        "email": participant["info"]["email"],
        "edu_org": participant["info"]["edu_org"],
        "responsible_adult_name": participant["info"]["responsible_adult_name"],
        "responsible_adult_phone_number": participant["info"]["responsible_adult_phone_number"],
        "photo_url": participant["info"]["photo_url"],
        "answers": participant["answers"],
    }

    patch_request = requests.patch(f"{host}/api/v1/org/participant/{id}", json=patch, cookies=login_request.cookies)
    if patch_request.status_code != 200:
        print(f"Failed to patch participant {id}. Status code: {patch_request.status_code}")
        sys.exit(1)
