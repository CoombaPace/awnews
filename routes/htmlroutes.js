

module.exports = function (app) {
    // load intial html using handlebars
    app.get("/", function(req, res){
        res.render("/");
    })
};