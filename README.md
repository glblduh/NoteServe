# NoteServe
A simple notes app accessible using REST API

## Installation

*The `APIKEY` is required for the backend server to start, but you can just change the source code*

*You can set a custom port by setting the `PORT` env variable*

### Frontend
1. Change directory to `frontend` folder
2. Run `yarn build` to build the static files
3. Set env variable `APIKEY` for password for REST API
4. Run the backend

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

Endpoint: `/addnote`

### Get all notes
Method: GET

Endpoint: `/allnotes`

### Get note from name
Method: GET

Endpoint: `/getnote/{NAMEOFNOTE}`

### Remove note
Method: DELETE

Endpoint: `/removenote/{NAMEOFNOTE}`

## To-do's
- Make into Docker image