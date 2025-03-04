import path from "path";
import { glob } from "glob";
import { Router } from "express";

const basename = path.basename(__filename);

export default (router: Router): void => {
  const files = glob.sync(path.join(__dirname, "**/*.js"));

  files
    .filter((file) => {
      const fileName = path.basename(file);
      return fileName !== basename && fileName.slice(-3) === ".js";
    })
    .forEach((file) => {
      const route = require(file).default;
      route(router);
    });
};
