import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy"

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: `hello from Backend{Gateway}`,
  });
});

app.use("/auth", proxy("http://localhost:8001"));
app.use("/order", proxy("http://localhost:8002"));
app.use("/product", proxy("http://localhost:8003"));


app.listen(port, () => {
  console.log(`server started ${port}`);
});
