# FastAPI ToDo app

## Parameters

Backend `.env` vars:
```
DATABASE_URL
```

Frontend `.env` vars:
```
NEXT_PUBLIC_API_URL
```

## Local testing

Start the services
```
docker-compose up --build
```

Stop all containers
```
docker-compose down
```

Delete database volume
```
docker-compose down -v
```

Rebuild after changes
```
docker-compose up --build
```
