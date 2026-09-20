// App State
let currentPage = 'home';
let currentGrade = 'grade1';
let isAdminLoggedIn = false;
let notificationsEnabled = false;
let notifications = [];
let checkedItems = {};
let facebookPosts = [];
let isLoggedIn = false;
let parentData = {};
let parentsDatabase = [];

// Email Verification State
let authMode = '';
let verificationCode = '';
let verificationTimer = null;
let verificationTimeLeft = 120;
let pendingRegistration = null;

// EmailJS Config
const EMAILJS_SERVICE_ID = 'service_boaxpbc';
const EMAILJS_TEMPLATE_ID = 'template_urkxh1k';
const EMAILJS_PUBLIC_KEY = 'vY7pOpm0ruXKciqkY';
// Google Client ID - Replace with your own from Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';



// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch(e) {
        console.error('Init error:', e);
    }
    
    // Always show login/app after delay
    setTimeout(() => {
        try {
            const splash = document.getElementById('splash-screen');
            const mainApp = document.getElementById('main-app');
            const loginPage = document.getElementById('login-page');
            const registerPage = document.getElementById('register-page');
            
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
                splash.style.display = 'none';
            }
            
            if (isLoggedIn && parentData.name) {
                if (mainApp) mainApp.classList.remove('hidden');
            } else {
                if (loginPage) loginPage.classList.remove('hidden');
                if (registerPage) registerPage.classList.add('hidden');
            }
        } catch(e) {
            console.error('Splash error:', e);
            // Last resort - just hide splash
            const splash = document.getElementById('splash-screen');
            const loginPage = document.getElementById('login-page');
            if (splash) splash.remove();
            if (loginPage) loginPage.classList.remove('hidden');
        }
    }, 2500);
});

function initApp() {
    // Load data safely
    try {
        facebookPosts = JSON.parse(localStorage.getItem(FB_POSTS_KEY)) || [...FACEBOOK_POSTS_MOCK];
    } catch(e) {
        facebookPosts = [...FACEBOOK_POSTS_MOCK];
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
    
    // Check if user is logged in
    const currentUserId = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (currentUserId) {
        isLoggedIn = true;
        parentData = parentsDatabase.find(p => p.id === currentUserId) || {};
        
        // Check if user is admin
        if (parentData.email && parentData.email.toLowerCase() === DB_KEYS.ADMIN_EMAIL.toLowerCase()) {
            isAdminLoggedIn = true;
            localStorage.setItem(ADMIN_KEY, 'true');
        }
    } else {
        isLoggedIn = false;
        parentData = {};
    }

    // Add default notifications if none exist
    if (notifications.length === 0) {
        notifications = [
            {
                id: 1,
                title: 'بداية الموسم الدراسي 2026/2027',
                body: 'يُُعلم أولياء التلاميذ بأن الموسم الدراسي الجديد سيبدأ يوم الاثنين 21 سبتمبر 2026. يُرجى التأكد من تجهيز الأدوات المدرسية المطلوبة حسب المستوى.',
                priority: 'important',
                date: '2026-09-01T08:00:00'
            },
            {
                id: 2,
                title: 'قائمة الأدوات المدرسية',
                body: 'تم نشر قائمة الأدوات المدرسية للموسم 2026/2027. يمكنكم الاطلاع عليها من قسم "الأدوات المدرسية" في التطبيق.',
                priority: 'normal',
                date: '2026-08-28T10:00:00'
            }
        ];
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }

    // Splash screen handled by DOMContentLoaded timeout above

    // Update notification badge
    try { updateNotificationBadge(); } catch(e) { console.error(e); }
    try { renderNotifications(); } catch(e) { console.error(e); }
    try { renderAdminNotifs(); } catch(e) { console.error(e); }
    try { renderArchive(); } catch(e) { console.error(e); }
    try { renderEducationSites(); } catch(e) { console.error(e); }
    try { renderEducationVideos(); } catch(e) { console.error(e); }
    try { renderSupplies(); } catch(e) { console.error(e); }
    try { loadFacebookFeed(); } catch(e) { console.error(e); }

    // Initialize children count display
    updateChildrenCountDisplay(1);

    // Update notification toggle state
    const notifToggle = document.getElementById('notif-toggle');
    if (notifToggle) notifToggle.checked = notificationsEnabled;

    // Set default datetime values
    const now = new Date();
    const startInput = document.getElementById('notif-start');
    const endInput = document.getElementById('notif-end');
    if (startInput) {
        startInput.value = formatDateTimeLocal(now);
    }
    if (endInput) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        endInput.value = formatDateTimeLocal(tomorrow);
    }

    // Update admin card visibility
    const adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = isAdminLoggedIn ? '' : 'none';

    // Update profile card
    updateProfileCard();

    // Listen for visibility change to refresh
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadFacebookFeed();
        }
    });
}

function updateProfileCard() {
    if (isLoggedIn && parentData.name) {
        document.getElementById('parent-name-display').textContent = parentData.name;
        const studentsCount = parentData.students ? parentData.students.length : 0;
        const childrenInfo = parentData.students 
            ? parentData.students.map(s => s.levelName || s.level).join('، ')
            : '';
        document.getElementById('parent-students-display').textContent = 
            studentsCount + ' ' + (studentsCount === 1 ? 'تلميذ' : 'تلاميذ') + (childrenInfo ? ' - ' + childrenInfo : '') + (parentData.phone ? ' | ' + parentData.phone : '');
    }
}

// Google Sign-In
function handleGoogleLogin() {
    if (typeof google === 'undefined' || !google.accounts) {
        showToast('جاري تحميل خدمة Google... حاول مرة أخرى', 'error');
        return;
    }
    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: onGoogleSignIn,
            auto_select: true,
            cancel_on_tap_outside: false
        });
        google.accounts.id.prompt(function(notification) {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback: show One Tap UI manually
                google.accounts.id.prompt();
            }
        });
    } catch(e) {
        console.error('Google init error:', e);
        showToast('خطأ في تهيئة تسجيل Google', 'error');
    }
}

function onGoogleSignIn(response) {
    try {
        var payload = parseJwt(response.credential);
        if (!payload || !payload.email) {
            showToast('لم يتم الحصول على بيانات من Google', 'error');
            return;
        }
        processGoogleUser({
            email: payload.email,
            name: payload.name || payload.given_name || '',
            picture: payload.picture || '',
            googleId: payload.sub
        });
    } catch(e) {
        console.error('Google sign-in parse error:', e);
        showToast('خطأ في معالجة بيانات Google', 'error');
    }
}

function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch(e) {
        return null;
    }
}

function processGoogleUser(googleUser) {
    var email = googleUser.email;
    var name = googleUser.name;

    // Check if user already exists
    var existingUser = null;
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].email && parentsDatabase[i].email.toLowerCase() === email.toLowerCase()) {
            existingUser = parentsDatabase[i];
            break;
        }
    }

    if (existingUser) {
        // User exists - log them in
        existingUser.lastLogin = new Date().toISOString();
        existingUser.googleId = googleUser.googleId;
        existingUser.picture = googleUser.picture;
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
        CLOUD_DB.updateParent(existingUser.id, { lastLogin: existingUser.lastLogin, googleId: googleUser.googleId }).catch(function() {});

        localStorage.setItem(DB_KEYS.CURRENT_USER, existingUser.id);
        if (existingUser.isAdmin) {
            localStorage.setItem(ADMIN_KEY, 'true');
            isAdminLoggedIn = true;
        }
        isLoggedIn = true;
        parentData = existingUser;

        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        updateProfileCard();
        var adminCard = document.getElementById('admin-home-card');
        if (adminCard) adminCard.style.display = existingUser.isAdmin ? '' : 'none';
        showToast('مرحباً بكم ' + existingUser.name, 'success');
    } else {
        // New user - auto register
        var userId = 'guser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        var isAdmin = email.toLowerCase() === DB_KEYS.ADMIN_EMAIL.toLowerCase();

        var newUserData = {
            id: userId,
            name: name,
            email: email,
            phone: '',
            password: '',
            students: [],
            isAdmin: isAdmin,
            verified: true,
            googleId: googleUser.googleId,
            picture: googleUser.picture,
            loginDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        parentsDatabase.push(newUserData);
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
        CLOUD_DB.addParent(newUserData).catch(function() {});

        localStorage.setItem(DB_KEYS.CURRENT_USER, userId);
        if (isAdmin) {
            localStorage.setItem(ADMIN_KEY, 'true');
            isAdminLoggedIn = true;
        }
        isLoggedIn = true;
        parentData = newUserData;

        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        updateProfileCard();
        var adminCard2 = document.getElementById('admin-home-card');
        if (adminCard2) adminCard2.style.display = isAdmin ? '' : 'none';
        showToast('مرحباً بكم ' + name + '! تم إنشاء حسابك تلقائياً', 'success');
    }
}

// Show/Hide Pages
function showLoginPage() {
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('verification-page').classList.add('hidden');
    // Reset forms
    document.getElementById('login-form').reset();
}

function showRegisterPage() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
    document.getElementById('verification-page').classList.add('hidden');
    // Reset form
    document.getElementById('register-form').reset();
    updateChildrenCountDisplay(1);
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('أدخل البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }

    // Find user in database
    var existingUser = null;
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].email && parentsDatabase[i].email.toLowerCase() === email.toLowerCase()) {
            existingUser = parentsDatabase[i];
            break;
        }
    }

    if (!existingUser) {
        showToast('الحساب غير موجود. سجّل حساب جديد', 'error');
        return;
    }

    // Check password
    if (existingUser.password !== password) {
        showToast('كلمة المرور غير صحيحة', 'error');
        return;
    }

    // Check if email is verified
    if (!existingUser.verified) {
        // Resend verification code
        authMode = 'verify-existing';
        pendingRegistration = existingUser;
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        sendVerificationCode(email, existingUser.name);
        showToast('يجب تفعيل الحساب أولاً. تم إرسال كود جديد', 'normal');
        return;
    }

    // Login successful
    localStorage.setItem(DB_KEYS.CURRENT_USER, existingUser.id);
    if (existingUser.isAdmin) {
        localStorage.setItem(ADMIN_KEY, 'true');
        isAdminLoggedIn = true;
    }

    isLoggedIn = true;
    parentData = existingUser;

    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateProfileCard();

    var adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = existingUser.isAdmin ? '' : 'none';

    showToast('مرحباً بكم ' + existingUser.name, 'success');
}

function handleRegister(e) {
    e.preventDefault();

    var name = document.getElementById('reg-name').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var password = document.getElementById('reg-password').value;
    var passwordConfirm = document.getElementById('reg-password-confirm').value;
    var childrenCount = parseInt(document.getElementById('reg-children-count').value) || 1;

    // Validation
    if (!name || !phone || !email || !password || !passwordConfirm) {
        showToast('أكمل جميع الحقول المطلوبة', 'error');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        document.getElementById('password-match-error').classList.remove('hidden');
        showToast('كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    document.getElementById('password-match-error').classList.add('hidden');

    // Check if email already exists
    for (var i = 0; i < parentsDatabase.length; i++) {
        if (parentsDatabase[i].email && parentsDatabase[i].email.toLowerCase() === email.toLowerCase()) {
            showToast('البريد الإلكتروني مسجل بالفعل', 'error');
            return;
        }
    }

    // Collect children data
    var children = [];
    var childGroups = document.querySelectorAll('.child-field-group');
    for (var j = 0; j < childGroups.length; j++) {
        var nameInput = childGroups[j].querySelector('.child-name-input');
        var levelSelect = childGroups[j].querySelector('.child-level-select');
        if (nameInput && levelSelect && nameInput.value.trim() && levelSelect.value) {
            children.push({
                name: nameInput.value.trim(),
                level: levelSelect.value,
                levelName: STUDENT_LEVELS[levelSelect.value]
            });
        }
    }

    if (children.length === 0) {
        showToast('أدخل معلومات التلميذ على الأقل', 'error');
        return;
    }

    var userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    var isAdmin = email.toLowerCase() === DB_KEYS.ADMIN_EMAIL.toLowerCase();

    pendingRegistration = {
        id: userId,
        name: name,
        phone: phone,
        email: email,
        password: password,
        students: children,
        isAdmin: isAdmin,
        verified: false,
        loginDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    authMode = 'register';
    sendVerificationCode(email, name);
}

function updateChildrenCount(delta) {
    var count = parseInt(document.getElementById('reg-children-count').value) || 1;
    count = Math.max(1, Math.min(3, count + delta));
    document.getElementById('reg-children-count').value = count;
    updateChildrenCountDisplay(count);
}

function updateChildrenCountDisplay(count) {
    document.getElementById('children-count-display').textContent = count;
    renderChildrenFields(count);
}

function renderChildrenFields(count) {
    var container = document.getElementById('children-fields-container');
    var html = '';
    var childNames = ['الأول', 'الثاني', 'الثالث'];

    for (var i = 0; i < count; i++) {
        html += '<div class="child-field-group" data-index="' + i + '">' +
            '<div class="child-field-header">' +
                '<span class="child-number">' + (i + 1) + '</span>' +
                '<span class="child-label">التلميذ ' + childNames[i] + '</span>' +
            '</div>' +
            '<div class="child-fields-row">' +
                '<input type="text" class="child-name-input" placeholder="اسم التلميذ" required>' +
                '<select class="child-level-select" required>' +
                    '<option value="">المستوى</option>' +
                    '<option value="preparatory">التحضيريري</option>' +
                    '<option value="1">الأولى ابتدائي</option>' +
                    '<option value="2">الثانية ابتدائي</option>' +
                    '<option value="3">الثالثة ابتدائي</option>' +
                    '<option value="4">الرابعة ابتدائي</option>' +
                    '<option value="5">الخامسة ابتدائي</option>' +
                '</select>' +
            '</div>' +
        '</div>';
    }

    container.innerHTML = html;
}

async function sendVerificationCode(email, name) {
    try {
        if (typeof emailjs === 'undefined') {
            showToast('جاري تحميل الخدمة... حاول مرة أخرى', 'error');
            return;
        }
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_name: name, to_email: email, verification_code: verificationCode
        });

        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('register-page').classList.add('hidden');
        document.getElementById('verification-page').classList.remove('hidden');
        document.getElementById('verification-email-display').textContent = 'تم إرسال كود التحقق إلى ' + email;
        startVerificationTimer();
        for (var ci = 1; ci <= 6; ci++) { var cel = document.getElementById('code-' + ci); if (cel) cel.value = ''; }
        document.getElementById('code-1').focus();
        showToast('تم إرسال كود التحقق', 'success');
    } catch (e) {
        console.error('Email error:', e);
        showToast('خطأ في إرسال البريد', 'error');
    }
}

function handleCodeInput(current, nextId) {
    if (current.value && nextId) document.getElementById(nextId).focus();
}

function handleCodeKeydown(e, current, prevId) {
    if (e.key === 'Backspace' && !current.value && prevId) document.getElementById(prevId).focus();
}

function startVerificationTimer() {
    if (verificationTimer) clearInterval(verificationTimer);
    verificationTimeLeft = 120;
    updateTimerDisplay();
    document.getElementById('resend-btn').disabled = true;
    document.getElementById('verification-timer').style.display = '';
    verificationTimer = setInterval(function() {
        verificationTimeLeft--;
        updateTimerDisplay();
        if (verificationTimeLeft <= 0) {
            clearInterval(verificationTimer);
            document.getElementById('resend-btn').disabled = false;
            document.getElementById('verification-timer').style.display = 'none';
        }
    }, 1000);
}

function updateTimerDisplay() {
    var m = Math.floor(verificationTimeLeft / 60);
    var s = verificationTimeLeft % 60;
    document.getElementById('timer-count').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function resendCode() {
    if (!pendingRegistration) return;
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    sendVerificationCode(pendingRegistration.email, pendingRegistration.name);
}

function backToLogin() {
    clearInterval(verificationTimer);
    document.getElementById('verification-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    for (var i = 1; i <= 6; i++) {
        var el = document.getElementById('code-' + i);
        if (el) el.value = '';
    }
    pendingRegistration = null;
    authMode = '';
}

async function handleVerification(e) {
    e.preventDefault();
    var enteredCode = '';
    for (var i = 1; i <= 6; i++) {
        enteredCode += document.getElementById('code-' + i).value;
    }
    if (enteredCode.length !== 6) {
        showToast('أدخل كود التحقق كاملاً', 'error');
        return;
    }
    if (enteredCode !== verificationCode) {
        showToast('كود التحقق غير صحيح', 'error');
        return;
    }
    if (!pendingRegistration) {
        showToast('خطأ', 'error');
        return;
    }

    var userData = pendingRegistration;

    if (authMode === 'register') {
        // New registration - mark as verified
        userData.verified = true;
        userData.loginDate = new Date().toISOString();
        parentsDatabase.push(userData);
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
        CLOUD_DB.addParent(userData).catch(function() {});
    } else if (authMode === 'verify-existing') {
        // Existing user verifying email
        userData.verified = true;
        // Update in database
        for (var j = 0; j < parentsDatabase.length; j++) {
            if (parentsDatabase[j].id === userData.id) {
                parentsDatabase[j].verified = true;
                break;
            }
        }
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parentsDatabase));
    }

    localStorage.setItem(DB_KEYS.CURRENT_USER, userData.id);
    if (userData.isAdmin) {
        localStorage.setItem(ADMIN_KEY, 'true');
        isAdminLoggedIn = true;
    }

    isLoggedIn = true;
    parentData = userData;
    clearInterval(verificationTimer);
    pendingRegistration = null;
    authMode = '';

    document.getElementById('verification-page').classList.add('hidden');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateProfileCard();

    var adminCard = document.getElementById('admin-home-card');
    if (adminCard) adminCard.style.display = userData.isAdmin ? '' : 'none';

    showToast('مرحباً بكم ' + userData.name + '! تم تفعيل حسابك بنجاح', 'success');
}

function handleLogout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    
    isLoggedIn = false;
    parentData = {};
    authMode = '';
    pendingRegistration = null;
    verificationCode = '';
    if (verificationTimer) { clearInterval(verificationTimer); verificationTimer = null; }
    
    // Hide main app and show login page
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('verification-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    
    // Reset forms
    var loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
    var registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.reset();
    for (var ci = 1; ci <= 6; ci++) { var cel = document.getElementById('code-' + ci); if (cel) cel.value = ''; }
    
    showToast('تم تسجيل الخروج بنجاح', 'normal');
}

// Get all parents (for admin)
function getAllParents() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PARENTS) || '[]');
}

// Get parent by ID
function getParentById(id) {
    const parents = getAllParents();
    return parents.find(p => p.id === id);
}

// Update parent data
function updateParent(id, updates) {
    const parents = getAllParents();
    const index = parents.findIndex(p => p.id === id);
    if (index !== -1) {
        parents[index] = { ...parents[index], ...updates };
        localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(parents));
        if (isLoggedIn && parentData.id === id) {
            parentData = parents[index];
        }
        return true;
    }
    return false;
}

// Delete parent
function deleteParent(id) {
    const parents = getAllParents();
    const filtered = parents.filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PARENTS, JSON.stringify(filtered));
    if (parentData.id === id) {
        handleLogout();
    }
}

// Navigation
function navigateTo(page) {
    currentPage = page;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Scroll to top
    document.getElementById('page-content').scrollTop = 0;

    // Page-specific actions
    if (page === 'facebook') {
        loadFacebookFeed();
    }
    if (page === 'admin') {
        updateAdminView();
    }
}

// Supplies
function showGrade(grade, el) {
    currentGrade = grade;
    document.querySelectorAll('.grade-tab').forEach(tab => tab.classList.remove('active'));
    if (el) el.classList.add('active');
    renderSupplies();
}

function renderSupplies() {
    const container = document.getElementById('supplies-content');
    if (!container) return;
    const grade = GRADES_DATA[currentGrade];
    
    if (!grade) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد بيانات متاحة</p></div>';
        return;
    }

    const savedSupplies = JSON.parse(localStorage.getItem(SUPPLIES_KEY) || '{}');
    const supplies = savedSupplies[currentGrade] || grade.supplies;

    let html = `<h3>${grade.name}</h3>`;
    
    supplies.forEach((item, index) => {
        const itemId = `${currentGrade}_${index}`;
        const isChecked = checkedItems[itemId] || false;
        
        html += `
            <div class="supply-item" onclick="toggleSupplyCheck('${itemId}', this)">
                <span class="supply-number">${index + 1}</span>
                <div class="supply-text">
                    ${item.text || item}
                    ${item.category ? `<div class="supply-category">${item.category}</div>` : ''}
                </div>
                <div class="supply-check ${isChecked ? 'checked' : ''}"></div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleSupplyCheck(itemId, element) {
    checkedItems[itemId] = !checkedItems[itemId];
    localStorage.setItem(CHECKED_ITEMS_KEY, JSON.stringify(checkedItems));
    
    const checkEl = element.querySelector('.supply-check');
    checkEl.classList.toggle('checked');
}

// Facebook Feed
function loadFacebookFeed() {
    const feedContainer = document.getElementById('fb-feed');
    
    // Show loading
    feedContainer.innerHTML = `
        <div class="fb-loading">
            <div class="spinner"></div>
            <p>جاري تحميل المنشورات...</p>
        </div>
    `;

    // Simulate loading with mock data (real Facebook API requires server-side integration)
    setTimeout(() => {
        let html = '';
        
        // Sort posts by date (most recent first) and show only 4
        const sortedPosts = [...facebookPosts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
        
        sortedPosts.forEach(post => {
            const date = new Date(post.date);
            const dateStr = date.toLocaleDateString('ar-DZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Truncate content for summary
            const truncatedContent = post.content.length > 100 
                ? post.content.substring(0, 100) + '...' 
                : post.content;

            const adminButtons = isAdminLoggedIn ? `
                <div class="fb-post-admin-actions">
                    <button class="fb-admin-btn edit" onclick="event.stopPropagation(); editFacebookPost(${post.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        تعديل
                    </button>
                    <button class="fb-admin-btn delete" onclick="event.stopPropagation(); deleteFacebookPost(${post.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        حذف
                    </button>
                </div>
            ` : '';

            html += `
                <div class="fb-post">
                    <div class="fb-post-header">
                        <div class="fb-post-avatar">
                            <svg viewBox="0 0 40 40" width="40" height="40">
                                <circle cx="20" cy="20" r="18" fill="#1a5276" stroke="#f1c40f" stroke-width="1.5"/>
                                <text x="20" y="15" text-anchor="middle" fill="#f1c40f" font-size="5" font-weight="bold" font-family="Noto Kufi Arabic">جمعية</text>
                                <text x="20" y="20" text-anchor="middle" fill="#f1c40f" font-size="3.5" font-family="Noto Kufi Arabic">أولياء التلاميذ</text>
                                <text x="20" y="25" text-anchor="middle" fill="#ecf0f1" font-size="3" font-family="Noto Kufi Arabic">إبتدائية الشيخ</text>
                                <text x="20" y="29" text-anchor="middle" fill="#ecf0f1" font-size="3" font-family="Noto Kufi Arabic">حاج مسعود سعيد</text>
                            </svg>
                        </div>
                        <div class="fb-post-meta">
                            <h4>جمعية أولياء التلاميذ إبتدائية الشيخ حاج مسعود سعيد</h4>
                            <span>${dateStr}</span>
                        </div>
                    </div>
                    <div class="fb-post-content">${truncatedContent}</div>
                    ${adminButtons}
                    <div class="fb-post-actions">
                        <button class="fb-post-action" onclick="event.stopPropagation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            ${post.likes}
                        </button>
                        <button class="fb-post-action" onclick="event.stopPropagation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            ${post.comments}
                        </button>
                        <button class="fb-post-action" onclick="event.stopPropagation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            ${post.shares}
                        </button>
                        <a href="${post.url || FB_PAGE_URL}" target="_blank" class="fb-post-details" onclick="event.stopPropagation()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            تفاصيل
                        </a>
                    </div>
                </div>
            `;
        });

        feedContainer.innerHTML = html;
    }, 1500);
}

// Notifications
function toggleNotifications() {
    const toggle = document.getElementById('notif-toggle');
    
    if (toggle.checked) {
        requestNotificationPermission();
    } else {
        notificationsEnabled = false;
        showToast('تم تعطيل الإشعارات', 'normal');
    }
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('المتصفح لا يدعم الإشعارات', 'error');
        document.getElementById('notif-toggle').checked = false;
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            notificationsEnabled = true;
            showToast('تم تفعيل الإشعارات بنجاح', 'success');
            sendTestNotification();
        } else {
            document.getElementById('notif-toggle').checked = false;
            showToast('تم رفض إذن الإشعارات', 'error');
        }
    });
}

function sendTestNotification() {
    if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification('جمعية أولياء التلاميذ', {
            body: 'تم تفعيل الإشعارات بنجاح. ستصلكم إشعارات عند نشر إعلان جديد.',
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            tag: 'welcome',
            requireInteraction: false
        });
    }
}

function sendNotification(notif) {
    if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification(notif.title, {
            body: notif.body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            tag: 'notif_' + notif.id,
            requireInteraction: notif.priority === 'urgent'
        });
    }
}

function renderNotifications() {
    const container = document.getElementById('notifications-list');
    
    // Filter notifications by active time
    const now = new Date();
    const activeNotifications = notifications.filter(notif => {
        // If no time restrictions, always show
        if (!notif.startTime && !notif.endTime) return true;
        
        const start = notif.startTime ? new Date(notif.startTime) : null;
        const end = notif.endTime ? new Date(notif.endTime) : null;
        
        // Check if within time range
        if (start && now < start) return false;
        if (end && now > end) return false;
        
        return true;
    });

    if (activeNotifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>لا توجد إشعارات حالياً</p>
            </div>
        `;
        return;
    }

    let html = '';
    const sorted = [...activeNotifications].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(notif => {
        const date = new Date(notif.date);
        const dateStr = date.toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Time badge
        let timeBadge = '';
        if (notif.startTime || notif.endTime) {
            timeBadge = '<span class="notif-time-badge">محدد بوقت</span>';
        }

        // Active/Expired status
        let statusClass = '';
        if (notif.endTime) {
            const end = new Date(notif.endTime);
            if (now > end) {
                statusClass = 'expired';
            }
        }

        html += `
            <div class="notif-card ${notif.priority} ${statusClass}">
                <div class="notif-card-header">
                    <span class="notif-priority ${notif.priority}">${getPriorityLabel(notif.priority)}</span>
                    ${timeBadge}
                    <span class="notif-date">${dateStr}</span>
                </div>
                <h4 class="notif-title">${notif.title}</h4>
                <p class="notif-body">${notif.body}</p>
                ${notif.startTime || notif.endTime ? `
                    <div class="notif-time-info">
                        ${notif.startTime ? `<span>من: ${formatDateTime(notif.startTime)}</span>` : ''}
                        ${notif.endTime ? `<span>إلى: ${formatDateTime(notif.endTime)}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-DZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getPriorityLabel(priority) {
    const labels = {
        normal: 'عادي',
        important: 'مهم',
        urgent: 'عاجل'
    };
    return labels[priority] || 'عادي';
}

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const homeCount = document.getElementById('home-notif-count');
    
    if (notifications.length > 0) {
        badge.textContent = notifications.length;
        badge.classList.remove('hidden');
        if (homeCount) {
            homeCount.textContent = notifications.length;
            homeCount.classList.remove('hidden');
        }
    } else {
        badge.classList.add('hidden');
        if (homeCount) homeCount.classList.add('hidden');
    }
}

// Archive
function renderArchive() {
    const container = document.getElementById('archive-list');
    if (!container) return;
    
    // Group posts by year from facebookPosts
    const postsByYear = {};
    facebookPosts.forEach(post => {
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // School year: Sept-Aug. If month >= 8 (Sept), year is start. Else year-1 is start.
        let yearKey;
        if (month >= 8) {
            yearKey = `${year}/${year + 1}`;
        } else {
            yearKey = `${year - 1}/${year}`;
        }
        
        if (!postsByYear[yearKey]) {
            postsByYear[yearKey] = [];
        }
        postsByYear[yearKey].push(post);
    });

    let html = '';
    ARCHIVE_DATA.forEach(item => {
        const yearPosts = postsByYear[item.year] || [];
        const postsCount = yearPosts.length;
        
        // Sort posts by date (newest first)
        const sortedPosts = [...yearPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const postsHtml = sortedPosts.map(post => {
            const date = new Date(post.date);
            const dateStr = date.toLocaleDateString('ar-DZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `
                <div class="archive-post">
                    <div class="archive-post-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${dateStr}
                    </div>
                    <div class="archive-post-content">${post.content}</div>
                    <div class="archive-post-stats">
                        <span>👍 ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                        <span>🔄 ${post.shares}</span>
                    </div>
                    <a href="${post.url || FB_PAGE_URL}" target="_blank" class="archive-post-details" onclick="event.stopPropagation()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        عرض على الفايسبوك
                    </a>
                </div>
            `;
        }).join('');

        html += `
            <div class="archive-item" onclick="toggleArchiveItem(this)">
                <div class="archive-item-header">
                    <div class="archive-year">
                        <div class="archive-year-icon" style="background: ${item.color}; color: white;">${item.year.split('/')[0].slice(-2)}</div>
                        <div class="archive-year-text">
                            <h3>${item.title}</h3>
                            <p>${postsCount > 0 ? postsCount + ' منشور' : 'لا توجد منشورات'}</p>
                        </div>
                    </div>
                    <div class="archive-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                </div>
                <div class="archive-posts-container">
                    ${postsHtml || '<div class="archive-empty">لا توجد منشورات لهذا الموسم على صفحة الفايسبوك</div>'}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleArchiveItem(element) {
    const container = element.querySelector('.archive-posts-container');
    const arrow = element.querySelector('.archive-arrow');
    
    if (container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        arrow.classList.remove('rotated');
    } else {
        container.classList.add('expanded');
        arrow.classList.add('rotated');
    }
}

function showArchiveDetail(year) {
    const item = ARCHIVE_DATA.find(a => a.year === year);
    if (item) {
        showToast(`${item.title}: ${item.description || ''}`, 'normal');
    }
}

// Education Resources
function renderEducationSites() {
    const container = document.getElementById('edu-sites');
    
    let html = '';
    EDUCATION_SITES.forEach(site => {
        html += `
            <a href="${site.url}" target="_blank" rel="noopener" class="edu-card">
                <div class="edu-card-icon" style="background: ${site.color}20; color: ${site.color}">
                    ${site.icon}
                </div>
                <div class="edu-card-text">
                    <h4>${site.title}</h4>
                    <p>${site.description}</p>
                </div>
            </a>
        `;
    });

    container.innerHTML = html;
}

function renderEducationVideos() {
    const container = document.getElementById('edu-videos');
    if (!container) return;
    
    let html = '';
    EDUCATION_VIDEOS.forEach(video => {
        html += `
            <div class="edu-video-card">
                <a href="${video.url}" target="_blank" rel="noopener">
                    <div class="edu-video-thumb">
                        <img src="${video.thumbnail}" alt="${video.title}" onerror="this.style.display='none'">
                        <div class="play-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                    </div>
                    <div class="edu-video-info">
                        <h4>${video.title}</h4>
                        <p class="edu-video-channel">${video.channel}</p>
                        <div class="edu-video-meta">
                            <span class="edu-video-cycle">${video.cycle}</span>
                            <span class="edu-video-level">${video.level}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Admin Panel
function updateAdminView() {
    const loginSection = document.getElementById('admin-login');
    const panelSection = document.getElementById('admin-panel');

    if (isAdminLoggedIn) {
        loginSection.classList.add('hidden');
        panelSection.classList.remove('hidden');
    } else {
        loginSection.classList.remove('hidden');
        panelSection.classList.add('hidden');
    }
}

function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    const errorEl = document.getElementById('admin-error');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        localStorage.setItem(ADMIN_KEY, 'true');
        errorEl.classList.add('hidden');
        updateAdminView();
        showToast('مرحباً بك في لوحة التحكم', 'success');
    } else {
        errorEl.classList.remove('hidden');
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem(ADMIN_KEY);
    updateAdminView();
    showToast('تم تسجيل الخروج', 'normal');
}

function showAdminTab(tabName, el) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    
    if (el) el.classList.add('active');
    else event.target.classList.add('active');
    document.getElementById('admin-' + tabName).classList.add('active');

    if (tabName === 'manage-notifs') {
        renderAdminNotifs();
    }
    if (tabName === 'stats') {
        refreshStats();
    }
}

function addNotification() {
    const title = document.getElementById('notif-title').value.trim();
    const body = document.getElementById('notif-body').value.trim();
    const priority = document.getElementById('notif-priority').value;
    const startTime = document.getElementById('notif-start').value;
    const endTime = document.getElementById('notif-end').value;

    if (!title || !body) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }

    // Validate times
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
        showToast('تاريخ النهاية يجب أن يكون بعد تاريخ البداية', 'error');
        return;
    }

    const newNotif = {
        id: Date.now(),
        title: title,
        body: body,
        priority: priority,
        date: new Date().toISOString(),
        startTime: startTime || null,
        endTime: endTime || null,
        isActive: true
    };

    notifications.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

    // Clear form
    document.getElementById('notif-title').value = '';
    document.getElementById('notif-body').value = '';
    document.getElementById('notif-priority').value = 'normal';
    document.getElementById('notif-start').value = '';
    document.getElementById('notif-end').value = '';

    // Update UI
    renderNotifications();
    renderAdminNotifs();
    updateNotificationBadge();

    // Send push notification if enabled
    sendNotification(newNotif);

    showToast('تم نشر الإشعار بنجاح', 'success');
}

function renderAdminNotifs() {
    const container = document.getElementById('admin-notifs-list');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد إشعارات</p></div>';
        return;
    }

    let html = '';
    notifications.forEach(notif => {
        const date = new Date(notif.date);
        const dateStr = date.toLocaleDateString('ar-DZ', {
            month: 'short',
            day: 'numeric'
        });

        // Time info
        let timeInfo = '';
        if (notif.startTime || notif.endTime) {
            timeInfo = '<div class="admin-notif-time">';
            if (notif.startTime) {
                timeInfo += `<span>من: ${formatDateTime(notif.startTime)}</span>`;
            }
            if (notif.endTime) {
                timeInfo += `<span>إلى: ${formatDateTime(notif.endTime)}</span>`;
            }
            timeInfo += '</div>';
        }

        html += `
            <div class="admin-notif-item">
                <div class="admin-notif-item-info">
                    <h5>${notif.title}</h5>
                    <span>${dateStr} - ${getPriorityLabel(notif.priority)}</span>
                    ${timeInfo}
                </div>
                <button class="admin-delete-btn" onclick="deleteNotification(${notif.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    renderNotifications();
    renderAdminNotifs();
    updateNotificationBadge();
    showToast('تم حذف الإشعار', 'normal');
}

function updateSupplies() {
    const grade = document.getElementById('supplies-grade-select').value;
    const text = document.getElementById('supplies-text').value.trim();

    if (!text) {
        showToast('يرجى إدخال قائمة الأدوات', 'error');
        return;
    }

    const items = text.split('\n').filter(item => item.trim()).map(item => ({
        text: item.trim(),
        category: 'أدوات مدرسية'
    }));

    const savedSupplies = JSON.parse(localStorage.getItem(SUPPLIES_KEY) || '{}');
    savedSupplies[grade] = items;
    localStorage.setItem(SUPPLIES_KEY, JSON.stringify(savedSupplies));

    document.getElementById('supplies-text').value = '';
    showToast('تم تحديث قائمة الأدوات بنجاح', 'success');
    
    // Refresh supplies view if on that grade
    if (currentGrade === grade) {
        renderSupplies();
    }
}

// Calculator Functions
const CALC_DATA = {
    grade1: {
        name: 'السنة الأولى ابتدائي',
        color: '#e74c3c',
        items: [
            { name: 'كراسان (2) 64 ص', qty: 2, type: 'notebook' },
            { name: 'كراس واحد للرسم', qty: 1, type: 'notebook' },
            { name: 'أغلفة بلاستيكية للكراريس', qty: 3, type: 'supply' },
            { name: 'لوحة + ممسحة', qty: 1, type: 'supply' },
            { name: 'سيالتان (زرقاء + خضراء)', qty: 2, type: 'supply' },
            { name: 'قلم رصاص + مبراة + ممحاة', qty: 1, type: 'supply' },
            { name: 'علبة 6 أقلام ملونة', qty: 1, type: 'supply' },
            { name: 'مسطرة', qty: 1, type: 'supply' },
            { name: 'قريصات وخشيبيات', qty: 1, type: 'supply' },
            { name: 'عجينة', qty: 1, type: 'supply' },
            { name: 'أوراق ملونة', qty: 1, type: 'supply' }
        ]
    },
    grade2: {
        name: 'السنة الثانية ابتدائي',
        color: '#e67e22',
        items: [
            { name: 'كراسان (2) 64 ص', qty: 2, type: 'notebook' },
            { name: 'كراس واحد للرسم', qty: 1, type: 'notebook' },
            { name: 'أغلفة بلاستيكية للكراريس', qty: 3, type: 'supply' },
            { name: 'لوحة + ممسحة', qty: 1, type: 'supply' },
            { name: 'سيالتان (زرقاء + خضراء)', qty: 2, type: 'supply' },
            { name: 'قلم رصاص + مبراة + ممحاة', qty: 1, type: 'supply' },
            { name: 'علبة 6 أقلام ملونة', qty: 1, type: 'supply' },
            { name: 'مسطرة', qty: 1, type: 'supply' },
            { name: 'قريصات وخشيبيات', qty: 1, type: 'supply' },
            { name: 'عجينة', qty: 1, type: 'supply' },
            { name: 'أوراق ملونة', qty: 1, type: 'supply' }
        ]
    },
    grade3: {
        name: 'السنة الثالثة ابتدائي',
        color: '#f1c40f',
        items: [
            { name: '7 كراريس 64 ص', qty: 7, type: 'notebook' },
            { name: 'كراسان أعمال تطبيقية صغير', qty: 2, type: 'notebook' },
            { name: 'أغلفة بلاستيكية للكراريس', qty: 9, type: 'supply' },
            { name: 'لوحة + ممسحة', qty: 1, type: 'supply' },
            { name: 'سيالتان (زرقاء + خضراء)', qty: 2, type: 'supply' },
            { name: 'قلم رصاص + مبراة + ممحاة', qty: 1, type: 'supply' },
            { name: 'علبة 6 أقلام ملونة', qty: 1, type: 'supply' },
            { name: 'مسطرة', qty: 1, type: 'supply' },
            { name: 'كوس', qty: 1, type: 'supply' }
        ]
    },
    grade4: {
        name: 'السنة الرابعة ابتدائي',
        color: '#27ae60',
        items: [
            { name: '10 كراريس 64 ص', qty: 10, type: 'notebook' },
            { name: '3 كراريس أعمال تطبيقية صغير', qty: 3, type: 'notebook' },
            { name: 'أغلفة بلاستيكية للكراريس', qty: 13, type: 'supply' },
            { name: 'لوحة + ممسحة', qty: 1, type: 'supply' },
            { name: 'سيالتان (زرقاء + خضراء)', qty: 2, type: 'supply' },
            { name: 'قلم رصاص + مبراة + ممحاة', qty: 1, type: 'supply' },
            { name: 'علبة 6 أقلام ملونة', qty: 1, type: 'supply' },
            { name: 'مسطرة', qty: 1, type: 'supply' },
            { name: 'كوس', qty: 1, type: 'supply' },
            { name: 'منقلة', qty: 1, type: 'supply' },
            { name: 'مدور', qty: 1, type: 'supply' }
        ]
    },
    grade5: {
        name: 'السنة الخامسة ابتدائي',
        color: '#9b59b6',
        items: [
            { name: '10 كراريس 64 ص', qty: 10, type: 'notebook' },
            { name: '3 كراريس أعمال تطبيقية صغير', qty: 3, type: 'notebook' },
            { name: 'أغلفة بلاستيكية للكراريس', qty: 13, type: 'supply' },
            { name: 'لوحة + ممسحة', qty: 1, type: 'supply' },
            { name: 'سيالتان (زرقاء + خضراء)', qty: 2, type: 'supply' },
            { name: 'قلم رصاص + مبراة + ممحاة', qty: 1, type: 'supply' },
            { name: 'علبة 6 أقلام ملونة', qty: 1, type: 'supply' },
            { name: 'مسطرة', qty: 1, type: 'supply' },
            { name: 'كوس', qty: 1, type: 'supply' },
            { name: 'منقلة', qty: 1, type: 'supply' },
            { name: 'مدور', qty: 1, type: 'supply' }
        ]
    }
};

function updateCalc(grade, delta) {
    const input = document.getElementById('calc-' + grade);
    let value = parseInt(input.value) || 0;
    value = Math.max(0, value + delta);
    input.value = value;
    calculateTotal();
}

function calculateTotal() {
    const grades = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5'];
    let totalStudents = 0;
    let allItems = {};
    let totalNotebooks = 0;
    let totalSupplies = 0;

    grades.forEach(grade => {
        const count = parseInt(document.getElementById('calc-' + grade).value) || 0;
        totalStudents += count;

        if (count > 0) {
            const gradeData = CALC_DATA[grade];
            gradeData.items.forEach(item => {
                if (!allItems[item.name]) {
                    allItems[item.name] = { qty: 0, type: item.type };
                }
                allItems[item.name].qty += item.qty * count;
                
                if (item.type === 'notebook') {
                    totalNotebooks += item.qty * count;
                } else {
                    totalSupplies += item.qty * count;
                }
            });
        }
    });

    document.getElementById('calc-total-students').textContent = totalStudents;
    document.getElementById('calc-total-notebooks').textContent = totalNotebooks;
    document.getElementById('calc-total-supplies').textContent = totalSupplies;

    // Render results
    const resultsContainer = document.getElementById('calc-results');
    
    if (totalStudents === 0) {
        resultsContainer.innerHTML = `
            <div class="calc-empty">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <line x1="8" y1="6" x2="16" y2="6"/>
                    <line x1="8" y1="10" x2="16" y2="10"/>
                    <line x1="8" y1="14" x2="12" y2="14"/>
                </svg>
                <p>أدخل عدد التلاميذ لحساب المجموع</p>
            </div>
        `;
        return;
    }

    let html = '<h3 class="calc-results-title">قائمة الأدوات المطلوبة</h3>';
    
    // Per grade breakdown
    grades.forEach(grade => {
        const count = parseInt(document.getElementById('calc-' + grade).value) || 0;
        if (count > 0) {
            const gradeData = CALC_DATA[grade];
            html += `
                <div class="calc-grade-section">
                    <div class="calc-grade-header" style="border-right-color: ${gradeData.color}">
                        <span>${gradeData.name}</span>
                        <span class="calc-grade-count">${count} تلميذ</span>
                    </div>
                </div>
            `;
        }
    });

    // Notebooks section
    html += '<div class="calc-items-section"><h4 class="calc-section-title notebooks-title">📚 الكراريس</h4>';
    Object.keys(allItems).sort().forEach(itemName => {
        if (allItems[itemName].type === 'notebook') {
            html += `
                <div class="calc-item-row">
                    <span class="calc-item-name">${itemName}</span>
                    <span class="calc-item-qty">${allItems[itemName].qty}</span>
                </div>
            `;
        }
    });
    html += '</div>';

    // Supplies section
    html += '<div class="calc-items-section"><h4 class="calc-section-title supplies-title">🎒 الأدوات الأخرى</h4>';
    Object.keys(allItems).sort().forEach(itemName => {
        if (allItems[itemName].type === 'supply') {
            html += `
                <div class="calc-item-row">
                    <span class="calc-item-name">${itemName}</span>
                    <span class="calc-item-qty">${allItems[itemName].qty}</span>
                </div>
            `;
        }
    });
    html += '</div>';

    resultsContainer.innerHTML = html;
}

function resetCalculator() {
    ['grade1', 'grade2', 'grade3', 'grade4', 'grade5'].forEach(grade => {
        document.getElementById('calc-' + grade).value = 0;
    });
    calculateTotal();
    showToast('تم إعادة تعيين الحاسبة', 'normal');
}

function printCalculator() {
    const totalStudents = document.getElementById('calc-total-students').textContent;
    if (totalStudents === '0') {
        showToast('أدخل عدد التلاميذ أولاً', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    const grades = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5'];
    let allItems = {};
    let totalNotebooks = 0;
    let totalSupplies = 0;

    grades.forEach(grade => {
        const count = parseInt(document.getElementById('calc-' + grade).value) || 0;
        if (count > 0) {
            const gradeData = CALC_DATA[grade];
            gradeData.items.forEach(item => {
                if (!allItems[item.name]) {
                    allItems[item.name] = { qty: 0, type: item.type };
                }
                allItems[item.name].qty += item.qty * count;
                
                if (item.type === 'notebook') {
                    totalNotebooks += item.qty * count;
                } else {
                    totalSupplies += item.qty * count;
                }
            });
        }
    });

    let content = `
        <html dir="rtl">
        <head>
            <title>قائمة الأدوات المدرسية - جمعية أولياء التلاميذ</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #1a5276; }
                h2 { color: #1a5276; border-bottom: 2px solid #f1c40f; padding-bottom: 5px; }
                .header { text-align: center; margin-bottom: 20px; }
                .totals { display: flex; justify-content: space-around; margin: 20px 0; }
                .total-box { background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; flex: 1; margin: 0 5px; }
                .total-box h3 { margin: 0; font-size: 14px; color: #666; }
                .total-box p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1a5276; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background: #1a5276; color: white; }
                tr:nth-child(even) { background: #f9f9f9; }
                .section-title { background: #f1c40f; color: #1a5276; padding: 8px; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>جمعية أولياء التلاميذ</h1>
                <p>إبتدائية حاج مسعود سعيد - بلدية العطف - تجنينت - غرداية</p>
                <p>الموسم الدراسي 2026/2027</p>
            </div>
            <div class="totals">
                <div class="total-box">
                    <h3>إجمالي التلاميذ</h3>
                    <p>${totalStudents}</p>
                </div>
                <div class="total-box">
                    <h3>الكراريس</h3>
                    <p>${totalNotebooks}</p>
                </div>
                <div class="total-box">
                    <h3>الأدوات الأخرى</h3>
                    <p>${totalSupplies}</p>
                </div>
            </div>
            <table>
                <tr><th>العدد</th><th>المنتج</th><th>النوع</th></tr>
    `;

    // Notebooks
    content += `<tr><td colspan="3" class="section-title">الكراريس</td></tr>`;
    Object.keys(allItems).sort().forEach(itemName => {
        if (allItems[itemName].type === 'notebook') {
            content += `<tr><td>${allItems[itemName].qty}</td><td>${itemName}</td><td>كراس</td></tr>`;
        }
    });

    // Supplies
    content += `<tr><td colspan="3" class="section-title">الأدوات الأخرى</td></tr>`;
    Object.keys(allItems).sort().forEach(itemName => {
        if (allItems[itemName].type === 'supply') {
            content += `<tr><td>${allItems[itemName].qty}</td><td>${itemName}</td><td>أداة</td></tr>`;
        }
    });

    content += `
            </table>
            <div class="footer">
                <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-DZ')}</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

// Copy Facebook Link
function copyFacebookLink(event) {
    event.preventDefault();
    const link = 'https://www.facebook.com/Association.Ecole.AmiHamou';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('تم نسخ الرابط بنجاح', 'success');
        });
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('تم نسخ الرابط بنجاح', 'success');
    }
}

// Books Calculator Functions
let currentBooksGrade = 'preparatory';

function selectBooksGrade(grade, element) {
    currentBooksGrade = grade;
    
    // Update active button
    document.querySelectorAll('.books-grade-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    renderBooksList();
    calculateBooksTotal();
}

function renderBooksList() {
    const container = document.getElementById('books-list');
    const gradeData = BOOKS_DATA[currentBooksGrade];
    
    if (!gradeData) {
        container.innerHTML = '<div class="empty-state"><p>لا توجد بيانات</p></div>';
        return;
    }

    let html = `
        <div class="books-grade-header">
            <h3>${gradeData.name}</h3>
            <span class="books-grade-total">سعر الكتاب: ${gradeData.total.toLocaleString('ar-DZ')} د.ج</span>
        </div>
    `;

    gradeData.books.forEach((book, index) => {
        html += `
            <div class="book-item">
                <span class="book-number">${index + 1}</span>
                <div class="book-info">
                    <span class="book-title">${book.title}</span>
                    <span class="book-code">الرمز: ${book.code}</span>
                </div>
                <div class="book-price-section">
                    <span class="book-price">${book.price.toLocaleString('ar-DZ')} د.ج</span>
                    <div class="book-qty-wrapper">
                        <button class="book-qty-btn minus" onclick="updateBookQty(${index}, -1)">-</button>
                        <input type="number" id="book-qty-${index}" value="0" min="0" onchange="calculateBooksTotal()">
                        <button class="book-qty-btn plus" onclick="updateBookQty(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateBookQty(index, delta) {
    const input = document.getElementById('book-qty-' + index);
    let value = parseInt(input.value) || 0;
    value = Math.max(0, value + delta);
    input.value = value;
    calculateBooksTotal();
}

function calculateBooksTotal() {
    const gradeData = BOOKS_DATA[currentBooksGrade];
    let totalItems = 0;
    let totalPrice = 0;
    
    gradeData.books.forEach((book, index) => {
        const qty = parseInt(document.getElementById('book-qty-' + index).value) || 0;
        totalItems += qty;
        totalPrice += book.price * qty;
    });
    
    const studentsCount = parseInt(document.getElementById('books-students-count').value) || 1;
    const grandTotal = totalPrice * studentsCount;
    
    document.getElementById('books-total-items').textContent = totalItems;
    document.getElementById('books-total-price').textContent = totalPrice.toLocaleString('ar-DZ') + ' د.ج';
    document.getElementById('books-grand-total').textContent = grandTotal.toLocaleString('ar-DZ') + ' د.ج';
}

function resetBooksCalculator() {
    document.getElementById('books-students-count').value = 1;
    currentBooksGrade = 'preparatory';
    
    // Reset active button
    document.querySelectorAll('.books-grade-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.books-grade-btn').classList.add('active');
    
    renderBooksList();
    calculateBooksTotal();
    showToast('تم إعادة تعيين الحاسبة', 'normal');
}

function printBooksCalculator() {
    const gradeData = BOOKS_DATA[currentBooksGrade];
    const studentsCount = parseInt(document.getElementById('books-students-count').value) || 1;
    
    // Calculate totals from quantities
    let totalItems = 0;
    let totalPrice = 0;
    let booksWithQty = [];
    
    gradeData.books.forEach((book, index) => {
        const qty = parseInt(document.getElementById('book-qty-' + index).value) || 0;
        if (qty > 0) {
            booksWithQty.push({ ...book, qty: qty, subtotal: book.price * qty });
            totalItems += qty;
            totalPrice += book.price * qty;
        }
    });
    
    const grandTotal = totalPrice * studentsCount;
    
    const printWindow = window.open('', '_blank');
    
    let content = `
        <html dir="rtl">
        <head>
            <title>قائمة الكتب - ${gradeData.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #1a5276; }
                .header { text-align: center; margin-bottom: 20px; }
                .totals { display: flex; justify-content: space-around; margin: 20px 0; }
                .total-box { background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; flex: 1; margin: 0 5px; }
                .total-box h3 { margin: 0; font-size: 14px; color: #666; }
                .total-box p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1a5276; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background: #1a5276; color: white; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>جمعية أولياء التلاميذ</h1>
                <p>إبتدائية حاج مسعود سعيد - بلدية العطف - تجنينت - غرداية</p>
                <p>الموسم الدراسي 2026/2027</p>
            </div>
            <h2 style="text-align: center; color: #1a5276;">${gradeData.name}</h2>
            <div class="totals">
                <div class="total-box">
                    <h3>عدد التلاميذ</h3>
                    <p>${studentsCount}</p>
                </div>
                <div class="total-box">
                    <h3>إجمالي الكتب</h3>
                    <p>${totalItems}</p>
                </div>
                <div class="total-box">
                    <h3>المجموع الكلي</h3>
                    <p>${grandTotal.toLocaleString('ar-DZ')} د.ج</p>
                </div>
            </div>
            <table>
                <tr><th>المجموع</th><th>العدد</th><th>السعر</th><th>عنوان الكتاب</th><th>الرمز</th></tr>
    `;

    booksWithQty.forEach(book => {
        content += `<tr><td>${book.subtotal.toLocaleString('ar-DZ')} د.ج</td><td>${book.qty}</td><td>${book.price.toLocaleString('ar-DZ')} د.ج</td><td>${book.title}</td><td>${book.code}</td></tr>`;
    });

    content += `
            </table>
            <div class="footer">
                <p>الديوان الوطني للمطبوعات المدرسية</p>
                <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-DZ')}</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

// Toast Notifications
function showToast(message, type = 'normal') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle keyboard submit for admin login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (currentPage === 'admin' && !isAdminLoggedIn) {
            adminLogin();
        }
    }
});

// Facebook Posts Admin Functions
function deleteFacebookPost(postId) {
    if (!isAdminLoggedIn) return;
    
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
        facebookPosts = facebookPosts.filter(p => p.id !== postId);
        localStorage.setItem(FB_POSTS_KEY, JSON.stringify(facebookPosts));
        loadFacebookFeed();
        showToast('تم حذف المنشور بنجاح', 'success');
    }
}

function editFacebookPost(postId) {
    if (!isAdminLoggedIn) return;
    
    const post = facebookPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newContent = prompt('تعديل المنشور:', post.content);
    if (newContent !== null && newContent.trim() !== '') {
        post.content = newContent.trim();
        localStorage.setItem(FB_POSTS_KEY, JSON.stringify(facebookPosts));
        loadFacebookFeed();
        showToast('تم تعديل المنشور بنجاح', 'success');
    }
}

// Notifications Functions
function enableNotifications() {
    if (!('Notification' in window)) {
        showToast('متصفحك لا يدعم الإشعارات', 'error');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            notificationsEnabled = true;
            document.getElementById('notif-toggle').checked = true;
            closeNotifModal();
            showToast('تم تفعيل الإشعارات بنجاح', 'success');
            
            // Send test notification
            new Notification('جمعية أولياء التلاميذ', {
                body: 'تم تفعيل الإشعارات بنجاح!',
                icon: 'icons/icon-192.png'
            });
        } else {
            notificationsEnabled = false;
            document.getElementById('notif-toggle').checked = false;
            showToast('لم يتم تفعيل الإشعارات', 'error');
        }
    });
}

function closeNotifModal() {
    document.getElementById('notif-permission-modal').classList.add('hidden');
}

// PWA Install Feature
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
}

function installApp() {
    if (!deferredPrompt) {
        showToast('يمكنك تثبيت التطبيق من قائمة المتصفح', 'normal');
        return;
    }
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            showToast('جاري تثبيت التطبيق...', 'success');
        }
        deferredPrompt = null;
    });
}

window.addEventListener('appinstalled', () => {
    showToast('تم تثبيت التطبيق بنجاح', 'success');
    deferredPrompt = null;
});

// Admin Statistics Functions
async function refreshStats() {
    const loading = document.getElementById('stats-loading');
    const content = document.getElementById('stats-content');
    
    if (loading) loading.classList.remove('hidden');
    if (content) content.classList.add('hidden');
    
    try {
        const stats = await CLOUD_DB.getStats();
        
        if (!stats) {
            if (loading) loading.textContent = 'لا توجد بيانات';
            return;
        }
        
        // Update numbers
        document.getElementById('stat-parents').textContent = stats.totalParents;
        document.getElementById('stat-students').textContent = stats.totalStudents;
        
        // Update levels
        const levelsHtml = Object.entries(stats.studentsByLevel).map(([level, count]) => 
            `<div class="level-bar">
                <span class="level-name">${level}</span>
                <div class="level-bar-fill" style="width: ${stats.totalStudents > 0 ? Math.min(count / stats.totalStudents * 100, 100) : 0}%"></div>
                <span class="level-count">${count}</span>
            </div>`
        ).join('');
        document.getElementById('stats-levels').innerHTML = levelsHtml || '<p>لا توجد بيانات بعد</p>';
        
        // Update recent
        const recentHtml = stats.recentParents.map(p => {
            const date = p.loginDate ? new Date(p.loginDate).toLocaleDateString('ar-DZ') : '';
            const students = p.students ? p.students.length : 0;
            return `<div class="recent-item">
                <span class="recent-name">${p.name}</span>
                <span class="recent-info">${students} تلاميذ - ${date}</span>
            </div>`;
        }).join('');
        document.getElementById('stats-recent').innerHTML = recentHtml || '<p>لا يوجد مستخدمين بعد</p>';
        
        if (loading) loading.classList.add('hidden');
        if (content) content.classList.remove('hidden');
    } catch (e) {
        console.error('Stats error:', e);
        if (loading) loading.textContent = 'خطأ في تحميل البيانات';
    }
}

async function exportCSV() {
    try {
        const csv = await CLOUD_DB.exportCSV();
        if (!csv) {
            showToast('لا توجد بيانات للتصدير', 'error');
            return;
        }
        
        // Add BOM for Arabic support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('تم تصدير البيانات بنجاح', 'success');
    } catch (e) {
        console.error('Export error:', e);
        showToast('خطأ في التصدير', 'error');
    }
}

// Service Worker Registration - DISABLED temporarily to fix splash issue
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('sw.js')
//             .then(reg => console.log('SW registered:', reg.scope))
//             .catch(err => console.log('SW registration failed:', err));
//     });
// }
