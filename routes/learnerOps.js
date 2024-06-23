import {Router} from 'express';
import learnerController from "../controller/learnerController.js";

const router = Router();

router.post("/createLearner" ,  learnerController.createLearner);


export default router ;
