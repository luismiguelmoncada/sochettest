var fs = require("fs"); //para manejo de archivos
var multer = require('multer');
var pathl = require('path');


exports.uploadPhoto = function(req, res) {


    var base64Data = req.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    var path = "../uploads/images/" + req.body.fileName + ".png";
    
    fs.writeFile(pathl.join(__dirname, path), base64Data, "base64", function(err) {
      if (err) {
        console.log(err);
        alert('error imagen bytes');
       
      } else {
        res.send("success");
      }
    });
  };