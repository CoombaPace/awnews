![alt text](https://dgxhtav2e25a8.cloudfront.net/antiwar_logo.gif "AntiWar.com Logo")


# AntiWar.com Scraper

[Check it out!](https://awnews.herokuapp.com/)

### How it Works
Scrapes the XML feed from AntiWar.com,
inserts the stories into a Mongo Database, and returns Title, Link, and and Summary information for each story.

User can Save Articles and view them on the Saved Articles page.

#### Built with Node.js, MongoDB, Mongoose, Cheerio, Axios, Express, and Express Handlebars.

TODO:
1. '''Clear All''' should only apply to Home page and not delete saved articles.
2. Make a Delete '''X''' for each Saved Article.
3. Nav bar needs to highlight active tab.