import { PrismaClient } from '@prisma/client';
import connectionObject_Id_TO_PORT from "../index.js";
import domain from "../domain.js";

const prisma = new PrismaClient()



export const replController = {

    createPlayground : async(req , res) => {
    
      const playgroundId = req.body.replId;
      const port = connectionObject_Id_TO_PORT[playgroundId].port;
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
  },

    getPlaygroundList : async(req , res) => {
      
      
      if(req.headers.authorization.replace("Bearer " , "")  === process.env.token){

            const email = req.params.email
            async function main() {
              const data = await prisma.repl.findMany({
                where : {
                  useremail : email
                }
              })
              return data
          }
            
            main()
              .then(async (data) => {
                // console.log(data);
                res.status(200).json({
                  playground : data 
                })
              })
              .catch(async (e) => {
                console.error(e)
                res.status(500).json({
                  err : String(e)
                })
                process.exit(1)
          })

      }
    }
    ,
    
    getPlayground : async(req ,res) => {
      
      console.log('request');
      console.log(req.headers.replid , "req.headers.replId");
      const replid = req.headers.replid;
      const port = connectionObject_Id_TO_PORT[replid].port;

      if(req.headers.authorization.replace("Bearer "  === process.env.token)){
 
        fetch(`${domain}:${port}` + "/user/get-playground" , {
            method: "GET",
            headers: {
                "Authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzYWdhciI6InNpbmdoIiwiYXM7bGRramZhO2xzamRrZmxqa2FzZGxmamthcyI6ImFkbGZramFzZDtsa2ZqYTtsc2RqZmFsIn0.NYirkr9paUfUq0UEAe4eE_g2Nn6Dde6Wyu0A3pNONo8",
                "replId" : `${replid}`
            }
        }).then((response) => {
            console.log(response.status);
            if(response.status === 200){
                res.status(200).json({
                    msg : "successfull!"
                })      
            }
        })
        
         
      }else{
        res.status(404).json({  
          msg : "authorization header missing"
        })
      }
    }
    
    , 

    getUser : (req , res) => {

      const email = req.params.email;

          async function main() {

                const data = await prisma.user.findUnique({
                  where : {
                    useremail : email
                  }
                })
                
                return data
                
          }
              
          main()
            .then(async (data) => {
              res.status(200).json({
                msg : "successful",
                data : data
              })
              
            })
            .catch(async (e) => {
              console.error(e)
              
              res.status(500).json({
                err : String(e)
              })
              
              process.exit(1)

            })
            
        }

}