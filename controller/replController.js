import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()



export const replController = {

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

      if(req.headers.authorization.replace("Bearer "  === process.env.token)){
 
         await getProject(req.headers.replid);
         res.status(200).json({
             msg : "successfull!"
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