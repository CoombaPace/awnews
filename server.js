/* ===========================================================================
                               DEPENDENCIES
   =========================================================================== */

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
// var parseString = require("xml2js").parseString;
// Require all models
var db = require("./models");


/* ===========================================================================
                             SCRAPING TOOLS
   =========================================================================== */

// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");


var PORT = 3000;

// Initialize Express
var app = express();

/* ===========================================================================
                               MIDDLEWARE
   =========================================================================== */

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var databaseUrl = "mongodb://localhost/unit18Populater";

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(databaseUrl, { useNewUrlParser: true });
};

var summaryPs = [];

/* ===========================================================================
                             ROUTES
   =========================================================================== */

// Delete an example by id
app.delete("/articles/:id", function(req, res) {
  db.Article.remove({ _id: req.params.id })
  .then(function(dbArticle) {
    res.json(dbArticle);
  });
});

// Delete all articles
app.delete("/articles", function(req, res) {
  db.Article.deleteMany({})
  .then(function() {
    res.json();
  });
});

// When User clicks the scrape button.
// A GET route for scraping Antiwar.com
app.get("/scrape", function(req, res) {

  // First, we grab the body of the XML with axios
  axios.get("http://original.antiwar.com/feed/").then(function(response) {
    
  // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data, {
      normalizeWhitespace: true,
      xmlMode: true,
    });

      
    // Now, we grab every td within an article tag, and do the following:
    $("item").each(function(i, element) {

      // Save an empty result object
      var result = {};
      
      // Add the text, link, and description of every link, and save them as properties of the result object
      result.title = $(this)
        .children("title")
        .text();
      result.link = $(this)
        .children("link")
      result.summary = $(this)
        .children("description")
        .text()
        .replace(/<\/p>(.*?)<\/p>/, "");

        
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log("this is article from server.js " + dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
        
    });
    location.reload();
    // Send a message to the client
    res.send("Scrape Complete");
  });
  // location.reload();
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({_id: req.params.id })
  .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
