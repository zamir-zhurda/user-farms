import { NextFunction, Response ,Request} from "express";
import { verify } from "jsonwebtoken";
import config from "config/config";

export function verifyToken ( req: Request, res: Response, next: NextFunction): void {
    const token = req.body?.token || req.query?.token || req.headers["x-access-token"];
    console.log("=================================================")
    console.log("token: ",token)  
    console.log("req.body?.token: ",req.body?.token)  
    console.log("req.query?.token: ",req.query?.token)  
    console.log('req.headers["x-access-token"]: ',req.headers["x-access-token"])      
    console.log("================================================")
    if (!token) {
        res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = verify(token, config.JWT_SECRET);     
        console.log("decoded: ",decoded)  
        // req.user = decoded;
        return next();
      } catch (err) {
        //  console.log("[verifyToken] error ",err)
         res.status(401).send("Invalid Token");
      }

}