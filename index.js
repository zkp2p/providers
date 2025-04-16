const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// Serve everything inside provider-templates as static files
app.use(express.static(path.join(__dirname, "/")));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});