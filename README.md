<center><img src="Лого.png" width="25%" height="25%"></center>
<center><h1><a href="https://spacechamp.ru">Космический Чемпионат 2024</a></h1></center>

Адмика для организаторов и жюри Космического Чемпионата. Она нужна для...

* Просмотра и редактирования заявок
* Оценивания участников
* Назначения команды
* Рассылки писем участникам

## Как запустить?

### Локально

**Frontend**

```
$ cd frontend
$ npm run start
```

**Backend**

```
$ cd backend
$ mkdir target-data
$ cargo run -- --db-url "postgresql://NAME:PASSWORD@HOST:5432/spacechamp" --addr "127.0.0.1:8833" --sessions-path "target-data/sessions.json" --notisend-token "TOKEN"
```

**Генератор Отчётов**

Необязателен, только для разработки и тестирования этой фичи.

```
$ cd report-generator
$ uv run app.py --host 127.0.0.1 --port 8866 --debug
```

### На проде

[Смотрите в Github Workflows](.github/workflows/deploy.yml).

## Лицензия

Проект лицензирован [под GPLv3](LICENSE).