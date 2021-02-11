const Express = require("express");
const fs = require("fs");
const app = new Express();


app.get("/",(req, res) => {
    res.sendFile(__dirname+"/index.html");
});

/*
Request Header {
    Request-URL : "http://localhost:8080/video"
    Request Method : "GET"
    Range : bytes 0 -  
}

Multiple Such Requests will be made by the web browser while streaming the video.
But everytime value of range is gonna increase and initial value should be 0 as it is starting from start.


Response Header {
    Content-Range:bytes 0-1000001/totalvideosize,
    Accept-Range:bytes,
    Content-Length:1000001 (here 1 MB , but can be changed),
    Content-Type:video/mp4,
}
*/

app.get("/video",(req, res) => {
    const range = req.headers.range;
    if(!range){
        res.status(400).send("Needs Range In Header");
    }
    //Range = bytes=1234-
    const videoPath = "NodeVideo.mp4";
    const videoSize = fs.statSync("NodeVideo.mp4").size;
    
    //Here we decide how much data are we gonna send in upon every request made by the browser.
    const chunkSize =  10 ** 6; //1 MB
    
    //Here we remove "-" from the range.
    const start = Number(range.replace(/\D/g,""));
    
    //end will have min of either two and it's used to stop video streaming when we reach max video size
    const end = Math.min(chunkSize+start,videoSize-1);
    
    const contentLength = end - start + 1 ;

    const headers = {
        "Content-Range":`bytes ${start}-${end}/${videoSize}`,
        "Accept-Range":"bytes",
        "Content-Length":contentLength,
        "Content-Type":"video/mp4",
    };
    //Response Code 206 is for Partial Content.
    res.writeHead(206,headers);
    const videoStream = fs.createReadStream(videoPath,{"start":start ,"end":end});
    /*Pipe basically allows us to plug stream together passing data from one stream to another
     without having to worry about events as streams are based on events.
    */
    videoStream.pipe(res);
});

app.listen(8080,()=>console.log("Server Running at Port 8080"));

