import { exec } from 'node:child_process';

export function removeContainer(id){
    console.log(id);
    exec(`curl --unix-socket /var/run/docker.sock -X DELETE http://localhost/v1.44/containers/${id}?force=true`,
        (error, stdout, stderr) => {
        if (error) {
        console.error(`exec error: ${error}`);
        return;
        }
        
        if(!stdout){
            console.log("removed container with container id : " , id);
            return ;
        };

    });
}


export async function createAndRunContainer(port ,  playground_id){

    let id ;
    const createCommand = `curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json"   -d '{"Image" : "sagarsingh2003/codearena-server:v0.0.2" , "HostConfig" : {"PortBindings" : {"3333/tcp" : [{"HostPort" : "${port}"}] , "5555/tcp" : [{"HostPort" : "${port - 1025 + 25088}"}]}}}'   -X POST http://localhost/v1.44/containers/create?name="${playground_id}"`;
    const {stdout , error} =  await new Promise( (resolve , reject) => {
        exec(createCommand, async (error, stdout, stderr) => {
        
        if (error) {
            reject(error);
        }
        
        id = JSON.parse(stdout).Id;


        if(JSON.parse(stdout).message){
            console.error("error" , JSON.parse(stdout).message);
            reject(JSON.parse(stdout).message);
        }else if(id){
            const startCommand = `curl --unix-socket /var/run/docker.sock -X POST http://localhost/v1.44/containers/${id}/start`;
            const {stdout2 , error} = await new Promise((resolve , reject) => {exec(startCommand ,
                (error, stdout, stderr) => {
                    
                console.log("starting container" , stdout , startCommand);
                if (error) {
                    reject(error);
                }else{
                    resolve({stdout , error})
                }

            })});


            if(!stdout2){
                console.log("container created with id : " , id);
                console.log(stdout);
                resolve({stdout , error});
            }

        }


    });

});
    console.log(stdout);
    if(stdout){
        console.log(JSON.parse(stdout).Id);
        return JSON.parse(stdout).Id ;
    }
}