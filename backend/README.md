## Reminder

```
python -m venv venv
pip install virtualenv
virtualenv venv
```

Windows
```
venv\Scripts\activate
```

Linux
```
source venv/bin/activate
```

Install dependencies
```
pip install -r requirements.txt
```

Run
```
uvicorn app.main:app --reload --log-level info --host 0.0.0.0 --port 8000
```
