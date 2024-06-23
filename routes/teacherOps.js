import {Router} from 'express';
import teacherController from "../controller/teacherController.js";

const router = Router();

router.post("/createTeacher" ,  teacherController.createTeacher);


export default router ;

