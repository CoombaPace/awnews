/* ===========================================================================
                               DEPENDENCIES
   =========================================================================== */
   require('dotenv').config();

   var express = require("express");
   var logger = require("morgan");
   var mongoose = require("mongoose");
   var exphbs = require("express-handlebars");
   var s = require("underscore.string");
   
   
   // Require all models
   var db = require("./models");
   
   
   /* ===========================================================================
                                SCRAPING TOOLS
      =========================================================================== */
   
   // Axios is a promised-based http library, similar to jQuery's Ajax method
   // It works on the client and on the server
   var axios = require("axios");
   var cheerio = require("cheerio");
   
   
   var PORT = process.env.PORT || 3000;
   
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
   
   // Handlebars
   app.engine(
     "handlebars",
     exphbs({
       defaultLayout: "main"
     })
   );
   app.set("view engine", "handlebars");
   /* ===========================================================================
                                ROUTES
      =========================================================================== */
      process.on("unhandledRejection", (error) => {
       console.error(error); // This prints error with stack included (as for normal errors)
       throw error; // Following best practices re-throw error and let the process exit with error code
     });
     
      app.get("/", function (req, res) {
       db.Article.find({ saved: false })
       .then(function (dbArticle) {
         res.render("index", { articles: dbArticle });
       }).catch(function (err) {
         // If an error occurred, send it to the client
         res.json(err);
       });
     });
   
   // Delete an example by id
   app.delete("/articles/:id", function(req, res) {
     db.Article.remove({ _id: req.params.id })
     .then(function(dbArticle) {
       res.json(dbArticle);
     }).catch(function (err) {
       // If an error occurred, send it to the client
       res.json(err);
     });
   });
   
   // Delete all articles
   app.delete('/articles', function (req, res) {
     db.Article.remove({})
     .then(function (articles) {
       console.log("articles: " + articles)
     }).catch(function (err) {
       // If an error occurred, send it to the client
       res.json(err);
     });
   })
   
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
   
         
       // Grab every td within an article tag, and do the following:
       $("item").each(function(i, element) {
   
         // Save an empty result object
         var result = {};
         
         // Add the text, link, and description of every article, and save them as properties of the result object
         result.title = $(this)
           .children("title")
           .text();
         result.link = $(this)
           .children("link")
           .text()
           .replace(/<link>/,'');
         result.summary = $(this)
           .children("description")
           .text()
           .replace(/<\/p>(.*?)<\/p>/, "")
           .replace(/(<([^>]+)>)/ig,"")
           .replace(/&#/g,'"')
           .split("\"82").shift()
         result.saved = false;
           
         // Create a new Article using the `result` object built from scraping
         db.Article.create(result)
           .then(function(dbArticle) {
             // View the added result in the console
             console.log("this is article from server.js " + dbArticle);
           })
           .catch(function(err) {
             // If an error occurred, log it
             console.log(err);
             })
           });       
       });
       res.redirect("/")
     });
   
   // Route for getting all Articles from the db
   app.get("/articles", function(req, res) {
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
     
     db.Article.findOne({_id: req.params.id })
     .populate("note")
       .then(function(dbArticle) {
         res.json(dbArticle);
       })
       .catch(function(err) {
         res.json(err);
       })
   });
   
   // Route for saved articles
   app.get("/saved", function (req, res) {
     db.Article.find({ saved: true })
     .then(function (dbArticle) {
       res.render("saved", { articles: dbArticle });
     }).catch(function(err) {
       res.json(err);
     })
   })
   
   // Route for getting all Saved Articles from the db
    app.get("/savedArticles", function (req, res) {
      // Grab every document in the saved Articles collection
      db.Article.find({ saved: true })
        .then(function (dbArticle) {
          // If we were able to successfully find Articles, send them back to the client
          res.json(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
   
   app.post("/savedArticles/:id", function (req, res) {
     // Create a new note and pass the req.body to the entry
     console.log("req.body.saved: " + JSON.stringify(req.body.saved))
     if (req.body.saved === undefined) {
       db.Note.create(req.body)
         .then(function (dbNote) {
           // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
           // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
           // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
           return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
         })
         .then(function (dbArticle) {
           // If we were able to successfully update an Article, send it back to the client
           res.json(dbArticle);
         })
         .catch(function (err) {
           // If an error occurred, send it to the client
           res.json(err);
         });
     }
     else if (req.body.saved === "false") {
       db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
         .then(function (dbArticle) {
           // If we were able to successfully update an Article, send it back to the client
           res.json(dbArticle);
         })
         .catch(function (err) {
           // If an error occurred, send it to the client
           res.json(err);
         });
     }
     else {
       console.log("***********************************")
       console.log("neither if or else custom error")
       console.log("***********************************")
     }
   });
   
   // Route for saving/updating an Article's associated Note
app.post("/saved/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
   
   // Route for saving/updating an Article's associated Note
   app.post("/articles/:id", function (req, res) {
     // Create a new note and pass the req.body to the entry
     db.Note.create(req.body)
       .then(function(dbNote) {
         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
       })
       .then(function (dbArticle) {
         // If we were able to successfully update an Article, send it back to the client
         res.json(dbArticle);
       })
       .catch(function (err) {
         // If an error occurred, send it to the client
         res.json(err);
       });
   });
   
   // Start the server
   app.listen(PORT, function() {
     console.log("App running on port " + PORT + "!");
   });
   