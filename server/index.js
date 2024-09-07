const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const userRoutes=require("./routes/userRouter.js")
const messageRoute=require("./routes/messagesRoute.js")
const socket=require('socket.io')

const app=express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use('/api/auth',userRoutes)
app.use('/api/messages',messageRoute)
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Db connected successfully");
}).catch((err)=>{
    console.log("ERROR IS  ",err.message)
})

const server=app.listen(process.env.PORT,()=>{
    console.log("Succcessfully running   ",process.env.PORT)
});
// Socket .io
const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on('add-user', (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            io.to(sendUserSocket).emit('msg-receive', data.message); // Corrected
        }
    });
});
