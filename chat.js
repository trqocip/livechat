let ws = null;
let user = null;

// -------------------------
// 履歴読み込み（JOIN も含める）
// -------------------------
function loadHistory() {
    fetch("load.php")
        .then(res => res.json())
        .then(rows => {
            rows.forEach(row => {
                addMessage(row);   // ★ JOIN を除外しない
            });
        });
}

// -------------------------
// WebSocket 初期化
// -------------------------
function initChat() {
    if (ws) return;

    user = document.getElementById('user').value.trim();
    if (!user) return;

   // ws = new WebSocket("ws://localhost:8090");
const ws = new WebSocket('wss://livechat-xv67.onrender.com');

    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: "join",
            user_name: user
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // DELETE
        if (data.type === "delete") {
            // Remove DOM element
            const target = document.querySelector(`[data-id='${data.id}']`);
            if (target) {
                target.remove();
            } else {
                console.warn("DELETE: element not found in DOM:", data.id);
            }

            return;
        }
        // JOIN / MESSAGE
        addMessage(data);
    };
}

// -------------------------
// メッセージ追加
// -------------------------

function addMessage(data) {
    const div = document.createElement("div");
    div.classList.add("message");

    // 自分のメッセージなら右側
    if (data.user_name === user) {
        div.classList.add("me");
    } else {
        div.classList.add("other");
    }

    // ★ DB の id をそのまま DOM に付ける
    div.dataset.id = data.id;

    // ★ 自分のメッセージだけ削除ボタン
    const deleteBtn = (data.user_name === user)
        ? `<button class="delete-btn" onclick="deleteMsg(${data.id})">削除</button>`
        : "";

    div.innerHTML = `
        <div class="msg-user">${data.user_name}</div>
        <div class="msg-text">${data.message}</div>
        ${deleteBtn}
        <div class="msg-time">${data.created_at}</div>
    `;

    document.getElementById("chat").appendChild(div);
}

// -------------------------
// メッセージ送信
// -------------------------
function sendMsg() {
    const user = document.getElementById('user').value.trim();
    const msg  = document.getElementById('msg').value;

    if (!msg || !user || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
        type: "message",
        user_name: user,
        message: msg
    }));

    document.getElementById('msg').value = "";
}

// -------------------------
// 削除送信
// -------------------------
function deleteMsg(id) {
    ws.send(JSON.stringify({
        type: "delete",
        id: id
    }));

}
