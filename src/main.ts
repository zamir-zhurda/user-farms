import config from "config/config";
import { Response } from "express";
import { containsDigit, csvFilesIn, transformArray } from "helpers/utils";
import http from "http";
import dataSource from "orm/orm.config";
import { setupServer } from "./server/server";

async function bootstrap(): Promise<http.Server> {
  const app = setupServer();

  await dataSource.initialize();
  const port = config.APP_PORT;

  app.get("/", async (_, res: Response) => {

    let toBeTested: string[]  =  ['super', '20.5', 'test', '23' ];
    let transformedArray = await transformArray(toBeTested);
    console.log("\ntransformedArray: ",transformedArray);

    let path = './files';
    let csvFiles = await csvFilesIn(path);
    console.log("\ncsvFiles: ",csvFiles);

    let firstStringWithoutDigits = 'test-string'
    let secondStringWithDigits = 'test-string123'
    const firstResultContainsDigits = containsDigit(firstStringWithoutDigits);
    const secondResultContainsDigits = containsDigit(secondStringWithDigits);
    console.log(`\n${firstStringWithoutDigits}, containsDigit? ${firstResultContainsDigits}`);
    console.log(`\n${secondStringWithDigits}, containsDigit? ${secondResultContainsDigits}`);

    res.send(`Listening on port: ${port}`);
  });

  const server = http.createServer(app);
  server.listen(port);

  return server;
}

bootstrap();
