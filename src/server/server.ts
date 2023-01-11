import express, { Express } from "express";
import { handleErrorMiddleware } from "middlewares/error-handler.middleware";
// // import versioning from "middlewares/versioning";
// import versionRoutes from 'express-routes-versioning';
import routes from "routes";

export function setupServer(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", routes);
 
  // app.use('/api',versionRoutes()({
  //   "v1": respondV1,
  //   "v2": respondV2,
  //   "v3": respondV3
  // }));

//   app.get('/test', versionRoutes()({
//     "v1": respondV1,
//     "v2": respondV2,
//     "v3": respondV3
//  }));

  app.use(handleErrorMiddleware);

  return app;
}

// function NoMatchFoundCallback(_: Request, res: Response, __: NextFunction) {
//   res.status(404).send({ message: 'version not found' })
// }

// function respondV1(_: Request, res: Response, __: NextFunction) {
//  res.status(200).send('ok v1');
// }

// function respondV2(_: Request, res: Response, __: NextFunction) {
//  res.status(200).send('ok v2');
// }
// // //this callback is always called here as req.version is provided as 3.0.0
// function respondV3(_: Request, res: Response, __: NextFunction) {
//  res.status(200).send('ok v3');
// }