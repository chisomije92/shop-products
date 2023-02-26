/** @format */

import express from "express";
import { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import adminRoute from "./routes/admin.js";
import shopRoute from "./routes/shop.js";
import authRoute from "./routes/auth.js";
import path from "path";
import { get404Page } from "./controllers/404.js";
import mongoose from "mongoose";
import sessions from "express-session";
import dotenv from "dotenv";
import User from "./models/user.js";
import MongoDBStore from "connect-mongodb-session";
import csrf from "csurf";
import flash from "connect-flash";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { get500Page } from "./controllers/500.js";
import compression from "compression";
import { CustomError } from "./utils/custom-err.js";

const MongoStore = MongoDBStore(sessions);

dotenv.config();

let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
	conn_string = process.env.MONGO_CONN_STRING;
} else {
	throw new Error("MONGO_CONN_STRING is not set");
}

const __dirname = path.resolve();
const app = express();

const store = new MongoStore({
	uri: conn_string,
	collection: "sessions",
});

const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + "-" + file.originalname);
	},
});

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(compression());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static("images"));
app.use(express.static(path.join(__dirname, "dist")));
app.use(
	sessions({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
app.use(
	multer({
		storage: fileStorage,
		fileFilter: fileFilter,
	}).single("image")
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch((err: Error) => {
			next(next(new CustomError(err.message, 500)));
		});
});

app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoute);
app.get("/500", get500Page);
app.use(get404Page);

app.use(
	(error: CustomError, req: Request, res: Response, next: NextFunction) => {
		res.status(500).render("500", {
			pageTitle: "Error",
			path: "/500",
			isAuthenticated: req.session.isLoggedIn,
		});
	}
);

mongoose
	.connect(conn_string)
	.then(() => {
		app.listen(process.env.PORT || 3000);
	})
	.catch(err => {
		console.log("Error connecting to MongoDB");
		console.log(err);
	});

export default app;
