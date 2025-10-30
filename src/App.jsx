// import React, { useEffect, useMemo, useState } from "react";
// import io from "socket.io-client";
// import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";

// const App = () => {
//   const [message, setMessage] = useState("");
//   const [room, setRoom] = useState("");
//   const [socketId, setSocketId] = useState("");
//   const [messages, setMessages] = useState([]);
//   console.log("🚀 ~ App ~ messages:", messages)
//   const socket =  useMemo(() => io("http://localhost:3000"), []) ;

//   useEffect(() => {
//     socket.on("connect", () => {
//       setSocketId(socket.id);
//       console.log("Connected to server with id:", socket.id);
//     });

//     socket.on("welcome", (m) => {
//       console.log(m);
//     });
//     socket.on("recived-message", (data) => {
//       setMessages((prevMessages) => [...prevMessages, data]);
//     })

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     socket.emit("message",{message , room});
//     setMessage("");
//   };

//   return (
//     <>
//       <Container maxWidth="sm">
//         <Box sx={{height: 500}}/>
//        <Typography variant="h4" component="div" gutterBottom>
//         {socketId}
//        </Typography>
//        <form onSubmit={handleSubmit}>
//         <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Message" variant="outlined" />
//         <TextField value={room} onChange={(e) => setRoom(e.target.value)} id="outlined-basic" label="room" variant="outlined" />
//         <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>Send</Button>
//        </form>
//        <Stack>
//         {messages.map((msg , index) => (
//           <Typography key={index} variant="body1" component="div" gutterBottom>
//             {msg}
//           </Typography>
//         ))}
//        </Stack>
//       </Container>
//     </>
//   );
// };

// export default App;

import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

const App = () => {
  const [socketId, setSocketId] = useState("");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);

  const socket = useMemo(() => io("https://chat-applicatio-backend.onrender.com"), []);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.on("user-list", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => {
        const updated = { ...prev };
        if (!updated[data.from]) updated[data.from] = [];
        updated[data.from].push(data);
        return updated;
      });
    });

    return () => socket.disconnect();
  }, [socket]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    socket.emit("join", username);
    setJoined(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const msgData = { to: selectedUser, message };

    socket.emit("private-message", msgData);

    setMessages((prev) => {
      const updated = { ...prev };
      if (!updated[selectedUser]) updated[selectedUser] = [];
      updated[selectedUser].push({
        message,
        sender: "You",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      return updated;
    });

    setMessage("");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#e5ddd5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 800,
          height: 600,
          display: "flex",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {!joined ? (
          <Box
            component="form"
            onSubmit={handleJoin}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ECE5DD",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome to WhatsApp Clone
            </Typography>
            <TextField
              label="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 2,
                width: "70%",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#128C7E",
                "&:hover": { backgroundColor: "#075E54" },
              }}
            >
              Join Chat
            </Button>
          </Box>
        ) : (
          <>
            {/* Sidebar (Online Users) */}
            <Box
              sx={{
                width: 280,
                backgroundColor: "#f0f0f0",
                borderRight: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#075E54",
                  color: "white",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">{username}</Typography>
              </Box>
              <Typography sx={{ p: 1, fontWeight: "bold" }}>Online Users</Typography>
              <Divider />
              <List sx={{ flex: 1, overflowY: "auto" }}>
                {Object.entries(onlineUsers)
                  .filter(([id]) => id !== socketId)
                  .map(([id, name]) => (
                    <ListItem
                      button
                      key={id}
                      selected={selectedUser === id}
                      onClick={() => setSelectedUser(id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#25D366" }}>
                          {name[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={name} secondary="Online" />
                    </ListItem>
                  ))}
              </List>
            </Box>

            {/* Chat Window */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundImage: `url("https://i.imgur.com/3ZQ3Z6L.png")`,
                backgroundSize: "cover",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#075E54",
                  color: "white",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  {selectedUser ? onlineUsers[selectedUser] : "Select a user"}
                </Typography>
              </Box>

              <Stack sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                {selectedUser &&
                  (messages[selectedUser] || []).map((msg, index) => {
                    const isMine = msg.sender === "You";
                    return (
                      <Box
                        key={index}
                        sx={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          backgroundColor: isMine ? "#DCF8C6" : "white",
                          color: "black",
                          p: "8px 12px",
                          borderRadius: "10px",
                          mb: "8px",
                          maxWidth: "75%",
                          boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography variant="body2">{msg.message}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ float: "right", opacity: 0.6, fontSize: "0.7rem" }}
                        >
                          {msg.time}
                        </Typography>
                      </Box>
                    );
                  })}
              </Stack>

              {selectedUser && (
                <Box
                  component="form"
                  onSubmit={handleSend}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f0f0f0",
                    p: "8px 10px",
                  }}
                >
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="outlined"
                    size="small"
                    placeholder="Type a message"
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderRadius: "25px",
                      "& fieldset": { border: "none" },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: "#128C7E",
                      borderRadius: "50%",
                      minWidth: 45,
                      height: 45,
                      ml: 1,
                      "&:hover": { backgroundColor: "#075E54" },
                    }}
                  >
                    ➤
                  </Button>
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default App;

