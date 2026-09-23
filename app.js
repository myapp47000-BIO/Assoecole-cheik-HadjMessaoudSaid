// App State
var currentPage = 'home';
var currentGrade = 'grade1';
var isAdminLoggedIn = false;
var notificationsEnabled = false;
var notifications = [];
var checkedItems = {};
var facebookPosts = [];
var isLoggedIn = false;
var parentData = {};
var parentsDatabase = [];
var pendingVerificationCode = null;
var pendingVerificationPhone = null;

var ADMIN_PHONES = ['213549659691'];

document.addEventListener('DOMContentLoaded', function() {
    try { initApp(); } catch(e) { console.error('Init error:', e); }

    setTimeout(function() {
        try {
            var splash = document.getElementById('splash-screen');
            var mainApp = document.getElementById('main-app');
            var loginPage = document.getElementById('login-page');

            if (splash) { splash.style.display = 'none'; }

            if (isLoggedIn && parentData.name) {
                if (mainApp) mainApp.classList.remove('hidden');
                if (loginPage) loginPage.classList.add('hidden');
            } else {
                if (loginPage) loginPage.classList.remove('hidden');
            }
        } catch(e) {
            var splash2 = document.getElementById('splash-screen');
            var loginPage2 = document.getElementById('login-page');
            if (splash2) splash2.style.display = 'none';
            if (loginPage2) loginPage2.classList.remove('hidden');
        }
    }, 2500);
});

function initApp() {
    try {
        facebookPosts = JSON.parse(localStorage.getItem(FB_POSTS_KEY)) || (typeof FACEBOOK_POSTS_MOCK !== 'undefined' ? [].concat(FACEBOOK_POSTS_MOCK) : []);
    } catch(e) {
        facebookPosts = (typeof FACEBOOK_POSTS_MOCK !== 'undefined') ? [].concat(FACEBOOK_POSTS_MOCK) : [];
    }
    try {
        parentsDatabase = JSON.parse(localStorage.getItem(DB_KEYS.PARENTS)) || [];
    } catch(e) {
        parentsDatabase = [];
    }

    notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    checkedItems = JSON.parse(localStorage.getItem(CHECKED_ITEMS_KEY) || '{}');
    isAdminLoggedIn = localStorage.getItem(ADMIN_KEY) === 'true';
    notificationsEnabled = 'Notification' in window && Notification.permission === 'granted';

    var currentUserId = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (currentUserId) {
        isLoggedIn = true;
        parentData = parentsDatabase.find(function(p) { return p.id === currentUserId; }) || {};
        if (parentData.email && parentData.email.toLowerCase() === DB_KEYS.ADMIN_EMAIL.toLowerCase()) {
            isAdminLoggedIn = true;
            localStorage.setItem(ADMIN_KEY, 'true');
        }
        if (parentData.phone && ADMIN_PHONES.indexOf(normalizePhone(parentData.phone)) !== -1) {
            isAdminLoggedIn = true;
            parentData.isAdmin = true;
        }
    } else {
        isLoggedIn = false;
        parentData = {};
    }

    if (notifications.length === 0) {
        notifications = [
            { id: 1, title: 'بداية الموسم الدراسي 2026/2027', body: 'يُُعلم أولياء التلاميذ بأن الموسم الدراسي الجديد سيبدأ يوم الاثنين 21 سبتمبر 2026.', priority: 'important', date: '2026-09-01T08:00:00' },
            { id: 2, title: 'قائمة الأدوات المدرسية', body: 'تم نشر قائمة الأدوات المدرسية للموسم 2026/2027.', priority: 'normal', date: '2026-08-28T10:00:00' }
        ];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }

    try { updateNotificationBadge(); } catch(e) { console.error(e); }
    try { renderNotifications(); } catch(e) { console.error(e); }
    try { renderAdminNotifs(); } catch(e) { console.error(e); }
    try { renderArchive(); } catch(e) { console.error(e); }
    try { renderEducationSites(); } catch(e) { console.error(e); }
    try { renderEducationVideos(); } catch(e) { console.error(e); }
    try { renderSupplies(); } catch(e) { console.error(e); }
    try { renderBooksList(); } catch(e) { console.error(e); }
    try { calculateTotal(); } catch(e) { console.error(e); }
    try { loadFacebookFeed(); } catch(e) { console.error(e); }

    var notifToggle = document.getElementById('notif-toggle');
    if (notifToggle) notifToggle.checked = notificationsEnabled;

    var now = new Date();
    var startInput = document.getElementById('notif-start');
    var endInput = document.getElementById('notif-end');
    if (startInput) startInput.value = formatDateTimeLocal(now);
    if (endInput) {
        var tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        endInput.value = formatDateTimeLocal(tomorrow);
    }

    var adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = isAdminLoggedIn ? '' : 'none';

    if (isAdminLoggedIn) {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }

    updateProfileCard();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) loadFacebookFeed();
    });
}

function generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizePhone(phone) {
    var p = phone.replace(/[\s\-\(\)]/g, '');
    if (p.startsWith('+213')) return p.substring(1);
    if (p.startsWith('213')) return p;
    if (p.startsWith('0')) return '213' + p.substring(1);
    return '213' + p;
}

function isAdminPhone(phone) {
    return ADMIN_PHONES.indexOf(normalizePhone(phone)) !== -1;
}

function fetchActivations() {
    return fetch(GITHUB_CONFIG.rawBase + 'activations.json?t=' + Date.now())
        .then(function(r) { return r.json(); })
        .catch(function() { return {}; });
}

function getGitHubToken() {
    return localStorage.getItem('github_token') || '';
}

function setGitHubToken(token) {
    localStorage.setItem('github_token', token);
}

function saveRegistrationToGitHub(phone, name, level, email) {
    var token = getGitHubToken();
    if (!token) return Promise.resolve();
    return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
        headers: { 'Authorization': 'token ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(meta) {
        var current = {};
        try { current = JSON.parse(atob(meta.content.replace(/\s/g, ''))); } catch(e) { current = {}; }
        current[phone] = {
            name: name,
            level: level,
            levelName: (typeof STUDENT_LEVELS !== 'undefined' && STUDENT_LEVELS[level]) ? STUDENT_LEVELS[level] : level,
            email: email,
            pending: true,
            registeredAt: new Date().toISOString()
        };
        var body = JSON.stringify(current);
        var encoded = btoa(unescape(encodeURIComponent(body)));
        return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
            method: 'PUT',
            headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'New registration: ' + phone, content: encoded, sha: meta.sha, branch: 'main' })
        });
    })
    .then(function(r) { return r.json(); });
}

function activateUserOnGitHub(phone) {
    var token = getGitHubToken();
    if (!token) return Promise.resolve();
    return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
        headers: { 'Authorization': 'token ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(meta) {
        var current = {};
        try { current = JSON.parse(atob(meta.content.replace(/\s/g, ''))); } catch(e) { current = {}; }
        if (current[phone]) {
            current[phone].pending = false;
            current[phone].activatedAt = new Date().toISOString();
        }
        var body = JSON.stringify(current);
        var encoded = btoa(unescape(encodeURIComponent(body)));
        return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
            method: 'PUT',
            headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Activate: ' + phone, content: encoded, sha: meta.sha, branch: 'main' })
        });
    })
    .then(function(r) { return r.json(); });
}

function removeActivationOnGitHub(phone) {
    var token = getGitHubToken();
    if (!token) return Promise.resolve();
    return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
        headers: { 'Authorization': 'token ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(meta) {
        var current = {};
        try { current = JSON.parse(atob(meta.content.replace(/\s/g, ''))); } catch(e) { current = {}; }
        delete current[phone];
        var body = JSON.stringify(current);
        var encoded = btoa(unescape(encodeURIComponent(body)));
        return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
            method: 'PUT',
            headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Remove: ' + phone, content: encoded, sha: meta.sha, branch: 'main' })
        });
    })
    .then(function(r) { return r.json(); });
}

function showLoginPage() {
    hideAllPages();
    var loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.classList.remove('hidden');
    var f = document.getElementById('login-form');
    if (f) f.reset();
}

function showRegisterPage() {
    hideAllPages();
    var regPage = document.getElementById('register-page');
    if (regPage) regPage.classList.remove('hidden');
    var f = document.getElementById('register-form');
    if (f) f.reset();
}

function backToLogin() {
    hideAllPages();
    var loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.classList.remove('hidden');
    var f = document.getElementById('login-form');
    if (f) f.reset();
}

function hideAllPages() {
    var pages = ['login-page', 'register-page', 'verification-page', 'main-app'];
    pages.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function handleRegister(e) {
    if (e) e.preventDefault();

    var nameVal = (document.getElementById('reg-name') || {}).value || '';
    var studentNameVal = (document.getElementById('reg-student-name') || {}).value || '';
    var levelVal = (document.getElementById('reg-level') || {}).value || '';
    var emailVal = (document.getElementById('reg-email') || {}).value || '';
    var phoneVal = (document.getElementById('reg-phone') || {}).value || '';

    nameVal = nameVal.trim();
    studentNameVal = studentNameVal.trim();
    emailVal = emailVal.trim();
    phoneVal = phoneVal.trim();

    if (!nameVal || !studentNameVal || !levelVal || !emailVal || !phoneVal) {
        showToast('أكمل جميع الحقول المطلوبة', 'error');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }

    var normalizedPhone = normalizePhone(phoneVal);

    if (isAdminPhone(normalizedPhone)) {
        showToast('هذا الرقم خاص بالأدمن', 'error');
        return;
    }

    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].phone && normalizePhone(parentsDatabase[i].phone) === normalizedPhone) {
            showToast('رقم الهاتف مسجل بالفعل', 'error');
            return;
        }
    }

    var code = generateCode();
    var userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    var newUser = {
        id: userId,
        name: nameVal,
        studentName: studentNameVal,
        level: levelVal,
        levelName: (typeof STUDENT_LEVELS !== 'undefined' && STUDENT_LEVELS[levelVal]) ? STUDENT_LEVELS[levelVal] : levelVal,
        phone: normalizedPhone,
        email: emailVal,
        students: [{ name: studentNameVal, level: levelVal, levelName: (typeof STUDENT_LEVELS !== 'undefined' && STUDENT_LEVELS[levelVal]) ? STUDENT_LEVELS[levelVal] : levelVal }],
        isAdmin: false,
        verified: false,
        activationCode: code,
        loginDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    parentsDatabase.push(newUser);
    localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));

    pendingVerificationCode = code;
    pendingVerificationPhone = normalizedPhone;

    saveRegistrationToGitHub(normalizedPhone, nameVal, levelVal, emailVal, studentNameVal).catch(function() {});

    hideAllPages();
    var verPage = document.getElementById('verification-page');
    if (verPage) verPage.classList.remove('hidden');

    var codeDisplay = document.getElementById('verify-code-display');
    if (codeDisplay) codeDisplay.textContent = code;

    showToast('تم إرسال طلب التسجيل. في انتظار تفعيل الإدارة', 'normal');
}

function sendCodeViaWhatsApp() {
    if (!pendingVerificationPhone || !pendingVerificationCode) {
        showToast('لا يوجد كود تحقق', 'error');
        return;
    }
    var msg = 'كود تفعيل حسابك في تطبيق جمعية أولياء التلاميذ: ' + pendingVerificationCode;
    var url = 'https://wa.me/' + pendingVerificationPhone + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

function handleVerifyCode(e) {
    if (e) e.preventDefault();

    var codeInput = document.getElementById('verify-code-input');
    var codeInputs = codeInput ? codeInput.value.trim() : '';

    if (!codeInputs || codeInputs.length !== 4) {
        showToast('أدخل كود التحقق كاملاً', 'error');
        return;
    }

    if (codeInputs === pendingVerificationCode) {
        var user = null;
        for (var j = 0; j < parentsDatabase.length; j++) {
            if (normalizePhone(parentsDatabase[j].phone) === pendingVerificationPhone) {
                parentsDatabase[j].verified = true;
                parentsDatabase[j].activationCode = null;
                parentsDatabase[j].loginDate = new Date().toISOString();
                parentsDatabase[j].lastLogin = new Date().toISOString();
                user = parentsDatabase[j];
                localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
                break;
            }
        }

        if (!user) {
            showToast('حدث خطأ. حاول مرة أخرى', 'error');
            return;
        }

        localStorage.setItem(DB_KEYS.CURRENT_USER, user.id);
        pendingVerificationCode = null;
        pendingVerificationPhone = null;
        completeLogin(user);
    } else {
        showToast('كود التحقق غير صحيح', 'error');
    }
}

function handleLogin(e) {
    if (e) e.preventDefault();
    var phoneVal = (document.getElementById('login-phone') || {}).value || '';
    phoneVal = phoneVal.trim();

    if (!phoneVal) {
        showToast('أدخل رقم الهاتف', 'error');
        return;
    }

    var normalizedPhone = normalizePhone(phoneVal);

    if (isAdminPhone(normalizedPhone)) {
        var adminUser = null;
        for (var a = 0; a < parentsDatabase.length; a++) {
            if (parentsDatabase[a].phone && normalizePhone(parentsDatabase[a].phone) === normalizedPhone) {
                adminUser = parentsDatabase[a];
                adminUser.isAdmin = true;
                adminUser.verified = true;
                adminUser.name = adminUser.name || 'الأدمن';
                break;
            }
        }
        if (!adminUser) {
            adminUser = {
                id: 'admin_direct_' + normalizedPhone,
                name: 'الأدمن',
                level: 'admin',
                levelName: 'مدير التطبيق',
                phone: normalizedPhone,
                email: DB_KEYS.ADMIN_EMAIL,
                students: [],
                isAdmin: true,
                verified: true,
                loginDate: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            parentsDatabase.push(adminUser);
        }
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
        completeLogin(adminUser);
        showToast('مرحباً بك يا أدمن', 'success');
        return;
    }

    var user = null;
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].phone && normalizePhone(parentsDatabase[i].phone) === normalizedPhone) {
            user = parentsDatabase[i];
            break;
        }
    }

    if (!user) {
        showToast('الحساب غير موجود. سجّل حساب جديد', 'error');
        return;
    }

    if (!user.verified) {
        fetchActivations().then(function(activations) {
            var act = activations[normalizedPhone];
            if (act && !act.pending) {
                user.verified = true;
                user.activationCode = null;
                user.loginDate = new Date().toISOString();
                user.lastLogin = new Date().toISOString();
                localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
                completeLogin(user);
                showToast('مرحباً بكم ' + user.name, 'success');
            } else {
                showToast('حسابك غير مفعّل. انتظر تفعيل الإدارة', 'error');
            }
        }).catch(function() {
            showToast('حسابك غير مفعّل. انتظر تفعيل الإدارة', 'error');
        });
        return;
    }

    completeLogin(user);
}

function completeLogin(user) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, user.id);
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));

    if (user.isAdmin || isAdminPhone(user.phone)) {
        localStorage.setItem(ADMIN_KEY, 'true');
        isAdminLoggedIn = true;
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }

    isLoggedIn = true;
    parentData = user;

    hideAllPages();
    var mainApp = document.getElementById('main-app');
    if (mainApp) mainApp.classList.remove('hidden');

    updateProfileCard();

    var adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = isAdminLoggedIn ? '' : 'none';

    showToast('مرحباً بكم ' + (user.name || ''), 'success');

    if (!isAdminPhone(user.phone) && user.phone) {
        saveUserToGitHub(user).catch(function() {});
    }
}

function saveUserToGitHub(user) {
    var token = getGitHubToken();
    if (!token) return Promise.resolve();
    var normalizedPhone = normalizePhone(user.phone);
    return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
        headers: { 'Authorization': 'token ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(meta) {
        var current = {};
        try { current = JSON.parse(atob(meta.content.replace(/\s/g, ''))); } catch(e) { current = {}; }
        current[normalizedPhone] = {
            name: user.name || '',
            level: user.level || '',
            levelName: user.levelName || '',
            email: user.email || '',
            phone: user.phone || '',
            pending: !user.verified,
            registeredAt: current[normalizedPhone] ? current[normalizedPhone].registeredAt : new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        var body = JSON.stringify(current);
        var encoded = btoa(unescape(encodeURIComponent(body)));
        return fetch(GITHUB_CONFIG.apiBase + '/activations.json', {
            method: 'PUT',
            headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Update user: ' + normalizedPhone, content: encoded, sha: meta.sha, branch: 'main' })
        });
    })
    .then(function(r) { return r.json(); });
}

function handleLogout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    isLoggedIn = false;
    parentData = {};
    isAdminLoggedIn = false;
    document.body.classList.remove('admin-mode');

    hideAllPages();
    var loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.classList.remove('hidden');
    var adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = 'none';

    var loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
    var registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.reset();

    showToast('تم تسجيل الخروج بنجاح', 'normal');
}

function getPendingRegistrations() {
    var pending = [];
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (!parentsDatabase[i].verified) {
            pending.push(parentsDatabase[i]);
        }
    }
    return pending;
}

function adminApproveUser(userId) {
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].id === userId) {
            var user = parentsDatabase[i];
            user.verified = true;
            user.activationCode = null;
            user.lastLogin = new Date().toISOString();
            localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
            var normalizedPhone = normalizePhone(user.phone);
            activateUserOnGitHub(normalizedPhone).catch(function() {});
            return user;
        }
    }
    return null;
}

function adminSendWhatsApp(phone, name) {
    var normalized = normalizePhone(phone);
    var msg = 'مرحباً ' + (name || '') + '\nتم تفعيل حسابك في تطبيق جمعية أولياء التلاميذ.\nيمكنك الآن الدخول برقم هاتفك.';
    var url = 'https://wa.me/' + normalized + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

function adminDeleteUser(userId) {
    var user = null;
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].id === userId) {
            user = parentsDatabase[i];
            parentsDatabase.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
    if (user) {
        removeActivationOnGitHub(normalizePhone(user.phone)).catch(function() {});
    }
    if (user && parentData.id === userId) {
        handleLogout();
    }
    renderPendingRegistrations();
    showToast('تم حذف المستخدم', 'normal');
}

function approveAndSendCode(userId, phone) {
    var user = adminApproveUser(userId);
    if (user) {
        adminSendWhatsApp(phone, user.name);
        renderPendingRegistrations();
        showToast('تم تفعيل الحساب', 'success');
    }
}

function adminDeleteUserByPhone(phone) {
    var normalizedPhone = normalizePhone(phone);
    removeActivationOnGitHub(normalizedPhone).then(function() {
        renderPendingRegistrations();
        showToast('تم حذف المستخدم', 'normal');
    }).catch(function() {
        renderPendingRegistrations();
    });
}

function renderPendingRegistrations() {
    var container = document.getElementById('pending-registrations');
    if (!container) return;

    var token = getGitHubToken();
    if (!token) {
        var pending = getPendingRegistrations();
        if (pending.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد طلبات تسجيل معلقة</p><p style="font-size:12px;margin-top:8px;">أدخل GitHub Token في الإعدادات لتفعيل السحابة</p></div>';
            return;
        }
        var html = '';
        for (var i = 0; i < pending.length; i++) {
            var u = pending[i];
            var dateStr = u.loginDate ? new Date(u.loginDate).toLocaleDateString('ar-DZ') : '';
            html += '<div class="pending-item">' +
                '<div class="pending-item-info">' +
                    '<h5>' + (u.name || '') + '</h5>' +
                    '<span>' + (u.phone || '') + ' - ' + (u.email || '') + '</span>' +
                    '<span>' + (u.levelName || u.level || '') + '</span>' +
                    '<span class="pending-date">' + dateStr + '</span>' +
                '</div>' +
                '<div class="pending-actions">' +
                    '<button class="admin-btn approve" onclick="approveAndSendCode(\'' + u.id + '\', \'' + (u.phone || '') + '\')">تفعيل</button>' +
                    '<button class="admin-btn whatsapp" onclick="adminSendWhatsApp(\'' + (u.phone || '') + '\', \'' + (u.name || '').replace(/'/g, "\\'") + '\')">واتساب</button>' +
                    '<button class="admin-btn delete" onclick="adminDeleteUser(\'' + u.id + '\')">حذف</button>' +
                '</div>' +
            '</div>';
        }
        container.innerHTML = html;
        return;
    }

    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>جاري تحميل الطلبات...</p></div>';

    fetchActivations().then(function(activations) {
        var pending = [];
        var phones = Object.keys(activations || {});
        for (var i = 0; i < phones.length; i++) {
            var phone = phones[i];
            if (activations[phone].pending) {
                pending.push({
                    phone: phone,
                    name: activations[phone].name || '',
                    level: activations[phone].levelName || activations[phone].level || '',
                    email: activations[phone].email || '',
                    registeredAt: activations[phone].registeredAt || ''
                });
            }
        }

        if (pending.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>لا توجد طلبات تسجيل معلقة</p></div>';
            return;
        }

        var html = '';
        for (var j = 0; j < pending.length; j++) {
            var user = pending[j];
            var dateStr = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('ar-DZ') : '';
            html += '<div class="pending-item">' +
                '<div class="pending-item-info">' +
                    '<h5>' + user.name + '</h5>' +
                    '<span>' + user.phone + ' - ' + user.email + '</span>' +
                    '<span>' + user.level + '</span>' +
                    '<span class="pending-date">' + dateStr + '</span>' +
                '</div>' +
                '<div class="pending-actions">' +
                    '<button class="admin-btn approve" onclick="approveAndSendCodeRemote(\'' + user.phone + '\')">تفعيل</button>' +
                    '<button class="admin-btn whatsapp" onclick="adminSendWhatsApp(\'' + user.phone + '\', \'' + user.name.replace(/'/g, "\\'") + '\')">واتساب</button>' +
                    '<button class="admin-btn delete" onclick="adminDeleteUserByPhone(\'' + user.phone + '\')">حذف</button>' +
                '</div>' +
            '</div>';
        }
        container.innerHTML = html;
    }).catch(function() {
        container.innerHTML = '<div class="empty-state"><p>خطأ في تحميل الطلبات</p></div>';
    });
}

function approveAndSendCodeRemote(phone) {
    var normalizedPhone = normalizePhone(phone);
    activateUserOnGitHub(normalizedPhone).then(function() {
        renderPendingRegistrations();
        showToast('تم تفعيل الحساب', 'success');
    }).catch(function() {
        showToast('حدث خطأ', 'error');
    });
}

function renderUsersList() {
    var container = document.getElementById('users-list');
    if (!container) return;

    var token = getGitHubToken();
    if (!token) {
        var users = getUsersListData();
        renderUsersListHTML(container, users);
        return;
    }

    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>جاري تحميل القائمة...</p></div>';

    fetchActivations().then(function(activations) {
        var users = [];
        var phones = Object.keys(activations || {});
        for (var i = 0; i < phones.length; i++) {
            var phone = phones[i];
            var act = activations[phone];
            if (phone !== normalizePhone(DB_KEYS.ADMIN_EMAIL) && !isAdminPhone(phone)) {
                users.push({
                    id: phone,
                    name: act.name || '',
                    phone: act.phone || phone,
                    level: act.level || '',
                    levelName: act.levelName || act.level || '',
                    email: act.email || '',
                    verified: !act.pending,
                    lastLogin: act.lastLogin || act.activatedAt || ''
                });
            }
        }
        renderUsersListHTML(container, users);
    }).catch(function() {
        var users = getUsersListData();
        renderUsersListHTML(container, users);
    });
}

function renderUsersListHTML(container, users) {
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا يوجد مستخدمون مسجلون</p></div>';
        updateAdminStats();
        return;
    }

    var html = '<div class="users-table-header">' +
        '<span>#</span>' +
        '<span>الاسم واللقب</span>' +
        '<span>رقم الهاتف</span>' +
        '<span>المستوى</span>' +
        '<span>الحالة</span>' +
        '<span>إجراءات</span>' +
    '</div>';

    for (var i = 0; i < users.length; i++) {
        var u = users[i];
        var statusClass = u.verified ? 'verified' : 'pending';
        var statusText = u.verified ? 'مفعّل' : 'معلّق';
        html += '<div class="users-table-row">' +
            '<span class="users-row-num">' + (i + 1) + '</span>' +
            '<span class="users-row-name">' + (u.name || 'بدون اسم') + '</span>' +
            '<span class="users-row-phone">' + (u.phone || '') + '</span>' +
            '<span class="users-row-level">' + (u.levelName || u.level || '') + '</span>' +
            '<span class="users-row-status ' + statusClass + '">' + statusText + '</span>' +
            '<span class="users-row-actions">' +
                '<button class="admin-btn delete" onclick="adminDeleteUserById(\'' + u.id + '\')">حذف</button>' +
            '</span>' +
        '</div>';
    }

    container.innerHTML = html;
    updateAdminStats();
}

function adminDeleteUserById(userId) {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;

    var phone = userId;
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].phone && normalizePhone(parentsDatabase[i].phone) === normalizePhone(phone)) {
            parentsDatabase.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));

    removeActivationOnGitHub(normalizePhone(phone)).then(function() {
        renderUsersList();
        renderPendingRegistrations();
        updateAdminStats();
        showToast('تم حذف المستخدم', 'normal');
    }).catch(function() {
        renderUsersList();
        updateAdminStats();
        showToast('تم الحذف محلياً', 'normal');
    });
}

function getUsersListData() {
    return parentsDatabase.filter(function(u) {
        return u.phone && !isAdminPhone(u.phone);
    });
}

function shareUsersListText() {
    var users = getUsersListData();
    if (users.length === 0) {
        showToast('لا يوجد مسجلون', 'error');
        return;
    }
    var text = 'قائمة المسجلين - جمعية أولياء التلاميذ\n';
    text += '================================\n\n';
    users.forEach(function(u, i) {
        text += (i + 1) + '. ' + (u.name || 'بدون اسم') + '\n';
        text += '   الهاتف: ' + (u.phone || '') + '\n';
        text += '   المستوى: ' + (u.levelName || u.level || '') + '\n';
        text += '   الحالة: ' + (u.verified ? 'مفعّل' : 'معلّق') + '\n\n';
    });
    text += 'الإجمالي: ' + users.length + ' مسجل';
    if (navigator.share) {
        navigator.share({ title: 'قائمة المسجلين', text: text }).catch(function() {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('تم نسخ القائمة', 'success');
        });
    } else {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('تم نسخ القائمة', 'success');
    }
}

function shareUsersListCSV() {
    var users = getUsersListData();
    if (users.length === 0) {
        showToast('لا يوجد مسجلون', 'error');
        return;
    }
    var csv = '\uFEFFالرقم,الاسم واللقب,رقم الهاتف,المستوى,البريد الإلكتروني,الحالة\n';
    users.forEach(function(u, i) {
        csv += (i + 1) + ',' + (u.name || '') + ',' + (u.phone || '') + ',' + (u.levelName || u.level || '') + ',' + (u.email || '') + ',' + (u.verified ? 'مفعّل' : 'معلّق') + '\n';
    });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'قائمة_المسجلين_' + new Date().toLocaleDateString('ar-DZ') + '.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل الملف', 'success');
}

function shareUsersListWhatsApp() {
    var users = getUsersListData();
    if (users.length === 0) {
        showToast('لا يوجد مسجلون', 'error');
        return;
    }
    var text = 'قائمة المسجلين - جمعية أولياء التلاميذ\n';
    text += '================================\n\n';
    users.forEach(function(u, i) {
        text += (i + 1) + '. ' + (u.name || 'بدون اسم') + ' | ' + (u.phone || '') + ' | ' + (u.levelName || u.level || '') + ' | ' + (u.verified ? 'مفعّل' : 'معلّق') + '\n';
    });
    text += '\nالإجمالي: ' + users.length + ' مسجل';
    var url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
}

function shareUsersListEmail() {
    var users = getUsersListData();
    if (users.length === 0) {
        showToast('لا يوجد مسجلون', 'error');
        return;
    }
    var body = 'قائمة المسجلين - جمعية أولياء التلاميذ\n\n';
    users.forEach(function(u, i) {
        body += (i + 1) + '. ' + (u.name || 'بدون اسم') + '\n';
        body += '   الهاتف: ' + (u.phone || '') + '\n';
        body += '   المستوى: ' + (u.levelName || u.level || '') + '\n';
        body += '   الحالة: ' + (u.verified ? 'مفعّل' : 'معلّق') + '\n\n';
    });
    body += 'الإجمالي: ' + users.length + ' مسجل';
    var subject = 'قائمة المسجلين - ' + new Date().toLocaleDateString('ar-DZ');
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function showShareMenu() {
    var existing = document.getElementById('share-menu-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'share-menu-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    var menu = document.createElement('div');
    menu.style.cssText = 'width:100%;max-width:400px;background:var(--bg-card);border-radius:16px 16px 0 0;padding:20px;animation:slideUp 0.3s ease;';

    var users = getUsersListData();
    var title = document.createElement('h4');
    title.textContent = 'مشاركة قائمة المسجلين (' + users.length + ')';
    title.style.cssText = 'color:var(--accent);margin-bottom:15px;text-align:center;';
    menu.appendChild(title);

    var options = [
        { icon: '📋', label: 'نسخ كنص', action: shareUsersListText, color: '#3498db' },
        { icon: '💬', label: 'إرسال عبر واتساب', action: shareUsersListWhatsApp, color: '#27ae60' },
        { icon: '📊', label: 'تحميل Excel (CSV)', action: shareUsersListCSV, color: '#e67e22' },
        { icon: '📧', label: 'إرسال بالبريد', action: shareUsersListEmail, color: '#9b59b6' }
    ];

    options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.style.cssText = 'width:100%;display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:white;font-family:"Noto Kufi Arabic",sans-serif;font-size:14px;cursor:pointer;transition:all 0.2s;';
        btn.innerHTML = '<span style="font-size:20px;">' + opt.icon + '</span><span>' + opt.label + '</span>';
        btn.onmouseover = function() { btn.style.background = 'rgba(255,255,255,0.1)'; };
        btn.onmouseout = function() { btn.style.background = 'rgba(255,255,255,0.05)'; };
        btn.onclick = function() { overlay.remove(); opt.action(); };
        menu.appendChild(btn);
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'إلغاء';
    cancelBtn.style.cssText = 'width:100%;padding:14px;margin-top:5px;background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3);border-radius:12px;color:#e74c3c;font-family:"Noto Kufi Arabic",sans-serif;font-size:14px;font-weight:600;cursor:pointer;';
    cancelBtn.onclick = function() { overlay.remove(); };
    menu.appendChild(cancelBtn);

    overlay.appendChild(menu);
    document.body.appendChild(overlay);
}

function saveGitHubToken() {
    var input = document.getElementById('github-token-input');
    var status = document.getElementById('token-status');
    var token = input ? input.value.trim() : '';
    if (!token) {
        if (status) { status.textContent = 'أدخل التوكن أولاً'; status.style.color = '#e74c3c'; }
        return;
    }
    setGitHubToken(token);
    if (status) { status.textContent = 'تم حفظ التوكن بنجاح'; status.style.color = '#27ae60'; }
    renderPendingRegistrations();
}

function loadGitHubToken() {
    var input = document.getElementById('github-token-input');
    var status = document.getElementById('token-status');
    var token = getGitHubToken();
    if (token) {
        if (input) input.value = token;
        if (status) { status.textContent = 'التوكن محفوظ'; status.style.color = '#27ae60'; }
    }
}

function toggleCloudSettings() {
    var body = document.getElementById('cloud-settings-body');
    var arrow = document.getElementById('cloud-arrow');
    if (body) {
        var isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
        body.style.maxHeight = isOpen ? '0px' : '200px';
        body.style.overflow = 'hidden';
        body.style.transition = 'max-height 0.3s ease';
    }
    if (arrow) {
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        arrow.style.transition = 'transform 0.3s ease';
    }
}

function updateAdminStats() {
    var token = getGitHubToken();
    if (token) {
        fetchActivations().then(function(activations) {
            var total = 0, verified = 0;
            var phones = Object.keys(activations || {});
            for (var i = 0; i < phones.length; i++) {
                if (!isAdminPhone(phones[i])) {
                    total++;
                    if (!activations[phones[i]].pending) verified++;
                }
            }
            setStatsValues(total, total - verified, verified);
        }).catch(function() {
            setStatsFromLocal();
        });
    } else {
        setStatsFromLocal();
    }
}

function setStatsFromLocal() {
    var total = parentsDatabase.filter(function(u) { return u.phone && !isAdminPhone(u.phone); }).length;
    var verified = parentsDatabase.filter(function(u) { return u.verified && u.phone && !isAdminPhone(u.phone); }).length;
    setStatsValues(total, total - verified, verified);
}

function setStatsValues(total, pending, verified) {
    var totalEl = document.getElementById('stat-total');
    var pendingEl = document.getElementById('stat-pending');
    var verifiedEl = document.getElementById('stat-verified');
    var notifsEl = document.getElementById('stat-notifs');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (verifiedEl) verifiedEl.textContent = verified;
    if (notifsEl) notifsEl.textContent = notifications.length;
}

function updateProfileCard() {
    if (isLoggedIn && parentData.name) {
        var nameEl = document.getElementById('parent-name-display');
        var infoEl = document.getElementById('parent-students-display');
        if (nameEl) nameEl.textContent = parentData.name;
        if (infoEl) {
            var studentsCount = parentData.students ? parentData.students.length : 0;
            var childrenInfo = parentData.students
                ? parentData.students.map(function(s) { return s.levelName || s.level; }).join(', ')
                : '';
            var info = studentsCount + ' ' + (studentsCount === 1 ? 'تلميذ' : 'تلاميذ');
            if (childrenInfo) info += ' - ' + childrenInfo;
            if (parentData.phone) info += ' | ' + parentData.phone;
            infoEl.textContent = info;
        }
    }
}

function updateAdminView() {
    var loginSection = document.getElementById('admin-login');
    var panelSection = document.getElementById('admin-panel');

    if (isAdminLoggedIn) {
        if (loginSection) loginSection.classList.add('hidden');
        if (panelSection) panelSection.classList.remove('hidden');
        loadGitHubToken();
        updateAdminStats();
        renderPendingRegistrations();
    } else {
        if (loginSection) loginSection.classList.remove('hidden');
        if (panelSection) panelSection.classList.add('hidden');
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem(ADMIN_KEY);
    var loginSection = document.getElementById('admin-login');
    var panelSection = document.getElementById('admin-panel');
    if (loginSection) loginSection.classList.remove('hidden');
    if (panelSection) panelSection.classList.add('hidden');
    showToast('تم تسجيل الخروج', 'normal');
}

function adminLogin(e) {
    if (e) e.preventDefault();
    var username = (document.getElementById('admin-username') || {}).value || '';
    var password = (document.getElementById('admin-password') || {}).value || '';

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        localStorage.setItem(ADMIN_KEY, 'true');
        updateAdminView();
        showToast('مرحباً بك في لوحة التحكم', 'success');
    } else {
        var errEl = document.getElementById('admin-error');
        if (errEl) errEl.classList.remove('hidden');
    }
}

function showAdminTab(tabName, btnEl) {
    document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });

    var section = document.getElementById('admin-' + tabName);
    if (section) section.classList.add('active');
    if (btnEl) btnEl.classList.add('active');

    if (tabName === 'pending') renderPendingRegistrations();
    if (tabName === 'users') renderUsersList();
    if (tabName === 'manage-notifs') renderAdminNotifs();
    if (tabName === 'manage-supplies') renderAdminSupplies();
    if (tabName === 'stats') renderStats();
}

function navigateTo(page) {
    if (page === 'admin' && !isAdminLoggedIn) {
        showToast('هذه الصفحة خاصة بالأدمن فقط', 'error');
        return;
    }

    currentPage = page;
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var targetPage = document.getElementById('page-' + page);
    if (targetPage) targetPage.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
    });
    var pageContent = document.getElementById('page-content');
    if (pageContent) pageContent.scrollTop = 0;
    if (page === 'facebook') loadFacebookFeed();
    if (page === 'admin') updateAdminView();
    if (page === 'books') renderBooksList();
}

function showGrade(grade, el) {
    currentGrade = grade;
    document.querySelectorAll('.grade-tab').forEach(function(tab) { tab.classList.remove('active'); });
    if (el) el.classList.add('active');
    renderSupplies();
}

function renderSupplies() {
    var container = document.getElementById('supplies-content');
    if (!container) return;
    var grade = GRADES_DATA[currentGrade];
    if (!grade) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد بيانات متاحة</p></div>';
        return;
    }
    var savedSupplies = JSON.parse(localStorage.getItem(SUPPLIES_KEY) || '{}');
    var supplies = savedSupplies[currentGrade] || grade.supplies;
    var html = '<h3>' + grade.name + '</h3>';
    supplies.forEach(function(item, index) {
        var itemId = currentGrade + '_' + index;
        var isChecked = checkedItems[itemId] || false;
        html += '<div class="supply-item" onclick="toggleSupplyCheck(\'' + itemId + '\', this)">' +
            '<span class="supply-number">' + (index + 1) + '</span>' +
            '<div class="supply-text">' + (item.text || item) +
            (item.category ? '<div class="supply-category">' + item.category + '</div>' : '') +
            '</div>' +
            '<div class="supply-check ' + (isChecked ? 'checked' : '') + '"></div>' +
        '</div>';
    });
    container.innerHTML = html;
}

function toggleSupplyCheck(itemId, element) {
    checkedItems[itemId] = !checkedItems[itemId];
    localStorage.setItem(CHECKED_ITEMS_KEY, JSON.stringify(checkedItems));
    var checkEl = element.querySelector('.supply-check');
    if (checkEl) checkEl.classList.toggle('checked');
}

function loadFacebookFeed() {
    var feedContainer = document.getElementById('fb-feed');
    if (!feedContainer) return;
    feedContainer.innerHTML = '<div class="fb-loading"><div class="spinner"></div><p>جاري تحميل المنشورات...</p></div>';
    setTimeout(function() {
        var html = '';
        var sortedPosts = [].concat(facebookPosts).sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 4);
        sortedPosts.forEach(function(post) {
            var date = new Date(post.date);
            var dateStr = date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
            var truncatedContent = post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content;
            var adminButtons = isAdminLoggedIn ?
                '<div class="fb-post-admin-actions">' +
                    '<button class="fb-admin-btn edit" onclick="event.stopPropagation(); editFacebookPost(' + post.id + ')">تعديل</button>' +
                    '<button class="fb-admin-btn delete" onclick="event.stopPropagation(); deleteFacebookPost(' + post.id + ')">حذف</button>' +
                '</div>' : '';
            html += '<div class="fb-post">' +
                '<div class="fb-post-header">' +
                    '<div class="fb-post-avatar"><svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#1a5276" stroke="#f1c40f" stroke-width="1.5"/><text x="20" y="22" text-anchor="middle" fill="#f1c40f" font-size="6" font-weight="bold">جمعية</text></svg></div>' +
                    '<div class="fb-post-meta"><h4>جمعية أولياء التلاميذ</h4><span>' + dateStr + '</span></div>' +
                '</div>' +
                '<div class="fb-post-content">' + truncatedContent + '</div>' +
                adminButtons +
                '<div class="fb-post-actions">' +
                    '<button class="fb-post-action" onclick="event.stopPropagation()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> ' + post.likes + '</button>' +
                    '<button class="fb-post-action" onclick="event.stopPropagation()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ' + post.comments + '</button>' +
                    '<button class="fb-post-action" onclick="event.stopPropagation()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> ' + post.shares + '</button>' +
                '</div>' +
            '</div>';
        });
        feedContainer.innerHTML = html || '<div class="empty-state"><p>لا توجد منشورات</p></div>';
    }, 500);
}

function editFacebookPost(id) {
    showToast('قريباً: تعديل المنشور', 'normal');
}

function deleteFacebookPost(id) {
    if (!confirm('هل تريد حذف هذا المنشور؟')) return;
    facebookPosts = facebookPosts.filter(function(p) { return p.id !== id; });
    localStorage.setItem(FB_POSTS_KEY, JSON.stringify(facebookPosts));
    loadFacebookFeed();
    showToast('تم حذف المنشور', 'normal');
}

function renderNotifications() {
    var container = document.getElementById('notifications-list');
    if (!container) return;
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد إشعارات</p></div>';
        return;
    }
    var html = '';
    notifications.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    notifications.forEach(function(n) {
        var date = new Date(n.date);
        var dateStr = date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
        html += '<div class="notif-card ' + (n.priority === 'important' ? 'important' : '') + '">' +
            '<div class="notif-header"><h4>' + n.title + '</h4>' +
            (n.priority === 'important' ? '<span class="notif-badge">مهم</span>' : '') + '</div>' +
            '<p>' + n.body + '</p>' +
            '<span class="notif-date">' + dateStr + '</span></div>';
    });
    container.innerHTML = html;
}

function renderArchive() {
    var container = document.getElementById('archive-list');
    if (!container) return;
    var html = '';
    ARCHIVE_DATA.forEach(function(item) {
        html += '<div class="archive-card" style="border-right: 4px solid ' + item.color + ';">' +
            '<h4>' + item.title + '</h4><p>' + item.year + '</p></div>';
    });
    container.innerHTML = html;
}

function renderEducationSites() {
    var container = document.getElementById('education-sites-list');
    if (!container) return;
    var html = '';
    EDUCATION_SITES.forEach(function(site) {
        html += '<a href="' + site.url + '" target="_blank" class="edu-site-card" style="border-right: 4px solid ' + site.color + ';">' +
            '<div class="edu-site-icon">' + site.icon + '</div>' +
            '<div><h4>' + site.title + '</h4><p>' + site.description + '</p></div></a>';
    });
    container.innerHTML = html;
}

function renderEducationVideos() {
    var container = document.getElementById('education-videos-list');
    if (!container) return;
    var html = '';
    EDUCATION_VIDEOS.forEach(function(vid) {
        html += '<a href="' + vid.url + '" target="_blank" class="edu-video-card">' +
            '<div class="edu-video-thumb"><img src="' + vid.thumbnail + '" alt="' + vid.title + '" loading="lazy"></div>' +
            '<div><h4>' + vid.title + '</h4><p>' + vid.description + '</p><span class="edu-video-channel">' + vid.channel + '</span></div></a>';
    });
    container.innerHTML = html;
}

function renderAdminNotifs() {
    var container = document.getElementById('admin-notifs-list');
    if (!container) return;
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد إشعارات</p></div>';
        return;
    }
    var html = '';
    notifications.forEach(function(n) {
        html += '<div class="admin-notif-item">' +
            '<div><h5>' + n.title + '</h5><p>' + n.body + '</p></div>' +
            '<button class="admin-btn delete" onclick="deleteNotification(' + n.id + ')">حذف</button></div>';
    });
    container.innerHTML = html;
}

function addNotification(e) {
    if (e) e.preventDefault();
    var title = (document.getElementById('notif-title') || {}).value || '';
    var body = (document.getElementById('notif-body') || {}).value || '';
    var priority = (document.getElementById('notif-priority') || {}).value || 'normal';

    if (!title.trim() || !body.trim()) {
        showToast('أكمل جميع الحقول', 'error');
        return;
    }

    var notif = {
        id: Date.now(),
        title: title.trim(),
        body: body.trim(),
        priority: priority,
        date: new Date().toISOString()
    };

    notifications.push(notif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    renderNotifications();
    renderAdminNotifs();

    var titleEl = document.getElementById('notif-title');
    var bodyEl = document.getElementById('notif-body');
    if (titleEl) titleEl.value = '';
    if (bodyEl) bodyEl.value = '';

    showToast('تم إضافة الإشعار', 'success');
}

function deleteNotification(id) {
    notifications = notifications.filter(function(n) { return n.id !== id; });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    renderNotifications();
    renderAdminNotifs();
    showToast('تم حذف الإشعار', 'normal');
}

function renderAdminSupplies() {
    var container = document.getElementById('admin-supplies-list');
    if (!container) return;
    var html = '';
    Object.keys(GRADES_DATA).forEach(function(key) {
        var grade = GRADES_DATA[key];
        html += '<div class="admin-supply-grade"><h5>' + grade.name + ' (' + grade.supplies.length + ' مادة)</h5></div>';
    });
    container.innerHTML = html;
}

function renderStats() {
    var container = document.getElementById('stats-content');
    if (!container) return;
    var totalUsers = parentsDatabase.length;
    var verifiedUsers = parentsDatabase.filter(function(u) { return u.verified; }).length;
    var pendingUsers = totalUsers - verifiedUsers;
    var html = '<div class="stats-grid">' +
        '<div class="stat-card"><h3>' + totalUsers + '</h3><p>إجمالي المستخدمين</p></div>' +
        '<div class="stat-card"><h3>' + verifiedUsers + '</h3><p>مستخدم مفعّل</p></div>' +
        '<div class="stat-card"><h3>' + pendingUsers + '</h3><p>في انتظار التفعيل</p></div>' +
        '<div class="stat-card"><h3>' + notifications.length + '</h3><p>عدد الإشعارات</p></div>' +
        '</div>';
    container.innerHTML = html;
}

function updateNotificationBadge() {
    var badge = document.getElementById('notif-badge');
    if (badge) {
        badge.textContent = notifications.length;
        badge.style.display = notifications.length > 0 ? '' : 'none';
    }
}

function toggleNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            notificationsEnabled = permission === 'granted';
            var notifToggle = document.getElementById('notif-toggle');
            if (notifToggle) notifToggle.checked = notificationsEnabled;
        });
    }
}

function formatDateTimeLocal(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    var h = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + 'T' + h + ':' + min;
}

function showToast(message, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'normal');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
});

function toggleAppMenu() {
    var menu = document.getElementById('app-menu');
    var overlay = document.getElementById('app-menu-overlay');
    if (!menu || !overlay) return;

    var isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
        menu.classList.add('hidden');
        overlay.classList.add('hidden');
    } else {
        menu.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

function installApp() {
    toggleAppMenu();
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choice) {
            if (choice.outcome === 'accepted') {
                showToast('تم تثبيت التطبيق بنجاح', 'success');
            }
            deferredPrompt = null;
        });
    } else {
        showToast('افتح التطبيق في المتصفح واضغف "إضافة للشاشة الرئيسية"', 'normal');
    }
}

function shareAppLink() {
    toggleAppMenu();
    var url = window.location.href;
    var text = 'تطبيق جمعية أولياء التلاميذ إبتدائية الشيخ حاج مسعود سعيد\n' + url;

    if (navigator.share) {
        navigator.share({
            title: 'جمعية أولياء التلاميذ',
            text: 'تطبيق جمعية أولياء التلاميذ إبتدائية الشيخ حاج مسعود سعيد',
            url: url
        }).catch(function() {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('تم نسخ رابط التطبيق', 'success');
        });
    } else {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('تم نسخ رابط التطبيق', 'success');
    }
}

// Books Calculator
var currentBooksGrade = 'preparatory';
var selectedBooks = {};

function selectBooksGrade(grade, btn) {
    currentBooksGrade = grade;
    document.querySelectorAll('.books-grade-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderBooksList();
}

function renderBooksList() {
    var container = document.getElementById('books-list');
    if (!container || !BOOKS_DATA[currentBooksGrade]) return;
    
    var gradeData = BOOKS_DATA[currentBooksGrade];
    var html = '<div class="books-list-header"><h4>قائمة الكتب - ' + gradeData.name + '</h4><span class="books-total-hint">المجموع: ' + gradeData.total.toLocaleString('ar-DZ') + ' د.ج</span></div>';
    
    gradeData.books.forEach(function(book) {
        var isChecked = selectedBooks[currentBooksGrade] && selectedBooks[currentBooksGrade][book.code];
        html += '<div class="book-item">';
        html += '<label class="book-checkbox">';
        html += '<input type="checkbox" ' + (isChecked ? 'checked' : '') + ' onchange="toggleBook(\'' + book.code + '\', this.checked)">';
        html += '<span class="book-checkmark"></span>';
        html += '</label>';
        html += '<div class="book-info">';
        html += '<span class="book-title">' + book.title + '</span>';
        html += '<span class="book-code">الرمز: ' + book.code + '</span>';
        html += '</div>';
        html += '<span class="book-price">' + book.price.toLocaleString('ar-DZ') + ' د.ج</span>';
        html += '</div>';
    });
    
    container.innerHTML = html;
    calculateBooksTotal();
}

function toggleBook(code, checked) {
    if (!selectedBooks[currentBooksGrade]) selectedBooks[currentBooksGrade] = {};
    selectedBooks[currentBooksGrade][code] = checked;
    calculateBooksTotal();
}

function calculateBooksTotal() {
    var total = 0;
    var count = 0;
    
    Object.keys(selectedBooks).forEach(function(grade) {
        Object.keys(selectedBooks[grade]).forEach(function(code) {
            if (selectedBooks[grade][code]) {
                var gradeData = BOOKS_DATA[grade];
                if (gradeData) {
                    var book = gradeData.books.find(function(b) { return b.code === code; });
                    if (book) {
                        total += book.price;
                        count++;
                    }
                }
            }
        });
    });
    
    var totalEl = document.getElementById('books-total-items');
    var priceEl = document.getElementById('books-total-price');
    if (totalEl) totalEl.textContent = count + ' كتاب';
    if (priceEl) priceEl.textContent = total.toLocaleString('ar-DZ') + ' د.ج';
    
    var registrationFee = 35;
    var associationFee = 500;
    var grandTotalWithFees = total + registrationFee + associationFee;
    
    var grandEl = document.getElementById('books-grand-total-with-fees');
    if (grandEl) grandEl.textContent = grandTotalWithFees.toLocaleString('ar-DZ') + ' د.ج';
}

function resetBooksCalculator() {
    selectedBooks = {};
    document.querySelectorAll('.books-list input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
    var countInput = document.getElementById('books-students-count');
    if (countInput) countInput.value = 1;
    calculateBooksTotal();
    showToast('تم إعادة تعيين الحاسبة', 'normal');
}

function printBooksCalculator() {
    window.print();
}

// Supplies Calculator
function updateCalc(grade, delta) {
    var input = document.getElementById('calc-' + grade);
    if (!input) return;
    var val = parseInt(input.value) || 0;
    val = Math.max(0, val + delta);
    input.value = val;
    calculateTotal();
}

function calculateTotal() {
    var totalStudents = 0;
    var totalNotebooks = 0;
    var totalSupplies = 0;
    var resultsHtml = '';
    var grades = ['preparatory', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5'];

    grades.forEach(function(gradeKey) {
        var input = document.getElementById('calc-' + gradeKey);
        var count = input ? (parseInt(input.value) || 0) : 0;
        var grade = GRADES_DATA[gradeKey];
        if (!grade) return;
        totalStudents += count;
        var notebooks = count * (grade.notebookCount || 0);
        var supplies = count * (grade.supplyCount || 0);
        totalNotebooks += notebooks;
        totalSupplies += supplies;
        if (count > 0) {
            resultsHtml += '<div class="calc-result-row">' +
                '<span class="calc-result-grade"><span class="calc-grade-dot" style="background:' + grade.color + '"></span> ' + grade.name + ' (' + count + ' تلميذ)</span>' +
                '<span class="calc-result-nums">' + notebooks + ' كراس - ' + supplies + ' أداة</span>' +
            '</div>';
        }
    });

    var studentsEl = document.getElementById('calc-total-students');
    var notebooksEl = document.getElementById('calc-total-notebooks');
    var suppliesEl = document.getElementById('calc-total-supplies');
    var resultsEl = document.getElementById('calc-results');
    if (studentsEl) studentsEl.textContent = totalStudents;
    if (notebooksEl) notebooksEl.textContent = totalNotebooks;
    if (suppliesEl) suppliesEl.textContent = totalSupplies;
    if (resultsEl) resultsEl.innerHTML = resultsHtml || '<p class="calc-empty">أدخل عدد التلاميذ لكل مستوى لعرض النتائج</p>';
}

function resetCalculator() {
    ['preparatory', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5'].forEach(function(gradeKey) {
        var input = document.getElementById('calc-' + gradeKey);
        if (input) input.value = 0;
    });
    calculateTotal();
    showToast('تم إعادة تعيين الحاسبة', 'normal');
}

function printCalculator() {
    window.print();
}
