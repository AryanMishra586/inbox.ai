import { glob } from "glob";
import passport from "passport";
import path from "path";

const basename = path.basename(__filename);

const strategies = glob.sync(`${__dirname}/**/*.js`).filter((file) => {
  const fileName = file.split("/");
  return (
    fileName[fileName.length - 1].indexOf(".") !== 0 &&
    fileName[fileName.length - 1] !== basename &&
    fileName[fileName.length - 1].slice(-3) === ".js"
  );
});

strategies.forEach((file) => {
  const strategyInitializer = require(file).default;
  strategyInitializer(passport);
});

export default passport;
