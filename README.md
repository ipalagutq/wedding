# Wedding invite (one-page) + RSVP listener

Проект делает:
- Одностраничное свадебное приглашение (статичная страница) + анимации при скролле.
- Форму (RSVP), которая отправляет ответы на ваш ПК (локальный listener).
- Публикацию через **ngrok**: гости открывают ссылку, форма отправляется туда же (на тот же домен).

## Структура
- `public/` — фронтенд (`index.html`, `styles.css`, `script.js`)
- `app.py` — FastAPI listener + выдача статики + `POST /api/rsvp`
- `data/submissions/` — JSON-файлы с ответами (по умолчанию)
- `reference.mov` — видео-референс
- `reference.html` — HTML конструктора (для текстовок)

## Запуск локально

1) Установить зависимости:

```bash
cd /Users/ilyapalaguto/workspace/projects/wedding_v1
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Запустить listener:

```bash
python app.py
```

Откройте: `http://localhost:8000`

Проверка API:

```bash
curl -s -X POST http://localhost:8000/api/rsvp \
  -H 'Content-Type: application/json' \
  -d '{"name":"Тест","attendance":"yes","guests":2,"plus_ones":["Катя"],"song":"Daft Punk — One More Time","comment":"","meta":{}}' | cat
```

Ответы сохраняются в `data/submissions/`.

## Хранение в SQLite (опционально)

Если захотите хранить в БД, включите режим sqlite:

```bash
RSVP_STORAGE=sqlite python app.py
```

Файл БД: `data/rsvp.sqlite`.

## Запись ответов в Google Sheets

При каждом `POST /api/rsvp` сервер может добавлять строку в Google Таблицу.

Колонки:
- `Имя гостя`
- `Будет присутствовать`
- `+1` (JSON-массив имён)
- `Песня для танцпола`

### Что нужно настроить

1) Создать **Service Account** в Google Cloud и скачать ключ JSON.

2) Дать доступ сервисному аккаунту к нужной Google Таблице (поделиться таблицей на email сервисного аккаунта).

3) Задать переменные окружения:

- `GOOGLE_SHEETS_SPREADSHEET_ID` — id таблицы (из URL)
- `GOOGLE_SHEETS_RANGE` — диапазон для append, по умолчанию `RSVP!A:D`
- один из вариантов credentials:
  - `GOOGLE_SERVICE_ACCOUNT_FILE` — путь до JSON файла ключа
  - или `GOOGLE_SERVICE_ACCOUNT_JSON` — содержимое JSON ключа одной строкой

Пример запуска:

```bash
GOOGLE_SHEETS_SPREADSHEET_ID="..." \
GOOGLE_SHEETS_RANGE="RSVP!A:D" \
GOOGLE_SERVICE_ACCOUNT_FILE="/path/to/service-account.json" \
python app.py
```

Если Google Sheets настроен, но запись не удалась, `POST /api/rsvp` вернёт ошибку `500` (при этом ответ всё равно сохранится локально в `data/submissions/` или SQLite).

## Публикация через ngrok

1) Установите ngrok и залогиньтесь (`ngrok config add-authtoken ...`).

2) Запустите сервер как выше.

3) В отдельном терминале:

```bash
ngrok http 8000
```

ngrok даст публичный URL вида `https://xxxx.ngrok-free.app` — его и отправляйте гостям.

## Настройка текста/данных

Основные данные редактируются в `public/script.js` в объекте `CONFIG`:
- имена пары
- дата/время
- адрес и ссылка на карту
- контакты

## Примечания по анимациям

Сейчас стоит базовый набор анимаций (плавное появление карточек при скролле + микро-анимация после отправки формы).
Если хочешь, я подгоню движение под видео точнее: скажи, какие моменты критичны (например: "обложка уезжает", "карточки появляются слева", "есть параллакс").
