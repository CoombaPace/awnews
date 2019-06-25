

module.exports = function (app) {
    // load intial html using handlebars
    app.get("/", function(req, res){
        res.render("/");
    }).catch(function(err) {
        res.json(err);
      })
};