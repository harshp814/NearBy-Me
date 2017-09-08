var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var Yelp = require("yelpv3");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

var yelp = new Yelp({
    app_id: '#######################',
    app_secret: '############################'
});


app.get("/", function(req, res){
   res.render("landing.ejs"); 
});

app.post("/", function(req, res){
    
    var searchTerm = req.body.searchTerm;
    var zipCode = req.body.zipCode;
    var fullData = []; 
    var isValidZip = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/.test(zipCode);
    
    
    
    if (isValidZip) {
        
        if (req.body.distance) {
        
            yelp.search({term: searchTerm, location: zipCode}).then(function(data){
                var parsedData = JSON.parse(data);
                var stores = parsedData.businesses; 
                
                stores.forEach(function(store){
                    yelp.business(store.id).then(function(businessData){
                        businessData = JSON.parse(businessData);
                        fullData.push(businessData);
                    });
                });
                
                setTimeout(function(){
                    
                    stores.forEach(function(store) {
                        function findStore(x) {return x.id === store.id;}
                        var temp = fullData.find(findStore);
                        if (temp){
                            temp.distance = store.distance;
                            var index = fullData.findIndex(i => i.id === store.id);
                            fullData[index] = temp;
                        }
                    });
                    fullData.sort(function(a, b) {
                        return a.distance - b.distance;
                    });
                    
                    res.render("index.ejs", {stores: fullData, forDist: stores});
                }, 3000);
            });
            
        } else {
            yelp.search({term: searchTerm, location: zipCode}).then(function(data){
                var parsedData = JSON.parse(data);
                var stores = parsedData.businesses; 
                
                stores.forEach(function(store){
                    yelp.business(store.id).then(function(businessData){
                        businessData = JSON.parse(businessData);
                        fullData.push(businessData);
                    });
                });
                
                setTimeout(function(){
                    res.render("index.ejs", {stores: fullData, forDist: stores});
                }, 3000);
            });
        }
    } else {
        res.render("landing.ejs");
    }
    
});


app.listen(process.env.PORT, process.env.IP, function(){});
