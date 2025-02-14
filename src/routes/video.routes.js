import { Router } from "express";
import {
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route("/v/:videoId").get(getVideoById);
router.route("/update/:videoId").post(verifyJWT, updateVideo);
router.route("/delete/:videoId").post(verifyJWT, deleteVideo);
router
  .route("/toggle-publish-status/:videoId")
  .post(verifyJWT, togglePublishStatus);
router.route("/get-all").get(getAllVideos);
export default router;
