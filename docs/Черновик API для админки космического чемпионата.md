## Для всех

POST `/api/v1/login`
- Принимает имя, пароль и возвращает статус
- Должен возвращать роль
- JWT

## Для организаторов

GET `/api/v1/org/participants`
- Возвращает массив участников
- Есть базовая информация
- Есть ответы
- Есть оценки и комментарии жюри. Если жюри не оценил, будет null
```
[
    {
        "id": string,
        "jury_id": number | null,
        "info": {
            "name": string,
            "location": string,
            ...
        },
        "answers": {
            "Какую какашку ты высрал с утра?": "...",    
        },
        // Прилетают только жюри. Если жюри стал организатором, он не попадёт в список.
        "rates": {
            // id jury -> rate
            1: null | {
                "salary": number,
                "comment": string, 
            },
        },
    }
]
```


POST `/api/v1/org/participant/command`
- Принимает в себя id жюри
```
{ "participant_id": number, "jury_id": number }
```


GET `/api/v1/org/adults`
- Возвращает список жюри и организаторов
- У каждого человека есть статус, имя и пароль
```
[
    {
        "name": string,
        "password": string,
        "role": "org" | "jury",
    }
]
```


POST `/api/v1/org/adult`
- Принимает в себя имя, пароль и роль
- Возвращает 200, если всё норм
```
{ "name": string, "password": string, "role": "org" | "jury" }
```

DELETE `/api/v1/org/adult`
- Удаление жюри
```
{ "id": number }
```


## Для жюри

GET `/api/v1/jury/participants`
- Получение обезличенных участников
```
[
    {
        "id": string,
        "in_command": true,
        "answers": {
            "Какую какашку ты высрал с утра?": "...",    
        },
        "rate": null | {
            "salary": number,
            "comment": string, 
        }
    }
]
```


POST `/api/v1/participant/rate`
- Оценка участника
```
{ "id": number, "salary": number, "comment": null | string }
```
