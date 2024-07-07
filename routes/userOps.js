import {Router} from 'express';
import { replController  } from '../controller/replController.js';

const router = Router();

// router.get("/get-playground" , replController.getPlayground);
router.post('/create-playground' , replController.createPlayground);

router.get('/get-playground' , replController.getPlayground);

router.get('/get-playground-list/:email' , replController.getPlaygroundList);

router.get("/getUser/:email" , replController.getUser);



export default router ;