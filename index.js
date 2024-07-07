import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import teacherRoutes from "./routes/teacherOps.js";
import userRoutes from "./routes/userOps.js";
import learnerRoutes from "./routes/learnerOps.js";
import { Server } from "socket.io";
import {createServer} from "node:http";
import {io} from "socket.io-client";
import domain from "./domain.js";
import { removeContainer , createAndRunContainer } from "./services/ContainerService.js";


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



socket_io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on("provide-preview-url" , (playground_id , callback) => {
        const port = connectionObject_Id_TO_PORT[playground_id].port;
        callback(`${domain}:${port - 1025 + 25088}`)
    })



        socket.on("create_container" , async (playground_id , playground_type , container_name , callback) => {
        
            for(let i = 1025 ; i < 25088 ; i++ ){
    
                if(i in connectionObject_PORT_TO_ID || i === 3000){
                    continue;
                }
    
                if(!(playground_id in connectionObject_Id_TO_PORT) && container_name ){
                    
                    const container_id = await createAndRunContainer(i , playground_id);
                    console.log(container_id);
                    if(container_id){
                        console.log(`container ${container_id} created at port ${i}`);
                    
                        connectionObject_Id_TO_PORT[String(playground_id)] = {port : i , container_id : container_id};
                        connectionObject_PORT_TO_ID[i] = {playground_id : playground_id , container_id : container_id};
                    }
                }
    
                break;
            
            }


            console.log(!(playground_id in connectionObject_Id_TO_PORT))
            console.log(connectionObject_Id_TO_PORT);
            console.log(connectionObject_PORT_TO_ID);
            if(playground_id in connectionObject_Id_TO_PORT ){
                
                callback(true);

            }else{
                console.log("container creation failed");
                callback(false);
            }

            socket.on("connect-to-playground" , (playground_id ) => {
        
                const socket_client = io(`${domain}:${connectionObject_Id_TO_PORT[playground_id].port}`);
                

                socket_client.on("output" , (msg) => {
                    socket.emit("output" , msg );
                })

                console.log("connected to playground");


                socket.on("file_browser", async( playgroundType, playgroundName , callback) => {

                    //initialize client socket 
                    console.log("requesting for file_browser to : " , `${domain}:${connectionObject_Id_TO_PORT[playgroundName].port}`);
                    socket_client.emit("file_browser" , playgroundType , playgroundName , ({directory_structure}) => {
                        console.log("request sent")
                        console.log(directory_structure , "directory_structure");
                        callback({directory_structure: directory_structure});
                    });
                    
                });
            
                socket.on("providefile", (async (playgroundName , playgroundType , filename ,  callback) => {
        
                    console.log(socket_client , "sending request to socker server");
                    socket_client.emit("providefile" , playgroundName , playgroundType , filename ,  (content) => {
                        console.log('filename' , filename);
                        console.log('content'  , content);
                        
                        callback(content);
                    });
            
                }));
            
                socket.on("execute", (command , playgroundName , playgroundType ) => {
                    
                    console.log("command recieved" , command);
                    socket_client.emit("execute" , command  , playgroundName , playgroundType);
                    console.log("sent execute request---------------");
            
                });
                

        
                socket.on("update-file", async (playgroundName , playgroundType , filenames , callback ) => {
        
                    socket_client.emit("update-file" , playgroundName , playgroundType , filenames , (fileContent) => {
                        callback(fileContent);
                        socket.emit("file-provided" , true);
                        console.log("file updated");
                    });
        
                });
            
                socket.on("saveplayground", async (playgroundName , playgroundType , callback) => {
                    
                    console.log("request recieved");
                    socket_client.emit("saveplayground" , playgroundName , playgroundType , (data) => {
                        console.log(connectionObject_Id_TO_PORT[playgroundName]);
                        console.log(connectionObject_Id_TO_PORT[playgroundName].container_id);
                        removeContainer(connectionObject_Id_TO_PORT[playgroundName].container_id);
                        const port = connectionObject_Id_TO_PORT[playgroundName].port;
                        delete connectionObject_Id_TO_PORT[playgroundName]
                        delete connectionObject_PORT_TO_ID[port];
                        console.log("playground_saved");
                        callback("project_saved");
                        socket_client.disconnect()
                    });
        
                    
        
                });
            });
    
        });

    socket.on("disconnect" , () => {
        console.log("a user disconnected" , socket.id);
    });
});
  
server.listen(port, () => {
        console.log(`app listening on port ${port}`)
})

export default connectionObject_Id_TO_PORT;