// ---- 配置区 ----
const CORE_URL = "https://raw.githubusercontent.com/kestrelbright/script/refs/heads/dev/amap_sign_core.js";
const CK_KEY = "GD_Val";
const CORE_CACHE_KEY = "GD_Core_Cache";
const CORE_CACHE_TIME_KEY = "GD_Core_Cache_Time";
const CORE_CACHE_TTL = 6 * 60 * 60 * 1000; // 缓存 6 小时（毫秒）
// ---- 配置区结束 ----

// ---------- 工具函数 ----------
function toObj(str, def = null) {
  try { return JSON.parse(str); } catch { return def; }
}
function toStr(obj) {
  try { return JSON.stringify(obj); } catch { return ""; }
}
function readStore(key) {
  return $persistentStore.read(key) || "";
}
function writeStore(val, key) {
  return $persistentStore.write(val, key);
}
function notify(title, subtitle = "", body = "") {
  $notification.post(title, subtitle, body);
}
function log(...args) {
  console.log("[高德签到]", ...args);
}
function lowerHeaders(headers = {}) {
  const h = {};
  Object.keys(headers).forEach(k => h[k.toLowerCase()] = headers[k]);
  return h;
}

// ---------- 判断当前运行模式 ----------
// isRequest: 被 HTTP 请求触发（用于抓取 cookie）
// 否则是定时任务触发（用于签到）
const isRequest = typeof $request !== "undefined";

// =====================================================
// 模式1：HTTP 响应抓取会话
// =====================================================
function captureSession() {
  try {
    const url = $request?.url || "";
    if (!/https?:\/\/([^.]+\.)*amap\.com\//i.test(url)) {
      log("非高德域名，跳过:", url);
      return $done({});
    }

    const reqHeaders = $request?.headers || {};
    const respHeaders = $response?.headers || {};

    const getHeader = (obj, key) => {
      const k = Object.keys(obj).find(x => x.toLowerCase() === key.toLowerCase());
      return k ? obj[k] : "";
    };

    let sessionid = "";

    // 1) Cookie
    const cookie = getHeader(reqHeaders, "cookie") || "";
    let m = cookie.match(/(?:^|;\s*)sessionid=([^;]+)/i);
    if (m) sessionid = decodeURIComponent(m[1]);

    // 2) 直接请求头
    if (!sessionid) {
      sessionid = getHeader(reqHeaders, "sessionid") || "";
    }

    // 3) 响应头 Set-Cookie
    if (!sessionid) {
      const setCookie = getHeader(respHeaders, "set-cookie");
      if (setCookie) {
        const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const c of arr) {
          const mm = String(c).match(/(?:^|;\s*)sessionid=([^;]+)/i);
          if (mm) {
            sessionid = decodeURIComponent(mm[1]);
            break;
          }
        }
      }
    }

    // 4) 兜底：从 URL 参数里找
    if (!sessionid) {
      m = url.match(/[?&]sessionid=([^&]+)/i);
      if (m) sessionid = decodeURIComponent(m[1]);
    }

    if (!sessionid) {
      log("未找到有效 sessionid，URL:", url);
      return $done({});
    }

    const old = JSON.parse($persistentStore.read("GD_Val") || "{}");
    const data = {
      sessionid,
      userId: old.userId || "",
      adiu: old.adiu || "",
      updatedAt: new Date().toLocaleString("zh-CN", { hour12: false })
    };

    $persistentStore.write(JSON.stringify(data), "GD_Val");
    log("抓取成功 sessionid:", sessionid.slice(0, 12) + "...");
    $notification.post("高德签到", "抓取成功", "sessionid 已更新");
  } catch (e) {
    log("captureSession异常:", e.message || e);
  }
  $done({});
}



// =====================================================
// 模式2：定时任务执行签到
// =====================================================

// 2-1. 网络请求加载 core.js 文本
function fetchCoreCode(url) {
  return new Promise((resolve, reject) => {
    log("开始下载核心脚本:", url);
    $httpClient.get(
      {
        url: url,
        headers: {
          "User-Agent": "Shadowrocket/2 CFNetwork/1406.0.4 Darwin/22.4.0",
          "Cache-Control": "no-cache"
        },
        timeout: 15
      },
      (err, resp, data) => {
        if (err) {
          return reject(new Error("下载失败: " + String(err)));
        }
        if (resp.status < 200 || resp.status >= 300) {
          return reject(new Error("下载失败，HTTP状态: " + resp.status));
        }
        if (!data || data.length < 100) {
          return reject(new Error("下载内容异常，可能为空"));
        }
        log("核心脚本下载成功，大小:", data.length, "bytes");
        resolve(data);
      }
    );
  });
}

// 2-2. 带缓存的 core.js 获取
async function getCoreCode() {
  const cached = readStore(CORE_CACHE_KEY);
  const cacheTime = parseInt(readStore(CORE_CACHE_TIME_KEY) || "0", 10);
  const now = Date.now();

  if (cached && cached.length > 100 && (now - cacheTime) < CORE_CACHE_TTL) {
    log("使用缓存的核心脚本，缓存时间:", new Date(cacheTime).toLocaleString("zh-CN", { hour12: false }));
    return cached;
  }

  log("缓存不存在或已过期，重新下载...");
  try {
    const code = await fetchCoreCode(CORE_URL);
    writeStore(code, CORE_CACHE_KEY);
    writeStore(String(now), CORE_CACHE_TIME_KEY);
    log("核心脚本已缓存");
    return code;
  } catch (e) {
    // 下载失败时，如果有旧缓存则降级使用
    if (cached && cached.length > 100) {
      log("下载失败，使用旧缓存降级:", e.message);
      notify("高德签到", "⚠️ 使用旧缓存", "核心脚本更新失败: " + e.message);
      return cached;
    }
    throw e;
  }
}

// 2-3. 执行签到主流程
async function runSign() {
  // 读取已保存的会话
  const ckRaw = readStore(CK_KEY);
  if (!ckRaw) {
    notify("高德签到", "❌ 失败", "未找到会话，请先打开高德触发抓取");
    log("未找到会话数据");
    return;
  }

  const ck = toObj(ckRaw, null);
  if (!ck || !ck.sessionid) {
    notify("高德签到", "❌ 失败", "会话数据解析失败，请重新抓取");
    log("会话数据无效:", ckRaw);
    return;
  }

  log("当前会话 sessionid:", ck.sessionid.slice(0, 10) + "...");
  log("userId:", ck.userId || "未知");
  log("adiu:", ck.adiu || "未知");

  // 下载/读取缓存的 core.js
  let coreCode;
  try {
    coreCode = await getCoreCode();
  } catch (e) {
    notify("高德签到", "❌ 加载核心脚本失败", e.message || String(e));
    log("加载 core 失败:", e.message);
    return;
  }

  // eval 执行 core.js
  try {
    (0, eval)(coreCode);
    log("核心脚本 eval 执行成功");
  } catch (e) {
    notify("高德签到", "❌ 核心脚本执行失败", e.message || String(e));
    log("eval 异常:", e.message);
    return;
  }

  // 检查 core.js 是否正确暴露了 runAmapSignCore
  if (typeof runAmapSignCore !== "function") {
    notify("高德签到", "❌ 核心函数未找到", "请检查 amap_sign_core.js 末尾是否有 runAmapSignCore");
    log("runAmapSignCore 不是函数");
    return;
  }

  // 执行签到
  let result;
  try {
    result = await runAmapSignCore({
      sessionid: ck.sessionid,
      userId: ck.userId || "",
      adiu: ck.adiu || ""
    });
    log("签到返回:", result);
    notify("高德签到", "✅ 完成", result || "签到成功");
  } catch (e) {
    log("runAmapSignCore 异常:", e.message || e);
    notify("高德签到", "❌ 签到异常", e.message || String(e));
  }
}

// =====================================================
// 主入口
// =====================================================
(async () => {
  if (isRequest) {
    // HTTP 响应触发 → 抓取会话
    captureSession();
  } else {
    // 定时任务触发 → 执行签到
    try {
      await runSign();
    } catch (e) {
      log("主流程异常:", e.message || e);
      notify("高德签到", "❌ 未知异常", e.message || String(e));
    } finally {
      $done({});
    }
  }
})();
