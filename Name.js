const nameInput = document.getElementById('playerNameInput');
const addBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const startGameBtn = document.getElementById('startGameBtn');
const randomBtn = document.getElementById('randomPlayerBtn');
const moneyInput = document.getElementById('moneyInput');

const STORAGE_KEY_NAMES = 'tetSetupNames';
const STORAGE_KEY_MONEY = 'tetSetupMoney';

function saveData() {
    const names = [];
    playerList.querySelectorAll('.player-name').forEach(span => {
        names.push(span.textContent);
    });
    localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(names));
    if (moneyInput) {
        localStorage.setItem(STORAGE_KEY_MONEY, moneyInput.value);
    }
}

function updatePlayerIds() {
    const allPlayers = playerList.querySelectorAll('li');
    allPlayers.forEach((li, index) => {
        li.querySelector('.player-id').textContent = `${index + 1}. `;
    });
}

function addPlayer(nameArg) {
    let name;
    let isManual = false;
    if (typeof nameArg === 'string') {
        name = nameArg;
    } else {
        name = nameInput.value.trim();
        isManual = true;
    }

    if (name) {
        const li = document.createElement('li');

        const idSpan = document.createElement('span');
        idSpan.className = 'player-id';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = name;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Xóa';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => {
            playerList.removeChild(li);
            updatePlayerIds(); // Cập nhật lại số thứ tự
            saveData();
        };

        li.appendChild(idSpan);
        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);

        playerList.appendChild(li);
        updatePlayerIds(); // Cập nhật số thứ tự cho người vừa thêm

        if (isManual) {
            nameInput.value = '';
            nameInput.focus();
            saveData();
        }
    } else if (isManual) {
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
        saveData();
    });
}

if (randomBtn) {
    randomBtn.addEventListener('click', () => {
        // 1. Lấy danh sách tên hiện tại (bỏ phần số thứ tự cũ)
        const listItems = Array.from(playerList.children);
        if (listItems.length < 2) return; // Cần ít nhất 2 người để trộn

        let currentNames = listItems.map(li => li.querySelector('.player-name').textContent);

        // 2. Trộn ngẫu nhiên mảng tên (Thuật toán Fisher-Yates shuffle)
        for (let i = currentNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentNames[i], currentNames[j]] = [currentNames[j], currentNames[i]];
        }

        // 3. Cập nhật lại tên trong danh sách hiện có
        const allNameSpans = playerList.querySelectorAll('.player-name');
        allNameSpans.forEach((span, index) => {
            span.textContent = currentNames[index];
        });
        saveData();
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
            const name = li.querySelector('.player-name').textContent;
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

function loadData() {
    if (moneyInput) {
        const savedMoney = localStorage.getItem(STORAGE_KEY_MONEY);
        if (savedMoney) moneyInput.value = savedMoney;
    }
    const savedNames = JSON.parse(localStorage.getItem(STORAGE_KEY_NAMES) || '[]');
    savedNames.forEach(n => addPlayer(n));
}
loadData();