import { RequestHandler, Router } from "express";
import { verifyToken } from "middlewares/auth";
import { UsersController } from "modules/users/users.controller";

const router = Router();
const usersController = new UsersController();

router.post("/", usersController.create.bind(usersController) as RequestHandler);
router.get("/fetch",verifyToken, usersController.fetch.bind(usersController) as RequestHandler);
router.get("/fetch/farms",verifyToken ,usersController.fetchAllFarms.bind(usersController) as RequestHandler);
router.patch("/:userId/update/farms",verifyToken, usersController.updateFarm.bind(usersController) as RequestHandler);
router.delete("/:userId/delete/farms/:farmId",verifyToken, usersController.deleteFarm.bind(usersController) as RequestHandler);
router.patch("/update",verifyToken, usersController.update.bind(usersController) as RequestHandler)
router.post("/:userId/farms/create",verifyToken, usersController.createFarm.bind(usersController) as RequestHandler)
router.delete("/delete",verifyToken, usersController.deleteAllUsers.bind(usersController) as RequestHandler);

//this way isn't working!
// router.route('/').post( versioning({'v1/': usersController.create.bind(usersController) as RequestHandler }));


export default router;
