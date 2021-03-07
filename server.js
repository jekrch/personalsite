const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const path = require("path")
const items = require("./routes/api/items")
const lectures = require("./routes/api/lectures")

const app = express()

// Bodyparser middleware
app.use(bodyParser.json())

// DB config uri
const db = require("./config/keys").mongoURI

// connect
mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err))

// use routes
app.use("/api/items", items)
app.use("/api/lectures", lectures)

// serve static assets if we're in prod

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server started on port ${port}`))
