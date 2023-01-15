const http = require("http");
const express = require("express");
const app = express();
app.set("view engine", "pug");

app.use(express.static("public"));
// require("dotenv").config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const WebSocket = require("ws");

let keepAliveId;

const wss =
  process.env.NODE_ENV === "production"
    ? new WebSocket.Server({ server })
    : new WebSocket.Server({ port: 5001 });

server.listen(port);
console.log(
  `Server started on port ${process.env.PORT} in stage ${process.env.NODE_ENV}`,
);

wss.on("connection", function (ws, req) {
  console.log("Connection Opened");
  console.log("Client size: ", wss.clients.size);

  if (wss.clients.size === 1) {
    console.log("first connection. starting keepalive");
    keepServerAlive();
  }

  ws.on("message", (data) => {
    if (isJSON(data)) {
      const currData = JSON.parse(data);
      broadcast(ws, currData, false);
    } else if (typeof currData === "string") {
      if (currData === "pong") {
        console.log("keepAlive");
        return;
      }
      broadcast(ws, currData, false);
    } else {
      console.error("malformed message", data);
    }
  });

  ws.on("close", (data) => {
    console.log("closing connection");

    if (wss.clients.size === 0) {
      console.log("last client disconnected, stopping keepAlive interval");
      clearInterval(keepAliveId);
    }
  });
});

// Implement broadcast function because of ws doesn't have it
const broadcast = (ws, message, includeSelf) => {
  if (includeSelf) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};

const isJSON = (message) => {
  try {
    const obj = JSON.parse(message);
    return obj && typeof obj === "object";
  } catch (err) {
    return false;
  }
};

/**
 * Sends a ping message to all connected clients every 50 seconds
 */
const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("ping");
      }
    });
  }, 50000);
};

//////////////////////////////////
var canvas,
  ctx,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;

var x = "black",
  y = 2;

function init() {
  console.log("kokotpicauholica");
  canvas = document.getElementById("can");
  canvas.width = document.body.clientWidth - 4;
  canvas.height = document.body.clientHeight - 4;
  ctx = canvas.getContext("2d");
  w = canvas.width;
  h = canvas.height;

  canvas.addEventListener(
    "mousemove",
    function (e) {
      console.log("mousemove");
      findxy("move", e);
    },
    false,
  );
  canvas.addEventListener(
    "mousedown",
    function (e) {
      console.log("mousedown");
      findxy("down", e);
    },
    false,
  );
  canvas.addEventListener(
    "mouseup",
    function (e) {
      console.log("mouseup");
      findxy("up", e);
    },
    false,
  );
  canvas.addEventListener(
    "mouseout",
    function (e) {
      console.log("mouseout");
      findxy("out", e);
    },
    false,
  );

  canvas.addEventListener(
    "touchstart",
    function (e) {
      console.log("touchsart");
      findxy("down", e);

      foo();
    },
    false,
  );
  canvas.addEventListener(
    "touchmove",
    function (e) {
      console.log("touchmove", flag, e);
      let touch = e.touches[0];
      const mouseEvent = new Event("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      findxy("move", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      //canvas.dispatchEvent(mouseEvent);
    },
    false,
  );
}

//////////////////////////////////

const html = `<html>
<script type="text/javascript">
var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;
    
var ws;



function init() {
    ws = new WebSocket('wss://brave-pink-trousers.cyclic.app/:443');
    ws.addEventListener('open', () => {
        console.log('opened');
    });

    ws.addEventListener('message', (message) => {
        console.log(JSON.stringify(message));
        if (message == 'ping') {
          ws.send('pong');
        }
    });

    ws.addEventListener('open', () => {
        console.log('error');
    });

    ws.addEventListener('close', () => {
        console.log('closed');
    });



    canvas = document.getElementById('can');
    canvas.width = document.body.clientWidth-4;
    canvas.height = document.body.clientHeight-4; 
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        console.log('mousemove')
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        console.log('mousedown')
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        console.log('mouseup')
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        console.log('mouseout')
        findxy('out', e)
    }, false);

    canvas.addEventListener("touchstart", function (e) {
        console.log('touchsart')
        findxy('down', e)
    }, false);
    canvas.addEventListener("touchmove", function (e) {
        console.log('touchmove', flag, e)
        let touch = e.touches[0];
        console.log('relative width: ', touch.clientX/w);
        console.log('relative height: ',touch.clientY/h);
        ws.send(JSON.stringify({"tx": touch.clientX/w, "ty": touch.clientY/h}));
        const mouseEvent = new Event("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        findxy('move', {
            clientX: touch.clientX,
            clientY: touch.clientY
        })
        //canvas.dispatchEvent(mouseEvent);
    }, false);
}

function draw() {
    console.log('drawing', prevX, prevY, currX, currY);
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    ws.send(JSON.stringify({"tx": -1, "ty": -1}));
    ctx.clearRect(0, 0, w, h);
    //document.getElementById("canvasimg").style.display = "none";
}

function findxy(res, e) {
    console.log('findingxy');
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        console.log('findinf moving');
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}
</script>
<style>
    html,body {
        padding: 0;
        margin: 0;
        overflow: hidden;
    }
</style>
<body onload="init()">
    <canvas id="can" style="border:2px solid;"></canvas>
    <input type="button" value="1" id="1" size="23" onclick="send(JSON.stringify({"tone":31}))" style="position:absolute;top:55%;left:15%;height:20px;widt:20px;">
    
    <input type="button" value="2" id="2" size="23" onclick="send(JSON.stringify({"tone":36})" style="position:absolute;top:60%;left:15%;height:20px;widt:20px;">
    
    <input type="button" value="3" id="3" size="23" onclick="send(JSON.stringify({"tone":34}))" style="position:absolute;top:65%;left:15%;height:20px;widt:20px;">
    
    <input type="button" value="4" id="4" size="23" onclick="send(JSON.stringify({"tone":39}))" style="position:absolute;top:70%;left:15%;height:20px;widt:20px;">
    
    <input type="button" value="5" id="5" size="23" onclick="send(JSON.stringify({"tone":36}))" style="position:absolute;top:75%;left:15%;height:20px;widt:20px;">
    
    <input type="button" value="6" id="6" size="23" onclick="send(JSON.stringify({"tone":41}))" style="position:absolute;top:80%;left:15%;height:20px;widt:20px;">
</body>
</html>`;

app.get("/", (req, res) => {
  res.send(html);
});
