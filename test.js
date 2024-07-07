
import { exec } from 'node:child_process';

export function removeContainer(id){
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


removeContainer("23591e2fe5a9b718a2df7d33fc981d8eff8289f25cafdda9e328cfcd9a9612eb")

// createAndRunContainer();