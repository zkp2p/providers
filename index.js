const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(cors());

// Serve everything inside provider-templates as static files
app.use(express.static(path.join(__dirname, "/")));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});