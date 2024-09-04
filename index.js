const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { checkResourceOverload } = require("./src/helpers/check.connect");
const config = require("./src/configs/configs");

const app = express();

app.use(cookieParser()); // For parsing cookies
app.use(express.json()); // For parsing JSON request bodies

checkResourceOverload();

app.use(cors({ ...config.app.corsConfig }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

app.use("/auth", require("./src/routes/auth.routes"));
app.use("/debug", require("./src/routes/debug.routes"));
app.use("/category", require("./src/routes/category.routes"));
app.use("/admin", require("./src/routes/admin.routes"));
app.use("/product", require("./src/routes/product.routes"));
app.use("/image", require("./src/routes/image.routes")); // separate it for now

app.listen(config.app.port, () => {
    console.log(`nodejs backend listening on port=${config.app.port}`);
});
