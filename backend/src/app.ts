import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import invoiceRoutes from "./routes/invoice.routes";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Invoice Analyzer Backend is running"
    });
});

export default app;