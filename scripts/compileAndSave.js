// logic for compiling text and keyphrases from uploaded page and saving in mongoDB document

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const compileAndSave = async(path, doc)=>{
    const textAndPhraseCompile = async() => {
      const readResult = await readOperation(path);
      let segmentArray = [];
  
      readResult.forEach(lineInAnswer => {
  
        const phrase = await keyPhraseExtractor(lineInAnswer)
  
        let textSegment = {
          id: readResult.indexOf(lineInAnswer),
          text: lineInAnswer,
          phrases: phrase,
        }
  
        segmentArray.push(textSegment)
      })
  
      return segmentArray;
    }

    textAndPhraseCompile().then(
      result => {
        try {
          await client.connect();
          console.log("Connected correctly to server");
          const db = client.db("textExtract");
          const col = db.collection(doc);
      
          data = {
            page: result
          };
      
          const answerDoc = await col.insertOne(data);
          const myDoc = await col.findOne();
          console.log(myDoc)
          console.log("Document saved successfully")
          // res.send(myDoc);
        } catch(err){
          console.log(err.stack)
        } finally {
          await client.close();
        }
      }
    )
}

module.exports = compileAndSave;