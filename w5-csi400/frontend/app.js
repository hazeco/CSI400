// Configuration & State
let API_BASE = localStorage.getItem('csi400_api_base') || 
    (window.location.origin.includes('5500') ? 'http://localhost:3000' : (window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000'));

let currentToken = localStorage.getItem('csi400_jwt_token') || '';
let currentUser = null;
let currentFilterType = '';
let currentSearch = '';
let editingAssetId = null;

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    initApiBaseUrl();
    initAuth();
    loadDashboardData();
    setupEventListeners();
});

// 1. API Base URL Configuration
function initApiBaseUrl() {
    const apiInput = document.getElementById('apiBaseInput');
    if (apiInput) {
        apiInput.value = API_BASE;
    }
}

function saveApiBaseUrl() {
    const apiInput = document.getElementById('apiBaseInput');
    if (apiInput && apiInput.value) {
        API_BASE = apiInput.value.replace(/\/$/, '');
        localStorage.setItem('csi400_api_base', API_BASE);
        alert(`บันทึก API Base URL: ${API_BASE} เรียบร้อยแล้ว`);
        loadDashboardData();
    }
}

// 2. Authentication Management
function initAuth() {
    if (currentToken) {
        try {
            // Parse JWT Payload
            const payload = JSON.parse(atob(currentToken.split('.')[1]));
            currentUser = payload;
            updateAuthUI(true, payload);
        } catch (e) {
            console.error('Failed to parse saved token:', e);
            logout();
        }
    } else {
        updateAuthUI(false);
    }
}

function updateAuthUI(isLoggedIn, user = null) {
    const loginStatusBadge = document.getElementById('loginStatusBadge');
    const userProfileBar = document.getElementById('userProfileBar');
    const quickLoginGroup = document.getElementById('quickLoginGroup');
    const currentTokenEl = document.getElementById('currentTokenDisplay');

    if (isLoggedIn && user) {
        if (loginStatusBadge) {
            loginStatusBadge.className = 'badge badge-success';
            loginStatusBadge.innerText = `เข้าสู่ระบบแล้ว: ${user.username} (${user.role})`;
        }
        if (userProfileBar) {
            userProfileBar.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                    <span>👤 <strong>${user.name}</strong> (${user.organization})</span>
                    <span class="badge badge-primary">Role: ${user.role}</span>
                    <button class="btn btn-secondary btn-sm" onclick="logout()">🚪 ออกจากระบบ (Logout)</button>
                </div>
            `;
        }
        if (quickLoginGroup) quickLoginGroup.style.display = 'none';
        if (currentTokenEl) currentTokenEl.value = currentToken;
    } else {
        if (loginStatusBadge) {
            loginStatusBadge.className = 'badge badge-warning';
            loginStatusBadge.innerText = 'ยังไม่ได้ยืนยันตัวตน (No JWT Token)';
        }
        if (userProfileBar) {
            userProfileBar.innerHTML = `<span style="color:var(--text-muted);">กรุณากดปุ่มด่วนด้านล่างเพื่อรับ JWT Token เข้าใช้งาน Private API</span>`;
        }
        if (quickLoginGroup) quickLoginGroup.style.display = 'flex';
        if (currentTokenEl) currentTokenEl.value = '';
    }
}

async function quickLoginAs(username, password) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentToken = data.token;
            currentUser = data.user;
            localStorage.setItem('csi400_jwt_token', currentToken);
            updateAuthUI(true, data.user);
            showNotification(`เข้าสู่ระบบสำเร็จในฐานะ ${data.user.name}`, 'success');
            loadDashboardData();
        } else {
            showNotification(`Login ไม่สำเร็จ: ${data.message || data.error}`, 'danger');
        }
    } catch (err) {
        showNotification(`เชื่อมต่อเซิร์ฟเวอร์ไม่ได้: ${err.message}`, 'danger');
    }
}

function logout() {
    currentToken = '';
    currentUser = null;
    localStorage.removeItem('csi400_jwt_token');
    updateAuthUI(false);
    showNotification('ออกจากระบบเรียบร้อยแล้ว', 'warning');
    loadDashboardData();
}

// 3. Helper to make Authenticated Requests
async function apiRequest(endpoint, options = {}) {
    const headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

// 4. Load Dashboard Data (Topic: ทรัพย์สินอื่นๆ)
async function loadDashboardData() {
    loadSummaryStats();
    loadAssetsTable();
}

async function loadSummaryStats() {
    if (!currentToken) return;

    try {
        const { ok, data } = await apiRequest('/api/reports/assets/summary');
        if (ok && data.summary) {
            document.getElementById('statTotalAssets').innerText = data.summary.total_assets || '0';
            document.getElementById('statTotalValue').innerText = data.summary.total_asset_value_formatted || '0 บาท';
            document.getElementById('statTotalOwners').innerText = `${data.summary.total_owners || 0} ราย`;

            // Fill individual category counts
            if (data.by_asset_type) {
                const countMap = {};
                data.by_asset_type.forEach(t => countMap[t.asset_type] = t);
                
                setStatCard('machinery', countMap['machinery']);
                setStatCard('valuable', countMap['valuable']);
                setStatCard('financial', countMap['financial']);
                setStatCard('office', countMap['office']);
            }
        }
    } catch (err) {
        console.warn('Failed to load stats:', err);
    }
}

function setStatCard(type, item) {
    const countEl = document.getElementById(`count_${type}`);
    const valEl = document.getElementById(`val_${type}`);
    if (countEl && item) {
        countEl.innerText = `${item.count} รายการ`;
    }
    if (valEl && item) {
        valEl.innerText = `${(item.total_value / 1000000).toFixed(1)} ล้านบาท`;
    }
}

// 5. Assets Table & Filter (Production Management API & Inquiry)
async function loadAssetsTable() {
    const tableBody = document.getElementById('assetsTableBody');
    if (!tableBody) return;

    if (!currentToken) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">
                    🔒 กรุณาเข้าสู่ระบบด้วย JWT Token เพื่อเรียกดูข้อมูล Private Asset API
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center; padding:24px; color:var(--text-secondary);">
                ⏳ กำลังโหลดข้อมูลทรัพย์สิน...
            </td>
        </tr>
    `;

    try {
        let endpoint = `/api/assets?`;
        if (currentFilterType) endpoint += `type=${encodeURIComponent(currentFilterType)}&`;
        if (currentSearch) endpoint += `search=${encodeURIComponent(currentSearch)}&`;

        const { ok, status, data } = await apiRequest(endpoint);

        if (!ok) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:32px; color:#f87171;">
                        ❌ ไม่สามารถเข้าถึงข้อมูลได้ (HTTP ${status}): ${data.message || data.error}
                    </td>
                </tr>
            `;
            return;
        }

        const assets = data.data || [];
        if (assets.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">
                        ไม่พบข้อมูลทรัพย์สินที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = assets.map(a => `
            <tr>
                <td><code>${a.asset_code}</code></td>
                <td>
                    <strong>${escapeHtml(a.name)}</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(a.description || '-')}</div>
                </td>
                <td>
                    <span class="badge ${getBadgeClass(a.asset_type)}">${escapeHtml(a.asset_type_th)}</span>
                </td>
                <td>
                    <strong style="color:#38bdf8;">${Number(a.value).toLocaleString('th-TH')} ฿</strong>
                </td>
                <td>
                    <div>👤 ${escapeHtml(a.owner_name)}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(a.owner_phone || a.owner_email || '')}</div>
                </td>
                <td>
                    <span class="badge ${getStatusBadge(a.status)}">${a.status}</span>
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-secondary btn-sm" onclick="viewAssetDetail(${a.id})" title="ดูรายละเอียด">👁️</button>
                        <button class="btn btn-secondary btn-sm" onclick="editAssetModal(${a.id})" title="แก้ไข">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteAsset(${a.id}, '${escapeHtml(a.name)}')" title="ลบ">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px; color:#f87171;">
                    เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}
                </td>
            </tr>
        `;
    }
}

function filterByType(type) {
    currentFilterType = (currentFilterType === type) ? '' : type;
    
    // Toggle active card CSS
    ['machinery', 'valuable', 'financial', 'office'].forEach(t => {
        const card = document.getElementById(`card_${t}`);
        if (card) {
            if (t === currentFilterType) card.classList.add('active-filter');
            else card.classList.remove('active-filter');
        }
    });

    loadAssetsTable();
}

function applySearch() {
    const searchInput = document.getElementById('assetSearchInput');
    currentSearch = searchInput ? searchInput.value.trim() : '';
    loadAssetsTable();
}

// 6. View & Edit Asset Modal
async function viewAssetDetail(id) {
    const { ok, data } = await apiRequest(`/api/assets/${id}`);
    if (ok && data.data) {
        const a = data.data;
        alert(
            `📦 รายละเอียดทรัพย์สิน:\n` +
            `รหัส: ${a.asset_code}\n` +
            `ชื่อ: ${a.name}\n` +
            `ประเภท: ${a.asset_type_th}\n` +
            `มูลค่า: ${Number(a.value).toLocaleString('th-TH')} บาท\n` +
            `สถานที่จัดเก็บ: ${a.location || '-'}\n` +
            `Serial/Ref: ${a.serial_number || '-'}\n` +
            `สถานะ: ${a.status}\n\n` +
            `👤 ผู้ถือครอง: ${a.owner_name} (ID Card: ${a.owner_id_card})\n` +
            `ติดต่อ: ${a.owner_phone} | ${a.owner_email}`
        );
    }
}

async function editAssetModal(id) {
    const { ok, data } = await apiRequest(`/api/assets/${id}`);
    if (ok && data.data) {
        const a = data.data;
        editingAssetId = a.id;
        document.getElementById('modalTitle').innerText = `✏️ แก้ไขข้อมูลทรัพย์สิน (${a.asset_code})`;
        document.getElementById('assetName').value = a.name;
        document.getElementById('assetType').value = a.asset_type;
        document.getElementById('assetValue').value = a.value;
        document.getElementById('assetCustomerId').value = a.customer_id;
        document.getElementById('assetLocation').value = a.location || '';
        document.getElementById('assetSerial').value = a.serial_number || '';
        document.getElementById('assetDescription').value = a.description || '';
        document.getElementById('assetStatus').value = a.status || 'active';
        openModal();
    }
}

function openCreateModal() {
    editingAssetId = null;
    document.getElementById('modalTitle').innerText = '➕ เพิ่มข้อมูลการถือครองทรัพย์สินใหม่';
    document.getElementById('assetForm').reset();
    openModal();
}

function openModal() {
    document.getElementById('assetModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('assetModal').style.display = 'none';
}

async function handleAssetFormSubmit(e) {
    e.preventDefault();

    const payload = {
        name: document.getElementById('assetName').value,
        asset_type: document.getElementById('assetType').value,
        value: parseFloat(document.getElementById('assetValue').value),
        customer_id: parseInt(document.getElementById('assetCustomerId').value, 10),
        location: document.getElementById('assetLocation').value,
        serial_number: document.getElementById('assetSerial').value,
        description: document.getElementById('assetDescription').value,
        status: document.getElementById('assetStatus').value
    };

    const endpoint = editingAssetId ? `/api/assets/${editingAssetId}` : '/api/assets';
    const method = editingAssetId ? 'PUT' : 'POST';

    const { ok, status, data } = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload)
    });

    if (ok) {
        showNotification(editingAssetId ? 'แก้ไขทรัพย์สินสำเร็จ' : 'เพิ่มทรัพย์สินสำเร็จ', 'success');
        closeModal();
        loadDashboardData();
    } else {
        const errMsg = data.details ? data.details.map(d => `• ${d.message}`).join('\n') : (data.error || 'บันทึกไม่สำเร็จ');
        alert(`เกิดข้อผิดพลาดในการตรวจสอบข้อมูล (Validation Error):\n${errMsg}`);
    }
}

async function deleteAsset(id, name) {
    if (!confirm(`คุณต้องการลบข้อมูลทรัพย์สิน "${name}" ใช่หรือไม่?`)) return;

    const { ok, data } = await apiRequest(`/api/assets/${id}`, { method: 'DELETE' });
    if (ok) {
        showNotification(`ลบข้อมูลสำเร็จ: ${name}`, 'success');
        loadDashboardData();
    } else {
        alert(`ลบไม่สำเร็จ: ${data.error}`);
    }
}

// 7. Reports Center Tab Functions
async function runSummaryReport() {
    const outEl = document.getElementById('reportOutput');
    outEl.innerText = 'กำลังประมวลผลรายงานสรุป...';

    const { ok, status, data } = await apiRequest('/api/reports/assets/summary');
    outEl.innerText = JSON.stringify(data, null, 2);
}

async function runHighValueReport() {
    const minVal = document.getElementById('minValInput').value || 10000000;
    const outEl = document.getElementById('reportOutput');
    outEl.innerText = `กำลังดึงรายการทรัพย์สินมูลค่า >= ${minVal} บาท...`;

    const { ok, status, data } = await apiRequest(`/api/reports/assets/high-value?minValue=${minVal}`);
    outEl.innerText = JSON.stringify(data, null, 2);
}

async function runOwnershipReport() {
    const type = document.getElementById('reportAssetTypeSelect').value;
    const outEl = document.getElementById('reportOutput');
    outEl.innerText = `กำลังค้นหาผู้ถือครองทรัพย์สินประเภท: ${type}...`;

    const { ok, status, data } = await apiRequest(`/api/reports/ownership?assetType=${type}`);
    outEl.innerText = JSON.stringify(data, null, 2);
}

// 8. Security Defense Simulator Functions (CORS, XSS, SQLi)
async function testCorsSimulator(simulatedOrigin) {
    const statusEl = document.getElementById('corsSimStatus');
    const outEl = document.getElementById('corsSimOutput');
    outEl.innerText = `กำลังส่ง Origin: "${simulatedOrigin}" ไปตรวจสอบกับ CORS Middleware ของเซิร์ฟเวอร์...`;

    try {
        const res = await fetch(`${API_BASE}/api/security/simulate-cors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ origin: simulatedOrigin })
        });

        const data = await res.json();
        outEl.innerText = JSON.stringify(data, null, 2);

        if (res.status === 200) {
            statusEl.className = 'badge badge-success';
            statusEl.innerText = `HTTP 200 OK: ได้รับอนุญาต (Whitelisted)`;
        } else if (res.status === 403) {
            statusEl.className = 'badge badge-danger';
            statusEl.innerText = `HTTP 403 Forbidden: ถูกบล็อกโดย CORS Middleware!`;
        } else {
            statusEl.className = 'badge badge-warning';
            statusEl.innerText = `HTTP ${res.status}`;
        }
    } catch (err) {
        statusEl.className = 'badge badge-danger';
        statusEl.innerText = 'CORS Policy Blocked';
        outEl.innerText = 'Error: ' + err.message;
    }
}

async function testXssDefense() {
    const comment = document.getElementById('xssTestInput').value;
    const outEl = document.getElementById('xssOutput');
    outEl.innerText = 'กำลังส่งข้อมูลไปทดสอบการตัดแท็ก XSS...';

    const { ok, data } = await apiRequest('/api/test-xss', {
        method: 'POST',
        body: JSON.stringify({
            username: 'Tester',
            comment: comment
        })
    });

    outEl.innerText = JSON.stringify(data, null, 2);
}

async function testSqliDefense() {
    const username = document.getElementById('sqliTestInput').value;
    const outEl = document.getElementById('sqliOutput');
    outEl.innerText = 'กำลังส่งไปทดสอบ Parameterized Query...';

    const { ok, data } = await apiRequest('/api/test-sqli', {
        method: 'POST',
        body: JSON.stringify({
            username: username
        })
    });

    outEl.innerText = JSON.stringify(data, null, 2);
}

// UI Helpers
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeBtn = document.getElementById(`tabBtn_${tabId}`);
    const activeContent = document.getElementById(`tabContent_${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

function getBadgeClass(type) {
    switch (type) {
        case 'machinery': return 'badge-primary';
        case 'valuable': return 'badge-warning';
        case 'financial': return 'badge-success';
        case 'office': return 'badge-secondary';
        default: return '';
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'active': return 'badge-success';
        case 'pledged': return 'badge-warning';
        case 'under_review': return 'badge-primary';
        case 'liquidated': return 'badge-danger';
        default: return '';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showNotification(msg, type = 'primary') {
    const notif = document.createElement('div');
    notif.className = `badge badge-${type}`;
    notif.style.position = 'fixed';
    notif.style.bottom = '24px';
    notif.style.right = '24px';
    notif.style.padding = '12px 20px';
    notif.style.fontSize = '0.9rem';
    notif.style.zIndex = '9999';
    notif.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    notif.innerText = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}

function setupEventListeners() {
    const assetForm = document.getElementById('assetForm');
    if (assetForm) {
        assetForm.addEventListener('submit', handleAssetFormSubmit);
    }
}
