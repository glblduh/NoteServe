<template>
  <div class="modal" :disabled="!modalenabled">
    <div class="modalbg"></div>
    <div class="modalholder" @click.self="disableModal">
      <div class="box">
        <h1>{{ modaltitle }}</h1>
        <div class="notelist" :disabled="!selecting">
          <table>
            <tr>
              <th>Name</th>
              <th>Date Added</th>
              <th>Select?</th>
            </tr>
            <tr v-for="(note, i) in notes" :key="i">
              <td>{{ i }}</td>
              <td :title="(new Date(note['timeadded']).toTimeString())">{{ new Date(note["timeadded"]).toDateString() }}</td>
              <td><button :value="i" @click="selectNote">Select</button></td>
            </tr>
          </table>
        </div>
        <div class="notelist" :disabled="!deleting">
          <table>
            <tr>
              <th>Name</th>
              <th>Date Added</th>
              <th>Select?</th>
            </tr>
            <tr v-for="(note, i) in notes" :key="i">
              <td>{{ i }}</td>
              <td :title="(new Date(note['timeadded']).toTimeString())">{{ new Date(note["timeadded"]).toDateString() }}</td>
              <td><button :value="i" @click="delNote">Select</button></td>
            </tr>
          </table>
        </div>
        <div class="savenote" :disabled="!saving">
          <input type="text" v-model="savename" placeholder="Note name">
          <button @click="saveNote">Save</button>
        </div>
        <div class="error" :disabled="!iserror">
          <p>{{ errormsg }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="main">
    <div class="editing">
      <h1>Editing</h1>
      <textarea v-model="curnote"></textarea>
      <div class="buttons">
      <button :disabled="!keyentered" @click="setSaveName">Save</button>
      <button :disabled="!keyentered" @click="getNotes">Load</button>
      <button :disabled="!keyentered" @click="selDelNote">Delete</button>
      <input type="password" v-model="key" placeholder="ENTER API KEY">
      <button @click="clearKey">Logout</button>
      </div>
    </div>
    <div class="preview">
      <h1>Preview</h1>
      <div v-html="noteview"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { marked } from "marked";

export default defineComponent({
  name: 'App',
  components: {
  },
  data() {
    return {
      keyentered: false,
      curnote: "" as string,
      key: "" as string,
      modaltitle: "Test" as string,
      notes: {} as {[key: string]: any},
      selecting: false,
      modalenabled: false,
      saving: false,
      savename: "" as string,
      iserror: false,
      errormsg: "",
      deleting: false,
    }
  },
  computed: {
    noteview():string {
      return marked(this.curnote);
    }
  },
  methods: {
    getNotes: async function() {
      let res = await fetch("/api/allnotes", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + this.key,
        },
      });
      res.json().then(data => {
        if (data["error"] !== undefined) {
          this.modaltitle = "ERROR";
          this.modalenabled = true;
          this.iserror = true;
          this.errormsg = data["error"];
        } else {
          this.notes = data;
          this.modaltitle = "Select note";
          this.modalenabled = true;
          this.selecting = true;
        }
      });
    },
    selectNote: function(e:Event) {
      const target = e.target as HTMLInputElement;
      const value = target.value as string;
      this.curnote = this.notes[value]["note"];
      this.modalenabled = false;
      this.selecting = false;
    },
    setSaveName: function() {
      this.modaltitle = "Save note";
      this.modalenabled = true;
      this.saving = true;
    },
    saveNote: async function() {
      if (this.saving) {
        let res = await fetch("/api/addnote", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + this.key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: this.savename,
            note: this.curnote
          }),
        });
        res.json().then(data => {
          if (data["error"] !== undefined) {
            this.savename = "";
            this.modaltitle = "ERROR";
            this.modalenabled = true;
            this.saving = false;
            this.iserror = true;
            this.errormsg = data["error"];
          } else {
            this.savename = "";
            this.modalenabled = false;
            this.saving = false;
          }
        });
      }
    },
    disableModal: function() {
      this.modalenabled = false;  
      this.selecting = false;  
      this.saving = false;  
      this.iserror = false;
      this.deleting = false;
    },
    selDelNote: async function() {
      let res = await fetch("/api/allnotes", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + this.key,
        },
      });
      res.json().then(data => {
        if (data["error"] !== undefined) {
          this.modaltitle = "ERROR";
          this.modalenabled = true;
          this.iserror = true;
          this.errormsg = data["error"];
        } else {
          this.notes = data;
          this.modaltitle = "Delete note";
          this.modalenabled = true;
          this.deleting = true;
        }
      });
    },
    delNote: async function(e:Event) {
      const target = e.target as HTMLInputElement;
      const value = target.value as string;
      await fetch("/api/removenote/" + value, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + this.key,
        }
      });
      this.modalenabled = false;
      this.deleting = false;
    },
    clearKey: function() {
      this.key = "";
    }
  },
  watch: {
    key: function(value) {
      localStorage.setItem("apikey", value);
      if (value !== "") {
        this.keyentered = true;
      } else {
        this.keyentered = false;
      }
    },
    curnote: function(value) {
      localStorage.setItem("curnote", value);
    }
  },
  mounted() {
    this.key = localStorage.getItem("apikey")||"";
    this.curnote = localStorage.getItem("curnote")||"";
  }
});
</script>

<style>
  body {
    background-color: #1B1B1B;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
  }
  .main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    height: 100vh;
  }
  .editing, .preview {
    padding: 15px;
  }
  textarea, .preview > div {
    resize: none;
    border: 0 solid transparent;
    border-radius: 10px;
  }
  .editing > textarea {
    width: 100%;
    height: 75%;
  }
  .preview > div {
    background-color: #FFFFFF;
    width: 100%;
    height: 100%;
    display: inline-block;
  }
  .editing > .buttons {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%;
    margin-top: 10px;
  }
  .editing > .buttons > button, .editing > .buttons > input {
    font-size: 1.2em;
    height: 2em;
    border: 0 solid #FFFFFF;
    border-radius: 5px;
    background-color: #3C3C3C;
    color: #FFFFFF;
  }
  .editing > .buttons > button:hover {
    cursor: pointer;
  }
  .editing > .buttons > input {
    padding: 0 2% 0 2%;
  }
  .editing > .buttons > *[disabled] {
    background-color: #FF4444 !important;
    color: #000000 !important;
    cursor: default !important;
  }
  .main > * > h1 {
    text-align: center;
    color: #FFFFFF;
    margin: 0;
    padding: 0;
  }
  .modal {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .modal > .modalbg {
    position: fixed;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: #000000;
    opacity: 0.9;
  }
  .modal > .modalholder {
    position: fixed;
    z-index: 3;
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
  }
  .modal > .modalholder > .box {
    height: 50%;
    width: 40%;
    background-color: #FFFFFF;
    margin: 0 auto 0 auto;
    border-radius: 5px;
  }
  .modal > .modalholder > .box > h1 {
    text-align: center;
  }
  .modal > .modalholder > .box > .notelist > table {
    text-align: center;
    width: 100%;
    height: 100%;
  }
  .modal[disabled=true] {
    display: none;
  }
  .modal > .modalholder > .box > .notelist[disabled=true] {
    display: none;
  }
  .modal > .modalholder > .box > .savenote[disabled=true] {
    display: none;
  }
  .modal > .modalholder > .box > .error[disabled=true] {
    display: none;
  }
  .modal > .modalholder > .box > .savenote {
    display: grid;
    margin: 0 auto 0 auto;
    width: 90%;
    gap: 10px;
  }
  .modal > .modalholder > .box > .savenote > * {
    margin: 0 15% 0 15%;
    border: 0;
    font-size: 1.2em;
    height: 2em;
    border: 0 solid #FFFFFF;
    border-radius: 5px;
    background-color: #3C3C3C;
    color: #FFFFFF;
  }
  .modal > .modalholder > .box > .savenote > input {
    padding: 0 2% 0 2%;
  }
  .modal > .modalholder > .box > .savenote > button {
    cursor: pointer;
  }
  .modal > .modalholder > .box > .error {
    display: grid;
    align-items: center;
    text-align: center;
  }
  .modal > .modalholder > .box > .notelist > table > tr > td > button {
    cursor: pointer;
    border: 0;
    background-color: #3C3C3C; 
    border-radius: 2px;
    color: #FFFFFF;
  }
  @media only screen and (max-device-width: 480px) {
    .main {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(2, 1fr);
    }
    .editing > .buttons {
      grid-template-columns: 100%;
    }
    .editing > textarea, .preview > div {
      height: 40vh;
    }
    .modal > .modalholder > .box {
      width: 90%;
      height: 60%;
    }
  }
</style>
