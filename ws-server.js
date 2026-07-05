const WebSocket = require('ws');
const mysql = require('mysql2/promise');

// const wss = new WebSocket.Server({ port: 8090 });
const PORT = process.env.PORT || 8090;
const wss = new WebSocket.Server({ port: PORT });


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'livechat'
});

// DB保存して insertId を返す
async function saveToDB(user, msg, time) {
    const [result] = await db.query(
        "INSERT INTO messages (user_name, message, created_at) VALUES (?, ?, ?)",
        [user, msg, time]
    );
    return result.insertId;   // ★ これが重要
}

// 全員に送信
function broadcast(data) {
    const json = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}

wss.on('connection', ws => {

    ws.on('message', async msg => {
        const data = JSON.parse(msg);

        // -------------------------
        // DELETE
        // -------------------------
        if (data.type === "delete") {

            await db.query("DELETE FROM messages WHERE id = ?", [data.id]);
            console.log("DELETE RECEIVED:", data.id);

            broadcast({
                type: "delete",
                id: data.id
            });

            return;
        }

        // -------------------------
        // JOIN
        // -------------------------
        if (data.type === "join") {
            const time = new Date().toISOString().replace('T',' ').split('.')[0];

            const message = "が参加しました";

            // DB保存 → insertId を取得
            const id = await saveToDB(data.user_name, message, time);

            const payload = {
                id: id,
                user_name: data.user_name,
                message: message,
                created_at: time
            };

            broadcast(payload);
            return;
        }

        // -------------------------
        // MESSAGE
        // -------------------------
        if (data.type === "message") {
            const time = new Date().toISOString().replace('T',' ').split('.')[0];

            const id = await saveToDB(data.user_name, data.message, time);

            const payload = {
                id: id,                    // ★ これが最重要
                user_name: data.user_name,
                message: data.message,
                created_at: time
            };

            broadcast(payload);
            return;
        }
    });

    ws.on('error', err => {
        console.error("WebSocket error:", err);
    });

});

console.log("WebSocket server running on ws://localhost:8090");

