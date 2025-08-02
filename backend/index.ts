import JsonDatabase from "./components/database/file";

const db = new JsonDatabase("./db.json", {
  saveOnAction: true,
  formatOnSave: true,
});
