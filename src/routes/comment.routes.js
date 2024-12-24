import { Router } from "express";
import {
  getVideoComments,
  addComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/get/:videoId").get(getVideoComments);
router.route("/add").post(addComment);

export default router;
