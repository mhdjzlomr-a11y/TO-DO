/**
 * ONE DAY - Cross-Device Gmail Cloud Sync Engine
 * Supports:
 *   1. Google Sign-In + Firebase Firestore Real-Time Sync (Free Spark Plan)
 *   2. Personal Google Drive Sync (via Google Apps Script - Free Forever)
 * Shares Firebase Project Config seamlessly across TO-DO & OFFICE FINANCE on the same origin.
 */

class OneDayCloudSync {
  constructor() {
    this.config = {
      provider: 'none', // 'none' | 'firebase' | 'apps_script'
      gmail: '',
      scriptUrl: '',
      syncKey: '',
      firebaseConfig: null,
      autoSync: true,
      lastSyncAt: null,
      pendingPush: false
    };

    this.state = 'off'; // 'off' | 'syncing' | 'synced' | 'pending' | 'error'
    this.lastError = '';
    this.isSyncing = false;
    this.pushTimer = null;
    this.pollTimer = null;
    this.onUpdateCallback = null;

    this._fbInitialized = false;
    this._fbApp = null;
    this._fbAuth = null;
    this._fbDb = null;
    this._fbUser = null;
    this._fbUnsubDoc = null;
  }

  utf8ToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  base64UrlToUtf8(b64u) {
    let b64 = String(b64u || '').replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  parseFlexibleFirebaseConfig(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch (_) {}

    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start >= 0 && end > start) {
      let body = s.slice(start, end + 1);
      body = body.replace(/\/\/.*$/gm, '');
      body = body.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      body = body.replace(/:\s*'([^']*)'/g, ': "$1"');
      body = body.replace(/,\s*}/g, '}');
      try {
        return JSON.parse(body);
      } catch (_) {}
    }
    throw new Error('Could not parse Firebase config. Please paste the firebaseConfig { apiKey, authDomain, projectId, ... } block.');
  }

  async init(onUpdateCallback) {
    this.onUpdateCallback = onUpdateCallback;

    // 1. Load saved local config
    try {
      const rawCfg = localStorage.getItem('oneday_cloud_cfg_v1');
      if (rawCfg) {
        const parsed = JSON.parse(rawCfg);
        if (parsed && typeof parsed === 'object') {
          this.config = { ...this.config, ...parsed };
        }
      }
    } catch (_) {}

    // 2. Check optional repo-level config or cross-app shared Firebase config
    if (this.config.provider === 'none' && window.ONEDAY_CLOUD_CONFIG) {
      this.config = { ...this.config, ...window.ONEDAY_CLOUD_CONFIG };
      this.saveConfig();
    } else if (!this.config.firebaseConfig) {
      try {
        const sharedFb = localStorage.getItem('shared_firebase_config_v1');
        if (sharedFb) {
          const parsedFb = JSON.parse(sharedFb);
          if (parsedFb && parsedFb.apiKey && parsedFb.projectId) {
            this.config.firebaseConfig = parsedFb;
          }
        }
      } catch (_) {}
    }

    // 3. Check Magic Device Link (?cloudSync=...)
    let linkedFromUrl = false;
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('cloudSync');
      if (token) {
        const decoded = JSON.parse(this.base64UrlToUtf8(token));
        if (decoded && (decoded.provider === 'firebase' || decoded.provider === 'apps_script')) {
          this.config = {
            ...this.config,
            ...decoded,
            autoSync: true,
            pendingPush: false
          };
          this.saveConfig();
          linkedFromUrl = true;

          params.delete('cloudSync');
          const cleanQs = params.toString();
          const newUrl = window.location.pathname + (cleanQs ? '?' + cleanQs : '') + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    } catch (err) {
      console.warn('Invalid ONE DAY cloudSync link:', err);
    }

    // 4. Online / Offline / Visibility listeners
    window.addEventListener('online', () => {
      if (this.isConfigured()) this.syncNow(false);
    });
    window.addEventListener('offline', () => {
      if (this.isConfigured()) this.setState(this.config.pendingPush ? 'pending' : 'error', 'Offline');
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConfigured() && navigator.onLine) {
        this.syncNow(false);
      }
    });

    await this.activateProvider(linkedFromUrl);
    return { linkedFromUrl };
  }

  isConfigured() {
    if (this.config.provider === 'apps_script') {
      return Boolean(this.config.scriptUrl && this.config.gmail);
    }
    if (this.config.provider === 'firebase') {
      return Boolean(this.config.firebaseConfig && this.config.firebaseConfig.apiKey && this.config.firebaseConfig.projectId);
    }
    return false;
  }

  saveConfig() {
    try {
      localStorage.setItem('oneday_cloud_cfg_v1', JSON.stringify(this.config));
      if (this.config.firebaseConfig && this.config.firebaseConfig.apiKey && this.config.firebaseConfig.projectId) {
        localStorage.setItem('shared_firebase_config_v1', JSON.stringify(this.config.firebaseConfig));
      }
    } catch (_) {}
  }

  setState(state, errMsg = '') {
    this.state = state;
    this.lastError = errMsg || '';
    if (this.onUpdateCallback) {
      this.onUpdateCallback({ state: this.state, error: this.lastError, changed: false });
    }
  }

  async activateProvider(forceNotify = false) {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.config.provider === 'apps_script' && this.isConfigured()) {
      this.setState(this.config.pendingPush ? 'pending' : 'synced');
      if (navigator.onLine) await this.syncNow(forceNotify);
      this.pollTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && navigator.onLine && this.config.autoSync !== false) {
          this.syncNow(false);
        }
      }, 20000);
    } else if (this.config.provider === 'firebase' && this.isConfigured()) {
      await this.initFirebaseRuntime();
    } else {
      this.setState('off');
    }
  }

  markLocalChange() {
    if (!this.isConfigured()) return;
    this.config.pendingPush = true;
    this.saveConfig();
    this.setState('pending');

    if (this.config.autoSync === false) return;
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      if (navigator.onLine) this.syncNow(false);
    }, 650);
  }

  async syncNow(showToast = false) {
    if (!this.isConfigured()) {
      this.setState('off');
      return { ok: false, error: 'Not configured' };
    }
    if (!navigator.onLine) {
      this.setState(this.config.pendingPush ? 'pending' : 'error', 'Offline');
      return { ok: false, error: 'Offline' };
    }
    if (this.isSyncing) return { ok: true, skipped: true };

    if (this.config.provider === 'firebase') return await this.syncFirebaseNow(showToast);
    if (this.config.provider === 'apps_script') return await this.syncAppsScript(showToast);
    return { ok: false };
  }

  // ================= PROVIDER 1: FIREBASE + GOOGLE SIGN-IN =================

  loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  async ensureFirebaseSdk() {
    if (window.firebase && window.firebase.auth && window.firebase.firestore) return;
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
  }

  formatFirebaseError(err) {
    const code = (err && err.code) || '';
    if (code === 'auth/unauthorized-domain') {
      return 'Unauthorized domain: Add mhdjzlomr-a11y.github.io in Firebase Console -> Authentication -> Settings -> Authorized domains.';
    }
    if (code === 'permission-denied' || (err && String(err.message).includes('permissions'))) {
      return 'Firestore Permission Denied: Publish security rules allowing match /users/{userId}/{document=**}.';
    }
    return (err && err.message) || 'Cloud error';
  }

  async initFirebaseRuntime() {
    try {
      await this.ensureFirebaseSdk();
      const targetProjectId = this.config.firebaseConfig && this.config.firebaseConfig.projectId;
      const currentProjectId = this._fbApp && this._fbApp.options ? this._fbApp.options.projectId : null;

      if (this._fbInitialized && currentProjectId && targetProjectId && currentProjectId !== targetProjectId) {
        this.unsubscribeFirestore();
        try { await this._fbApp.delete(); } catch (_) {}
        this._fbInitialized = false;
        this._fbApp = null;
      }

      if (!this._fbInitialized) {
        if (!firebase.apps.length) {
          this._fbApp = firebase.initializeApp(this.config.firebaseConfig);
        } else {
          this._fbApp = firebase.apps[0];
        }
        this._fbAuth = firebase.auth();
        this._fbDb = firebase.firestore();
        try {
          await this._fbDb.enablePersistence({ synchronizeTabs: true });
        } catch (_) {}
        this._fbInitialized = true;

        this._fbAuth.getRedirectResult().catch((err) => {
          if (err && err.code) {
            this.setState('error', this.formatFirebaseError(err));
          }
        });

        this._fbAuth.onAuthStateChanged(async (user) => {
          this._fbUser = user;
          if (user) {
            this.config.gmail = user.email || this.config.gmail;
            this.saveConfig();
            this.subscribeFirestoreUser(user.uid);
            await this.syncFirebaseNow(false);
          } else {
            this.unsubscribeFirestore();
            this.setState('pending', 'Sign in with Google');
          }
        });
      } else if (this._fbUser) {
        await this.syncFirebaseNow(false);
      }
    } catch (err) {
      this.setState('error', err.message || 'Firebase init failed');
    }
  }

  async signInWithFirebaseGoogle(fbConfigInput = null) {
    if (fbConfigInput) {
      this.config.provider = 'firebase';
      this.config.firebaseConfig = fbConfigInput;
      this.saveConfig();
    }
    await this.initFirebaseRuntime();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await this._fbAuth.signInWithPopup(provider);
    } catch (err) {
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
        await this._fbAuth.signInWithRedirect(provider);
      } else if (err && err.code === 'auth/popup-closed-by-user') {
        throw err;
      } else {
        throw new Error(this.formatFirebaseError(err));
      }
    }
  }

  unsubscribeFirestore() {
    if (this._fbUnsubDoc) {
      this._fbUnsubDoc();
      this._fbUnsubDoc = null;
    }
  }

  subscribeFirestoreUser(uid) {
    this.unsubscribeFirestore();
    if (!this._fbDb || !uid) return;

    const docRef = this._fbDb.collection('users').doc(uid).collection('apps').doc('oneday');
    this._fbUnsubDoc = docRef.onSnapshot((snap) => {
      if (!snap.exists || this.isSyncing) return;
      const remoteVault = snap.data();
      if (typeof window.mergeOneDayCloudVault === 'function') {
        const res = window.mergeOneDayCloudVault(remoteVault);
        if (this.onUpdateCallback) {
          this.onUpdateCallback({ state: 'synced', error: '', changed: res.changed });
        }
      }
    }, (err) => {
      this.setState('error', this.formatFirebaseError(err));
    });
  }

  async syncFirebaseNow(showToast = false) {
    if (!this._fbAuth || !this._fbDb || !this._fbUser) {
      this.setState('pending', 'Sign in with Google required');
      return { ok: false, error: 'Sign in with Google required' };
    }
    this.isSyncing = true;
    this.setState('syncing');

    try {
      const uid = this._fbUser.uid;
      const docRef = this._fbDb.collection('users').doc(uid).collection('apps').doc('oneday');
      const snap = await docRef.get();
      const remoteVault = snap.exists ? snap.data() : null;

      let changed = false;
      if (remoteVault && typeof window.mergeOneDayCloudVault === 'function') {
        const res = window.mergeOneDayCloudVault(remoteVault);
        changed = res.changed;
      }

      if (typeof window.exportOneDayCloudVault === 'function') {
        const localVault = window.exportOneDayCloudVault();
        const rTime = remoteVault && remoteVault.updatedAt ? new Date(remoteVault.updatedAt).getTime() : 0;
        const lTime = localVault.updatedAt ? new Date(localVault.updatedAt).getTime() : Date.now();
        if (!remoteVault || this.config.pendingPush || lTime >= rTime) {
          await docRef.set(localVault);
        }
      }

      this.config.pendingPush = false;
      this.config.lastSyncAt = new Date().toISOString();
      this.saveConfig();
      this.state = 'synced';
      this.lastError = '';

      if (this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed, showToast });
      }
      return { ok: true, changed };
    } catch (err) {
      const msg = this.formatFirebaseError(err);
      this.setState('error', msg);
      return { ok: false, error: msg };
    } finally {
      this.isSyncing = false;
    }
  }

  // ================= PROVIDER 2: PERSONAL GOOGLE DRIVE (APPS SCRIPT) =================

  async syncAppsScript(showToast = false) {
    this.isSyncing = true;
    this.setState('syncing');

    try {
      const url = this.config.scriptUrl.trim();
      const gmail = this.config.gmail.trim().toLowerCase();
      const key = (this.config.syncKey || '').trim();
      let changed = false;

      if (this.config.pendingPush) {
        const localVault = window.exportOneDayCloudVault();
        const res = await fetch(url, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ gmail, key, data: localVault })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.ok) throw new Error((json && json.error) || 'Sync rejected');
        if (json.data) {
          const m = window.mergeOneDayCloudVault(json.data);
          changed = m.changed;
        }
        this.config.pendingPush = false;
      } else {
        const pullUrl = `${url}${url.includes('?') ? '&' : '?'}action=pull&gmail=${encodeURIComponent(gmail)}&key=${encodeURIComponent(key)}&t=${Date.now()}`;
        const res = await fetch(pullUrl, { method: 'GET', redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.ok) throw new Error((json && json.error) || 'Pull failed');

        const remoteVault = json.data || null;
        if (remoteVault && remoteVault.appName === 'OneDayCloud') {
          const m = window.mergeOneDayCloudVault(remoteVault);
          changed = m.changed;
        } else {
          const localVault = window.exportOneDayCloudVault();
          await fetch(url, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ gmail, key, data: localVault })
          });
        }
      }

      this.config.lastSyncAt = new Date().toISOString();
      this.saveConfig();
      this.state = 'synced';
      this.lastError = '';

      if (this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed, showToast });
      }
      return { ok: true, changed };
    } catch (err) {
      this.setState('error', err.message || 'Sync error');
      return { ok: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async testAndConnectAppsScript(gmail, scriptUrl, syncKey) {
    const cleanGmail = String(gmail || '').trim().toLowerCase();
    const cleanUrl = String(scriptUrl || '').trim();
    const cleanKey = String(syncKey || '').trim();

    if (!cleanGmail || !cleanGmail.includes('@')) throw new Error('ദയവായി സാധുവായ Gmail നൽകുക.');
    if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/')) {
      throw new Error('സാധുവായ Google Apps Script Web App URL നൽകുക (https://script.google.com/.../exec).');
    }

    const pingUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping&gmail=${encodeURIComponent(cleanGmail)}&key=${encodeURIComponent(cleanKey)}&t=${Date.now()}`;
    const res = await fetch(pingUrl, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || !json.ok) throw new Error((json && json.error) || 'Authorization mismatch');

    this.config = {
      ...this.config,
      provider: 'apps_script',
      gmail: cleanGmail,
      scriptUrl: cleanUrl,
      syncKey: cleanKey,
      autoSync: true,
      pendingPush: true
    };
    this.saveConfig();
    await this.activateProvider(true);
    return true;
  }

  buildMagicSyncLink() {
    if (!this.isConfigured()) return '';
    let payload = null;
    if (this.config.provider === 'firebase') {
      payload = {
        provider: 'firebase',
        gmail: this.config.gmail || '',
        firebaseConfig: this.config.firebaseConfig
      };
    } else if (this.config.provider === 'apps_script') {
      payload = {
        provider: 'apps_script',
        gmail: this.config.gmail,
        scriptUrl: this.config.scriptUrl,
        syncKey: this.config.syncKey
      };
    }
    if (!payload) return '';
    const token = this.utf8ToBase64Url(JSON.stringify(payload));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?cloudSync=${token}`;
  }

  generateAppsScriptCode(gmail = '', syncKey = '246810') {
    const safeGmail = JSON.stringify(String(gmail || '').trim().toLowerCase());
    const safeKey = JSON.stringify(String(syncKey || '246810').trim());
    return `/**
 * ONE DAY Routine Tracker - Free Forever Gmail Drive Sync
 */
const OWNER_GMAIL = ${safeGmail};
const SYNC_KEY = ${safeKey};
const FILE_NAME = 'OneDay_CloudSync_Vault.json';

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function verifyReq(gmail, key) {
  var g = String(gmail || '').trim().toLowerCase();
  var k = String(key || '').trim();
  if (OWNER_GMAIL && g && OWNER_GMAIL !== g) return false;
  if (SYNC_KEY && SYNC_KEY !== k) return false;
  return true;
}

function getFile() {
  var files = DriveApp.getFilesByName(FILE_NAME);
  if (files.hasNext()) return files.next();
  return DriveApp.createFile(FILE_NAME, JSON.stringify({ appName: 'OneDayCloud', updatedAt: new Date(0).toISOString(), tasks: [] }), MimeType.PLAIN_TEXT);
}

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (!verifyReq(p.gmail, p.key)) return jsonResponse({ ok: false, error: 'Gmail or Sync PIN mismatch' });
    if (p.action === 'ping') return jsonResponse({ ok: true, message: 'ONE DAY Gmail Sync Connected!' });
    var data = JSON.parse(getFile().getBlob().getDataAsString() || '{}');
    return jsonResponse({ ok: true, data: data });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!verifyReq(payload.gmail, payload.key)) return jsonResponse({ ok: false, error: 'Gmail or Sync PIN mismatch' });
    var incoming = payload.data;
    if (!incoming || incoming.appName !== 'OneDayCloud') return jsonResponse({ ok: false, error: 'Invalid payload' });
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var file = getFile();
      file.setContent(JSON.stringify(incoming));
      return jsonResponse({ ok: true, data: incoming });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}`;
  }

  async disconnect() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.unsubscribeFirestore();
    if (this._fbAuth && this._fbUser) {
      try { await this._fbAuth.signOut(); } catch (_) {}
    }
    this.config = {
      provider: 'none',
      gmail: '',
      scriptUrl: '',
      syncKey: '',
      firebaseConfig: this.config.firebaseConfig || null,
      autoSync: true,
      lastSyncAt: null,
      pendingPush: false
    };
    this.saveConfig();
    this.setState('off');
  }
}

window.oneDayCloud = new OneDayCloudSync();
