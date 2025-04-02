import { config } from "dotenv";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/database.js";
import {errorMiddleware} from "./middlewares/error.js";
import userRouter from "./routers/userRouter.js";
import auctionItemRouter from "./routers/auctionItemRoutes.js";
import bidRouter from "./routers/bidRouter.js";
import commissionRouter from "./routers/commissionRouter.js";
import adminRouter from "./routers/adminRouter.js";
import { endedAuctionCron } from "./automation/endedAuctionCron.js";
import { verifyCommissionCron } from "./automation/verifyCommissionCron.js";
import { sendEmail } from "./utils/sendEmail.js";



const app = express();

config({
    path:"./config/.env"
})

app.use(
    cors ({
        origin : [process.env.FRONTEND_URL],
        methods : ["POST", "GET", "PUT", "DELETE"],
        credentials : true
    })
);

app.use (express.json());
app.use (express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
})
)

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/admin", adminRouter);

endedAuctionCron();
verifyCommissionCron();

connection();

app.use(errorMiddleware)

export default app;