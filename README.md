# NoteServe
A simple notes app accessible using REST API

## Installation

### Docker (recommended)

1. Pull image
```
docker pull glbl/noteserve:latest
```

2. Start container
```
docker run -d --name noteserve \
-p 8787:8787 \
-e APIKEY={PASSWORD} \
-v noteserve:/noteserve/backend/data \
--restart unless-stopped \
glbl/noteserve
```

*Build image*
```
docker build -t glbl/noteserve:latest .
```

### Manual Installation

*The `APIKEY` is required for the backend server to start, but you can just change the source code*

*You can set a custom port by setting the `PORT` env variable*

### Frontend
1. Change directory to `frontend` folder
2. Run `yarn install` to download dependencies
3. Run `yarn build` to build the static files
4. Set env variable `APIKEY` for password for REST API
5. Run the backend

### Backend
1. Change directory to `backend` folder
2. Run `npm install`
3. Run `npm run build` to build the JS file
4. Set env variable `APIKEY` for password for REST API
5. Lastly run `npm run start` or `node .` to start the server

## REST API

**The `APIKEY` is passed to the `Authorization` header**

**`Authorization: Bearer APIKEY`**

### Add note
Method: POST

Content-Type: application/json

Body:
```
{
    name: "Note name",
    note: "The note itself"
}
```

Endpoint: `/api/addnote`

### Get all notes
Method: GET

Endpoint: `/api/allnotes`

### Remove note
Method: DELETE

Endpoint: `/api/removenote/{NAMEOFNOTE}`
