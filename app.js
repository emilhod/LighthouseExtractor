const fs = require('fs');
const express = require('express')

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



app.get('/', (req, res) => {

  const file1 = './datasets/lighthouse.json';

  const file2 = './datasets/newformattest.json';

  const results = extractor(file2);

  res.json(results)

})



function extractor(inputFile) {

  let rawdata = fs.readFileSync(inputFile);
  let dataObject = JSON.parse(rawdata);

  let output = {};

  Object.entries(dataObject.data.lighthouseResult.categories).map(item => { // Iterate cateogories..

    const reqURL = dataObject.data.lighthouseResult.requestedUrl;
    const categoryTitle = item[1].title;
    const categogryScore = item[1].score;
    let metrics =  []
    
    output['URL'] = reqURL;
    
    output[categoryTitle] = {
      categoryTitle: categoryTitle,
      categogryScore: categogryScore,
      
    };

    item[1].auditRefs.forEach(element => {  // Iterate category metrics..

      const auditID = element.id;

      Object.entries(dataObject.data.lighthouseResult.audits).map(item2 => {  // Iterate all metrics + results..
        
        if (auditID === item2[1].id) {

          if (item2[1].score === 0) { // 0 === M.I.A.
            
            metrics.push({
              metricTitle: item2[1].title,
              metricDescription: item2[1].description
            })

            if (item2[1].displayValue) { 

              metrics.push({
                metricValue: item2[1].displayValue
              });
            
            }

          }

          else if (item2[1].displayValue && categoryTitle === 'Performance'){
            
            metrics.push({
              metricTitle: item2[1].title,
              metricDescription: item2[1].description,
              metricValue: item2[1].displayValue
            });

          }
            output[categoryTitle]['metrics'] = metrics;
        };

      });

    });

  });

  return output

}


