
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = require("./app");
// const deviceRoutes = require("./routes/deviceRoutes");
// const groupRoutes = require("./routes/groupRoutes"); 

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect("mongodb://127.0.0.1:27017/easylab")
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB error", err));

// app.use((req, res, next) => {
//   console.log('req: ', req.method, req.url);
  
//   next();
// })
// app.use("/api/devices", deviceRoutes);
// app.use("/api/groups", groupRoutes); // 🆕 NEW

// app.listen(3001, () => console.log("✅ Backend running on port 3001"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
