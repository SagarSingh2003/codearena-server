import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import teacherRoutes from "./routes/teacherOps.js";
import userRoutes from "./routes/userOps.js";
import learnerRoutes from "./routes/learnerOps.js";
import { Server } from "socket.io";
import {createServer} from "node:http";
import {io} from "socket.io-client";
import {exec} from "node:child_process";
import domain from "./domain.js";


dotenv.config();

let connectionObject_PORT_TO_ID = {};

let connectionObject_Id_TO_PORT = {}

const app = express();
const port = process.env.PORT || 3000;
const server = createServer(app);

const socket_io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
});

app.use(cors());
app.use(express.json());

app.use('/user' , userRoutes);

app.use('/teacher' , teacherRoutes);

app.use('/learner' , learnerRoutes);

app.get('/health', (req, res) => {
    res.json({
        "msg" : "successful"
    })
})

app.post('/user/create-playground' ,(req , res) => {
    
    const playgroundId = req.body.replId;
    const port = connectionObject_Id_TO_PORT[playgroundId];
    console.log(port);
    console.log(req.body);
    console.log(req.headers.authorization);
    if(port){
    fetch(`${domain}:${port}/user/create-playground` , {
        method : "POST",
        headers: {
            "Content-type" : "application/json",
            "Authorization": req.headers.authorization
        },
        body : JSON.stringify({
            replId : String(playgroundId),
            type : req.body.type,
            email : req.body.email,
            createdAt : req.body.createdAt
        })
    }).then(async (rawresponse )=> {
        res.status(200).json({
            msg : "repl created successfully..."
        })
    });
    
    }else{
        res.status(500).json({
            msg : "some error occured please refresh the page!"
        })
    }
});


socket_io.on('connection', (socket) => {
    console.log('a user connected');

    //output can only come once the execute is complete


    socket.on("create_container" , (playground_id , playground_type , container_name , callback) => {
        
        for(let i = 1025 ; i < 25025 ; i++ ){

            if(i in connectionObject_PORT_TO_ID){
                continue;
            }

            if(!(playground_id in connectionObject_Id_TO_PORT) && container_name ){
                connectionObject_Id_TO_PORT[String(playground_id)] = i;
                connectionObject_PORT_TO_ID[i] = playground_id;
            }

            break;
        
        }
        console.log(!(playground_id in connectionObject_Id_TO_PORT))
        console.log(connectionObject_Id_TO_PORT);
        console.log(connectionObject_PORT_TO_ID);
        if(playground_id in connectionObject_Id_TO_PORT ){
            console.log(playground_id , connectionObject_Id_TO_PORT[playground_id]);
            exec(`./docker_script.sh ${connectionObject_Id_TO_PORT[playground_id]} ${connectionObject_Id_TO_PORT[playground_id] - 1025 + 25025} ${container_name}`)
            console.log(`container created at port ${connectionObject_Id_TO_PORT[playground_id]}`)
            callback(true);
        }else{
            console.log("container creation failed");
            callback(false);
        }

    });

    socket.on("file_browser", async( playgroundType, playgroundName , callback) => {

        //initialize client socket 
        console.log("sending request to socket server : " , `${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`);
        const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`)
        socket_client.emit("file_browser" , playgroundType , playgroundName , ({directory_structure}) => {
            console.log("request sent")
            console.log(directory_structure , "directory_structure");
            callback({directory_structure: directory_structure});
            socket_client.disconnect();
        });


    });

    socket.on("providefile", (async (playgroundName , playgroundType , filename ,  callback) => {

        const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`);
        console.log(socket_client , "sending request to socker server");
        socket_client.emit("providefile" , playgroundName , playgroundType , filename ,  (content) => {
            console.log('filename' , filename);
            console.log('content'  , content);
            callback(content);
            socket_client.disconnect();
        });

    }));

    socket.on("execute", (command , playgroundName , playgroundType ) => {

        
        const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`);
        socket_client.emit("execute" , command  , playgroundName , playgroundType);
        console.log("sent execute request");
        socket_client.on("output" , (msg) => {
            console.log(msg , "output");
            socket.emit("output" , msg );
        })



    });

    socket.on("update-file", async (playgroundName , playgroundType , filenames , callback ) => {
         
        const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`);
        socket_client.emit("update-file" , playgroundName , playgroundType , filenames , (fileContent) => {
            callback(fileContent);
            console.log("file updated");
            socket_client.disconnect();
        });

        
        

    });

    socket.on("saveplayground", async (playgroundName , playgroundType , callback) => {

        const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playgroundName]}`);
        socket_client.emit("saveplayground" , playgroundName , playgroundType , (data) => {
            callback("project_saved");
            console.log(data);
            socket_client.disconnect();
        });
    });

    socket.on("disconnect" , () => {
        console.log("a user disconnected" , socket.id);
    });
});
  
server.listen(port, () => {
        console.log(`app listening on port ${port}`)
})