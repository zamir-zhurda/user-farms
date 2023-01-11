import { Router } from "express";
import auth from "./auth.routes";
import userRouteV1 from "./user.routes";
import userRouteV2 from "./user.routes.v2";
const routes = Router();

routes.use("/auth", auth);
routes.use("/v1/users", userRouteV1);
routes.use("/v2/users", userRouteV2);

export default routes;
