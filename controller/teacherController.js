import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

const teacherController = {
    createTeacher : async (req , res) => {

        const email = req.body.useremail;
        const teacherName = req.body.name;
        const teacherExp = req.body.exp;
        
        if(req.headers.authorization.replace("Bearer "  === process.env.token)){
            //store the repl data
            async function main() {

                const data = await prisma.user.findUnique({
                  where : {
                    useremail : email
                  }
                })
                
                console.log(data);
                if(data){

                  return 0;
                }else{
                  await prisma.user.create({
                      data: {
                          useremail: email,
                          username : teacherName,
                          experience : teacherExp,
                          role : "teacher"
                      },
                  })
                }

                
            }
              
              main()
                .then(async () => {
                  res.status(200).json({
                    msg : "successful"
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
} 

export default teacherController;