const fs = require("fs")

exports.saveToJSONFile = async (jsonObj, targetFile) => {

  if (!/^\//.test(targetFile))
    targetFile = "./" + targetFile;

  return new Promise((resolve, reject) => {

    try
    {
      var data = JSON.stringify(jsonObj);
      // console.log("Saving object '%s' to JSON file: %s", data, targetFile);
      console.log("Saving object to JSON file: %s", targetFile);
    }
    catch (err)
    {
      console.log("Could not convert object to JSON string ! " + err);
      reject(err);
    }

    // Try saving the file.
    fs.writeFile(targetFile, data, (err, text) => {
      if (err)
        reject(err);
      else
      {
        resolve(targetFile);
      }
    });

  });
}