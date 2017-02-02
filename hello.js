var express = require('express');
var httprequest = require('request');
var http = require('http');
var xml2js= require('xml2js').parseString;
var app = express();


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/njt', function (req, res) {
    
    var buses="";
    var toWrite="";
    //
    httprequest('http://mybusnow.njtransit.com/bustime/map/getBusesForRoute.jsp?route=139&nsd=true&stop=RT%20527%20+%20MAPLETON%20RD', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //console.log(body) // Print the google web page.
        buses+=body;
     }
     
     console.log(buses);
     
     
     xml2js(buses, function (err, result) {

            var itemsProcessed=0;
            var stopsProcessed=0;
           result.buses.bus.forEach( function (item, index, array) {
                //find the bus in question
                itemsProcessed++;
                res.write(item.id +"\n");
                if(item.fs[0].indexOf("BROWNTOWN VIA ENGLISHTOWN") > -1
                || item.fs[0].indexOf("FREEHOLD") > -1
                )
                {
                    toWrite+=item.id+ " " + item.lat + " " + item.lon;
                    
                    var busData = "    "+ item.id+ " " + item.lat + " " + item.lon + "\n";
                    //get the bust projections for this bus

                     //
                    var urlForProj = 'http://mybusnow.njtransit.com/bustime/map/getBusPredictions.jsp?bus='+ item.id +'&route=139';
                    
                    httprequest(urlForProj, function (error2, response2, body2) {
                        var projections = "";
                        if (!error2 && response2.statusCode == 200) {
                        //console.log(body) // Print the google web page.
                            projections+=body2;
                        }
                        stopsProcessed+=1;
                        var finalProcessed=0;
                         xml2js(projections, function (err, result2) {
                             console.log(result2);
                             if(Array.isArray(result2.bus.pr)) {
                                 var busProjections="";
                             result2.bus.pr.forEach( function(item, index2, array2){
                                finalProcessed+=1;
                                toWrite+="         " + item.st + " " + item.pt  ;
                                busProjections+="         " + item.st + " " + item.pt  +"\n";
                                if(finalProcessed ===array2.length)
                                {
                                     res.write(busData);
                                     res.write(busProjections);
                                     
                                }
                                if(itemsProcessed === array.length && finalProcessed ===array2.length && stopsProcessed ===itemsProcessed) {
                                    
                                     res.end("");
                                    }
                                    
                                    console.log(itemsProcessed + " " + stopsProcessed + " " + finalProcessed)
                             });
                         }
                         else
                         {
                                  if(itemsProcessed === array.length) {
                                 //    res.end("");
                                 console.log("should finish");
                                    }
                         }

                         });

                        console.log(projections.toString());
                        console.log("done " + urlForProj);
                        
                         
                    });

                    
                }
                else {
                    stopsProcessed+=1;
                              if(itemsProcessed === array.length) {
               //     res.end("");
               console.log("should finish");
    }
                }
               
           });
           
         //  res.end("");
            
     });
     console.log(toWrite);

    });
    
    
 // res.end("");
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});