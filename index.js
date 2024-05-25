import server from "./server.js";
import connectUsingMongoose from "./dbConfig.js";

// Listening server.
server.listen('3000', ()=>{
    console.log("Server is listening on localhost:3000.");
    // Connecting to the Mongodb here.
    connectUsingMongoose();
})
