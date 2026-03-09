// ============================================
// DigiWallet — Digital Wallet Simulation
// Created by Manan Jain
// ============================================

/* --- 1. Transaction Class --- */
function Transaction(type, amount) {
    this.type = type;
    this.amount = amount;

    // Store date as a simple string. 
    var now = new Date();
    this.date = now.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

/* --- 2. Wallet Class --- */
function Wallet(ownerName) {
    var _balance = 0;
    var _transactions = [];
    this.ownerName = ownerName;

    this.topUp = function (amount) {
        if (amount <= 0 || isNaN(amount)) return { success: false, message: "Invalid amount" };
        _balance += amount;
        _transactions.push(new Transaction("Top Up", amount));
        return { success: true, message: "₹" + amount.toFixed(2) + " added!" };
    };

    this.makePayment = function (amount) {
        if (amount <= 0 || isNaN(amount)) return { success: false, message: "Invalid amount" };
        if (amount > _balance) return { success: false, message: "Insufficient Balance!" };
        _balance -= amount;
        _transactions.push(new Transaction("Payment", amount));
        return { success: true, message: "Payment Successful!" };
    };

    this.getBalance = function () { return _balance; };
    this.getHistory = function () { return [..._transactions]; };
}

/* --- 3. UI and Logic --- */
var myWallet = null;

// Elements
var login = document.getElementById("login");
var wallet = document.getElementById("wallet");
var balText = document.getElementById("bal");
var modal = document.getElementById("modal");
var iconBox = document.getElementById("icon-box");
var symbol = document.getElementById("symbol");
var modalAmt = document.getElementById("modal-amt");
var modalStat = document.getElementById("modal-status");
var msgBox = document.getElementById("msg-box");

// Simple Toast Notification
var msgTimer;
function showMsg(msg, type) {
    if (msgTimer) clearTimeout(msgTimer);

    var msgText = document.getElementById("msg-text");
    var msgIcon = document.getElementById("msg-icon");

    msgText.textContent = msg;
    msgIcon.textContent = type === "success" ? "✓" : "✕";

    msgBox.className = "toast show toast-" + type;
    msgTimer = setTimeout(() => { msgBox.className = "toast hidden"; }, 3000);
}

// Success/Error Modal Logic
function showModal(type, amount, msg) {
    // Reset symbols and colors
    symbol.textContent = type === "success" ? "✔" : "✖";
    iconBox.className = "icon-box " + (type === "success" ? "" : "error");
    modalAmt.textContent = "₹" + amount.toFixed(2);
    modalStat.textContent = msg;

    modal.classList.remove("hidden");
    var ripple = document.getElementById("ripple");
    ripple.className = "ripple-ring ripple-go " + (type === "success" ? "ripple-green" : "ripple-red");

    // Auto-hide after 2 seconds
    setTimeout(() => {
        modal.classList.add("hidden");
        ripple.className = "ripple-ring";
    }, 2200);
}

// Forms
document.getElementById("start-form").addEventListener("submit", (e) => {
    e.preventDefault();
    var name = document.getElementById("name-in").value.trim();
    if (!name) return;
    myWallet = new Wallet(name);
    document.getElementById("user-name").textContent = "Hi, " + name + " 👋";
    document.getElementById("owner-name").textContent = name + "'s Wallet";
    login.classList.add("hidden");
    wallet.classList.remove("hidden");
    updateUI();
});

document.getElementById("topup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    var amtIn = document.getElementById("topup-in");
    var amt = parseFloat(amtIn.value);
    var res = myWallet.topUp(amt);

    if (res.success) {
        showModal("success", amt, "Added to Wallet");
        showMsg("₹" + amt.toFixed(2) + " added successfully!", "success");
        amtIn.value = "";
        updateUI();

        var card = document.getElementById("bal-card");
        card.classList.add("balance-pop");
        setTimeout(() => card.classList.remove("balance-pop"), 400);
    } else {
        showMsg(res.message, "error");
    }
});

document.getElementById("pay-form").addEventListener("submit", (e) => {
    e.preventDefault();
    var amtIn = document.getElementById("pay-in");
    var amt = parseFloat(amtIn.value);
    var res = myWallet.makePayment(amt);

    if (res.success) {
        showModal("success", amt, "Payment Sent");
        showMsg("Payment of ₹" + amt.toFixed(2) + " successful!", "success");
        amtIn.value = "";
        updateUI();

        var card = document.getElementById("bal-card");
        card.classList.add("balance-pop");
        setTimeout(() => card.classList.remove("balance-pop"), 400);
    } else {
        showMsg(res.message, "error");
        document.getElementById("bal-card").classList.add("shake");
        amtIn.classList.add("input-error");
        setTimeout(() => {
            document.getElementById("bal-card").classList.remove("shake");
            amtIn.classList.remove("input-error");
        }, 600);
        showModal("error", amt, res.message);
    }
});

function updateUI() {
    balText.textContent = "₹" + myWallet.getBalance().toFixed(2);
    renderHistory();
}

function renderHistory() {
    var historyData = myWallet.getHistory();
    var list = document.getElementById("history");
    var none = document.getElementById("none");
    document.getElementById("count").textContent = historyData.length + " transactions";

    if (historyData.length === 0) {
        none.classList.remove("hidden");
        list.classList.add("hidden");
        return;
    }

    none.classList.add("hidden");
    list.classList.remove("hidden");
    list.innerHTML = "";

    [...historyData].reverse().forEach(tx => {
        var isUp = tx.type === "Top Up";
        var item = document.createElement("li");
        item.className = "item";
        item.innerHTML = `
            <div class="left">
                <div class="icon-tx ${isUp ? 'topup' : 'payment'}">${isUp ? '↑' : '↓'}</div>
                <div class="info">
                    <span class="type">${tx.type}</span>
                    <span class="date">${tx.date}</span>
                </div>
            </div>
            <div class="right">
                <span class="val ${isUp ? 'topup' : 'payment'}">${isUp ? '+' : '−'}₹${tx.amount.toFixed(2)}</span>
            </div>
        `;
        list.appendChild(item);
    });
}