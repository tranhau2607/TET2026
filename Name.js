const nameInput = document.getElementById('playerNameInput');
const addBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const startGameBtn = document.getElementById('startGameBtn');
const randomBtn = document.getElementById('randomPlayerBtn');
const moneyInput = document.getElementById('moneyInput');

let playerId = 1;

function addPlayer() {
    const name = nameInput.value.trim();
    if (name) {
        const li = document.createElement('li');
        li.textContent = `${playerId}. ${name}`;
        playerList.appendChild(li);
        playerId++;
        nameInput.value = '';
        nameInput.focus();
    } else {
        alert('Vui lòng nhập tên người chơi!');
    }
}

addBtn.addEventListener('click', addPlayer);

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

/* ===== FORMAT MONEY INPUT ===== */
if (moneyInput) {
    moneyInput.addEventListener("input", () => {
        let v = moneyInput.value.replace(/\D/g, "");
        moneyInput.value = v ? Number(v).toLocaleString("vi-VN") : "";
    });
}

if (randomBtn) {
    randomBtn.addEventListener('click', () => {
        // 1. Lấy danh sách tên hiện tại (bỏ phần số thứ tự cũ)
        const listItems = Array.from(playerList.children);
        if (listItems.length < 2) return; // Cần ít nhất 2 người để trộn

        let currentNames = listItems.map(li => {
            const text = li.textContent;
            return text.substring(text.indexOf('.') + 2); // Lấy phần tên sau dấu chấm
        });

        // 2. Trộn ngẫu nhiên mảng tên (Thuật toán Fisher-Yates shuffle)
        for (let i = currentNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentNames[i], currentNames[j]] = [currentNames[j], currentNames[i]];
        }

        // 3. Xóa danh sách cũ và hiển thị lại với ID mới
        playerList.innerHTML = '';
        playerId = 1;
        currentNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = `${playerId}. ${name}`;
            playerList.appendChild(li);
            playerId++;
        });
    });
}

if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        // Kiểm tra danh sách người chơi
        if (playerList.children.length === 0) {
            alert("Vui lòng nhập danh sách người chơi!");
            nameInput.focus();
            return;
        }

        // Kiểm tra tiền
        let rawMoney = moneyInput.value.replace(/\D/g, "");
        if (!rawMoney) {
            alert("Vui lòng nhập tổng tiền!");
            moneyInput.focus();
            return;
        }
        if (Number(rawMoney) < 10000) {
            alert("Tổng tiền tối thiểu 10.000đ");
            return;
        }

        // Lưu danh sách người chơi vào LocalStorage
        const players = [];
        const listItems = playerList.querySelectorAll('li');
        listItems.forEach(li => {
            // Lấy tên từ chuỗi "ID. Tên" (bỏ phần số thứ tự đầu tiên)
            const text = li.textContent;
            const name = text.substring(text.indexOf('.') + 2); 
            players.push(name);
        });
        localStorage.setItem('tetPlayers', JSON.stringify(players));
        localStorage.setItem('tetTotalMoney', rawMoney);

        startGameBtn.classList.add('loading');
        startGameBtn.innerHTML = 'Đang vào game... <span class="spinner"></span>';
        startGameBtn.disabled = true;
        setTimeout(() => {
            window.location.href = 'LatThe.html';
        }, 1500);
    });
}