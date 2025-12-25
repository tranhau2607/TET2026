const input = document.getElementById("moneyInput");
const startBtn = document.getElementById("startBtn");
const cardsEl = document.getElementById("cards");

/* ===== FORMAT INPUT ===== */
input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "");
    input.value = v ? Number(v).toLocaleString("vi-VN") : "";
});

/* ===== SHUFFLE ===== */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/* ===== SPLIT MONEY HOÀN CHỈNH ===== */
function splitMoneyEvent(totalK) {
    let result = [];

    // 1️⃣ MIN = 1k
    result.push(1);
    let remainMoney = totalK - 1;

    // 2️⃣ MAX 30–40%
    let maxPercent = 0.3 + Math.random() * 0.1;
    let MAX = Math.floor(totalK * maxPercent);
    if (MAX >= remainMoney) MAX = remainMoney;
    result.push(MAX);
    remainMoney -= MAX;

    // 3️⃣ 2 ô 2–10k, khác nhau
    let smallSet = new Set();
    let smallValues = [];
    for (let i = 0; i < 2; i++) {
        let maxVal = Math.min(10, remainMoney - (6 - i)); // còn 6 ô lớn
        if (maxVal < 2) maxVal = 2;
        let v;
        do {
            v = 2 + Math.floor(Math.random() * (maxVal - 1));
        } while (smallSet.has(v));
        smallSet.add(v);
        smallValues.push(v);
        remainMoney -= v;
    }

    // 4️⃣ 6 ô ≥11k, khác nhau, cách nhau ít nhất 2k
    let largeSlots = 6;
    let minLarge = 11;
    let step = 2; // khoảng cách tối thiểu
    let largeValues = [];
    for (let i = 0; i < largeSlots; i++) {
        largeValues.push(minLarge + i * step);
    }

    // tính tổng dãy cơ bản
    let sumBase = largeValues.reduce((a,b)=>a+b,0);
    let diff = remainMoney - sumBase;

    // phân bổ phần dư từ ô lớn nhất xuống
    for (let i = largeSlots - 1; diff > 0; i--, i = i >= 0 ? i : largeSlots - 1) {
        largeValues[i]++;
        diff--;
    }

    // ghép tất cả
    result = result.concat(smallValues, largeValues);

    // shuffle toàn bộ 10 ô
    shuffle(result);
    return result;
}

/* ===== INIT GAME ===== */
function initGame() {
    let raw = input.value.replace(/\D/g, "");
    if (!raw) {
        alert("Vui lòng nhập tổng tiền");
        return;
    }

    let total = Number(raw);
    if (total < 10000) {
        alert("Tổng tiền tối thiểu 10.000đ");
        return;
    }

    let totalK = Math.floor(total / 1000);
    let values = splitMoneyEvent(totalK);

    cardsEl.innerHTML = "";

    values.forEach((moneyK) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face front">
                    <div class="symbol">🧧</div>
                    <div class="title">LÌ XÌ</div>
                </div>

                <div class="card-face back">
                    <p class="message">Chúc mừng năm mới 2026!</p>
                    <p class="money">${(moneyK * 1000).toLocaleString("vi-VN")} VNĐ</p>
                    <div class="sparkle"></div>
                </div>
            </div>
        `;

        card.onclick = () => {
            if (card.dataset.revealed === '1') return;
            card.dataset.revealed = '1';
            card.classList.add("flipped", "reveal");
            setTimeout(() => card.classList.remove("reveal"), 700);

            const conf = document.createElement('div');
            conf.className = 'mini-confetti';
            card.appendChild(conf);
            setTimeout(() => conf.remove(), 900);
        };

        cardsEl.appendChild(card);
    });
}

startBtn.onclick = initGame;

/* ===== FIREWORKS BACKGROUND ===== */
(function() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    Object.assign(canvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "-1",
        pointerEvents: "none"
    });

    const ctx = canvas.getContext("2d");
    let cw = canvas.width = window.innerWidth;
    let ch = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        cw = canvas.width = window.innerWidth;
        ch = canvas.height = window.innerHeight;
    });

    class Firework {
        constructor() {
            // Chọn ngẫu nhiên 1 trong 4 cạnh để bắn
            const edge = Math.floor(Math.random() * 4); 
            // 0: Top, 1: Right, 2: Bottom, 3: Left
            
            if (edge === 0) { // Từ trên xuống
                this.x = Math.random() * cw;
                this.y = -10;
            } else if (edge === 1) { // Từ phải sang
                this.x = cw + 10;
                this.y = Math.random() * ch;
            } else if (edge === 2) { // Từ dưới lên
                this.x = Math.random() * cw;
                this.y = ch + 10;
            } else { // Từ trái sang
                this.x = -10;
                this.y = Math.random() * ch;
            }

            // Mục tiêu ngẫu nhiên trên toàn màn hình
            this.tx = 50 + Math.random() * (cw - 100);
            this.ty = 50 + Math.random() * (ch - 100);

            // Tính góc và tốc độ
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            this.angle = Math.atan2(dy, dx);
            this.speed = 5 + Math.random() * 4; // Tốc độ nhanh hơn chút
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            
            this.hue = Math.floor(Math.random() * 360);
            this.trail = [];
        }
        update(index) {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 4) this.trail.shift();
            this.x += this.vx;
            this.y += this.vy;
            
            // Tính khoảng cách tới mục tiêu
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Nổ khi đến gần mục tiêu
            if (dist < this.speed) {
                createParticles(this.x, this.y, this.hue);
                fireworks.splice(index, 1);
            } else if (this.x < -100 || this.x > cw + 100 || this.y < -100 || this.y > ch + 100) {
                // Xóa nếu bay ra ngoài quá xa (trường hợp lỗi)
                fireworks.splice(index, 1);
            }
        }
        draw() {
            ctx.beginPath();
            if(this.trail.length) {
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for(let p of this.trail) ctx.lineTo(p.x, p.y);
                ctx.lineTo(this.x, this.y);
            }
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.hue = hue;
            this.angle = Math.random() * Math.PI * 2;
            // Tốc độ nổ ngẫu nhiên hơn để tạo hình cầu tự nhiên
            this.speed = Math.random() * 6 + 1;
            this.friction = 0.95;
            this.gravity = 0.15; // Trọng lực mạnh hơn chút cho hạt rơi
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01; // Tan chậm hơn
        }
        update(index) {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            if (this.alpha <= 0) particles.splice(index, 1);
        }
        draw() {
            // Thêm độ sáng (lightness) 60% để màu tươi hơn
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const fireworks = [];
    const particles = [];

    function createParticles(x, y, hue) {
        for (let i = 0; i < 80; i++) { // Tăng số lượng hạt
            particles.push(new Particle(x, y, hue));
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = 'lighter';
        if (Math.random() < 0.03) fireworks.push(new Firework());
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update(i);
            fireworks[i].draw();
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(i);
            particles[i].draw();
        }
    }
    loop();
})();
