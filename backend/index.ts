import express from "express";
import fs from "fs";
import path from "path";
const app = express();
app.use(express.json());
app.use(express.static(path.resolve("../frontend/dist")));

// Getting all needed ENV variables
const PORT = process.env.PORT || 8787;
const APIKEY = process.env.APIKEY;

// Global vars
const datadir:string = __dirname + "/data";
const notespath:string = datadir + "/notes.json";

// Initialization of program
if (APIKEY === undefined) {
    console.error("No API key provided in ENV");
    process.exit(1);
}

// Create data directory if does not exist
if (!fs.existsSync(datadir)) {
    fs.mkdirSync(datadir);
}

// Create JSON notes file if does not exist
if (!fs.existsSync(notespath)) {
    fs.writeFileSync(notespath, JSON.stringify({
        notes: {},
    }, null, 4));
}

// The endpoints
app.get("/", (req, res) => {
    res.sendFile(path.resolve("../dist/index.html"));
});

app.post("/addnote", (req, res, next) => {
    const key = req.get("Authorization")?.split(" ");
    if (
        key !== undefined &&
        key[0] === "Bearer" &&
        key[1] === APIKEY
    ) {
        if (
            req.body["name"] !== undefined ||
            req.body["note"] !== undefined
        ) {
            fs.readFile(notespath, (err, data) => {
                if (err) next(err);
                let notes = JSON.parse(data.toString());
                let added = {timeadded: Date.now(), note: req.body["note"]};
                notes["notes"][req.body["name"]] = added;
                fs.writeFile(notespath, JSON.stringify(notes, null, 4), {}, () => {
                    res.status(200).send(added);
                });
            });
        } else {
            res.status(400).send({error: "Not all parameters are given. Needed are name and note"});
        }
    } else {
        res.status(401).send({error: "Given API key is not valid"});
    }
});

app.get("/getnote/:name", (req, res, next) => {
    const key = req.get("Authorization")?.split(" ");
    if (
        key !== undefined &&
        key[0] === "Bearer" &&
        key[1] === APIKEY
    ) {
        fs.readFile(notespath, (err, data) => {
            if (err) next(err);
            let notes = JSON.parse(data.toString());
            let selected = JSON.stringify(notes["notes"][req.params.name]);
            res.status(200).send(selected);
        });
    } else {
        res.status(401).send({error: "Given API key is not valid"});
    }
});

app.delete("/removenote/:name", (req, res, next) => {
    const key = req.get("Authorization")?.split(" ");
    if (
        key !== undefined &&
        key[0] === "Bearer" &&
        key[1] === APIKEY
    ) {
        fs.readFile(notespath, (err, data) => {
            if (err) next(err);
            let notes = JSON.parse(data.toString());
            if (notes["notes"].hasOwnProperty(req.params.name)) {
                delete notes["notes"][req.params.name];
                fs.writeFile(notespath, JSON.stringify(notes, null, 4), {}, () => {
                    res.sendStatus(200);
                });
            } else {
                res.status(404).send({error: "Note not found"});
            }
        });
    } else {
        res.status(401).send({error: "Given API key is not valid"});
    }
});

app.get("/allnotes", (req, res, next) => {
    const key = req.get("Authorization")?.split(" ");
    if (
        key !== undefined &&
        key[0] === "Bearer" &&
        key[1] === APIKEY
    ) {
        fs.readFile(notespath, (err, data) => {
            if (err) next(err);
            let notes = JSON.parse(data.toString());
            res.status(200).send(notes["notes"]);
        });
    } else {
        res.status(401).send({error: "Given API key is not valid"});
    }
});

app.listen(PORT, () => {
    console.log("Listening on http://0.0.0.0:%d", PORT);
});