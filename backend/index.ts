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

app.use("/api", (req, res, next) => {
    const key = req.get("Authorization")?.split(" ");
    if (
        key !== undefined &&
        key[0] === "Bearer" &&
        key[1] === APIKEY
    ) {
        next();
    } else {
        res.status(401).send({error: "Given API key is not valid"});
    }
})

// The endpoints
app.get("/", (req, res) => {
    res.sendFile(path.resolve("../dist/index.html"));
});

app.post("/api/addnote", (req, res, next) => {
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
});

app.delete("/api/removenote/:name", (req, res, next) => {
    fs.readFile(notespath, (err, data) => {
        if (err) next(err);
        let notes = JSON.parse(data.toString());
        if (notes["notes"].hasOwnProperty(req.params.name)) {
            let toberm = notes["notes"][req.params.name];
            delete notes["notes"][req.params.name];
            fs.writeFile(notespath, JSON.stringify(notes, null, 4), {}, () => {
                toberm["timeremoved"] = Date.now();
                res.status(200).send(toberm);
            });
        } else {
            res.status(404).send({error: "Note not found"});
        }
    });
});

app.get("/api/allnotes", (req, res, next) => {
    fs.readFile(notespath, (err, data) => {
        if (err) next(err);
        let notes = JSON.parse(data.toString());
        res.status(200).send(notes["notes"]);
    });
});

app.listen(PORT, () => {
    console.log("Listening on http://0.0.0.0:%d", PORT);
});