import json
import sys
import requests

host = sys.argv[1]
login = sys.argv[2]
password = sys.argv[3]
notisend_token = sys.argv[4]

login_request = requests.post(f"{host}/api/v1/login", json={"name": login, "password": password})
if login_request.status_code != 200:
    print(f"Failed to login. Status code: {login_request.status_code}")
    sys.exit(1)

participants_request = requests.get(f"{host}/api/v1/org/participants", cookies=login_request.cookies)
if participants_request.status_code != 200:
    print(f"Failed to fetch participants. Status code: {participants_request.status_code}")
    sys.exit(1)

participants = json.loads(participants_request.content)

emails = {}

for participant in participants:
    email = participant["info"]["email"]

    if email in emails:
        print(f"Дубликат: {email}")
        continue

    id = participant["id"]
    code = participant["code"]

    if id <= 60:
        print(f"Письмо на почту {email} уже отправлено")
        continue

    name = participant["info"]["name"]
    name = ' '.join(name.split(' ')[:-1])

    emails[email] = {
        "id": id,
        "name": name,
        "code": code,
    }

for (email, info) in emails.items():
    print(f"Отправка. Id {info["id"]}, Name {info["name"]}, Code {info["code"]}")

    with open("../mail/code.html") as mail:
        html = mail.read().replace("NAME", info["name"]).replace("ЯЯ-0000", info["code"])

        body = {
            "from_email": "info@spacechamp-org.ru",
            "from_name": "Космический Чемпионат 2024",
            "to": email,
            "subject": "Заявка на Космический Чемпионат 2024",
            "text": f"Твоя заявка на участие в Космическом Чемпионате принята! Твой шифр: {info["code"]}",
            "html": html
        }

        send_response = requests.post(
            "https://api.notisend.ru/v1/email/messages", 
            json=body,
            headers={
                'Authorization': f'Bearer {notisend_token}',
            })
        
        service_response = json.loads(send_response.content)
        
        if "errors" in service_response:
            for error in service_response["errors"]:
                print(f"Ошибка при отправке. Код {error["code"]}: {error["detail"]}")
        else:
            print(f"Запрос на отправку доставлен. Статус сообщения: {service_response["status"]}")
