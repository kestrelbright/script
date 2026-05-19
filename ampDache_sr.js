const $ = new Env("高德地图签到");
const KEY = "GD_Val";
let ckobj = $.toObj($.getdata(KEY));

$.is_debug = false;
$.messages = [];

(async () => {
  try {
    if (typeof $request !== "undefined") {
      getToken();
      $.done();
      return;
    }

    if (!ckobj || !ckobj.sessionid || ckobj.sessionid.length < 30) {
      sendMsg("❌ 请先抓取 sessionid");
      $.done();
      return;
    }

    $.userId = ckobj.userId;
    $.sessionid = ckobj.sessionid;
    $.adiu = ckobj.adiu;

    await main();
  } catch (e) {
    $.messages.push(e.message || String(e));
  } finally {
    await sendMsg($.messages.join("\n"));
    $.done();
  }
})();

async function main() {
  intRSA();
  intCryptoJS();

  const list = [
    {
      name: "APP端",
      node: "Amap",
      channel: "amap",
      actID: "5DRBxfzndQq",
      playID: "5DRBxfFiaXN"
    }
  ];

  for (const item of list) {
    if (await checkIn(item)) {
      await signIn(item);
    }
  }
}

function getQuery(l) {
  const xck = RSA_Public_Encrypt(l.key);
  const _in = Encrypt_Body(Json2Form({ channel: l.channel, sign: l.sign }), l.key);
  const query = {
    adiu: $.adiu,
    node: l.node,
    env: "prod",
    xck_channel: "default",
    xck: encodeURIComponent(xck),
    in: encodeURIComponent(_in)
  };
  return Json2Form(query);
}

function getReq(l) {
  const characters = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  l.key = Array.from({ length: 16 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
  l.sign = md5(l.channel + "@oEEln6dQJK7lRfGxQjlyGthZ4loXcRHR").toUpperCase();
  const url = l.url + getQuery(l);

  let body = {
    ...(l.addbody || {}),
    bizVersion: "080700",
    h5version: "8.87.10",
    platform: "ios",
    tid: $.adiu,
    eId: "",
    adiu: $.adiu,
    diu: $.adiu,
    imei: $.adiu,
    idfa: $.adiu,
    enterprise: "0",
    ts: new Date().getTime(),
    uid: $.userId,
    userId: $.userId,
    channel: l.channel,
    dip: "20020",
    adCode: "",
    actID: l.actID,
    node: l.node,
    sign: l.sign
  };

  body = "in=" + encodeURIComponent(Encrypt_Body(Json2Form(body), l.key));

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 amap/12.13.1.2034 AliApp(amap/12.13.1.2034) NetType/WiFi",
    sessionid: $.sessionid
  };

  return { url, body, headers };
}

async function checkIn(list) {
  list.addbody = { playTypes: "dailySign", playIDs: list.playID };
  list.url = "https://m5.amap.com/ws/car-place/show?";

  const { code, data, message } = await httpRequest(getReq(list));

  if (code == "1") {
    if (!data.actID) {
      pushMsg(`${list.name}->查询:请到福利中心查看活动是否存在`);
      return false;
    }

    const today = $.time("MM月dd日");
    let foundItem = data?.playMap?.dailySign?.signList?.find(t => t?.date === today);

    if (foundItem) {
      $.signTerm = data?.playMap?.dailySign?.signTerm;
      $.signDay = foundItem.day;
      return true;
    } else {
      pushMsg(`${list.name}->查询:未找到今日签到项`);
    }
  } else {
    pushMsg(`${list.name}->查询:${message || "未知错误"}`);
  }
  return false;
}

async function signIn(list) {
  list.addbody = { playID: list.playID, signTerm: $.signTerm, signType: "1", signDay: $.signDay, div: "" };
  list.url = "https://m5.amap.com/ws/alice/activity/daily_sign/do_sign?";

  const { code, message } = await httpRequest(getReq(list));
  pushMsg(`${list.name}->签到: ${code === "1" ? "签到成功" : (message || "失败")}`);
}

function getToken() {
  if (!$request || $request.method === "OPTIONS") return;

  let abc = {}, mark = "";

  if (/\/common\/(alipaymini|wxmini)\?_ENCRYPT=/.test($request.url)) {
    let encryptedData = $request.url.split("_ENCRYPT=")[1].split("&")[0];
    let decodedData = base64decode(encryptedData);
    decodedData.split("&").forEach(item => {
      let [key, value] = item.split("=");
      abc[key] = value;
    });
    abc.userId = abc.userId;
    abc.adiu = abc.deviceId;
    abc.sessionid = abc.sessionId;
    mark = "小程序";
  } else {
    let responseData = $.toObj($response.body);
    abc.userId = responseData?.content?.uid;
    abc.adiu = responseData?.content?.adiu;
    let headers = ObjectKeys2LowerCase($request.headers);
    abc.sessionid = headers["sessionid"] || headers["cookie"]?.split("sessionid=")[1]?.split(";")[0];
    mark = "Cookie";
  }

  if (abc.sessionid && abc.sessionid.length > 30) {
    $.setdata($.toStr(abc), KEY);
    $.msg($.name, `从${mark}获取签到 sessionid 成功`, $.toStr(abc));
  }
}

function pushMsg(msg) {
  msg = String(msg || "").trim();
  if (msg) $.messages.push(msg);
}

async function httpRequest(options) {
  return new Promise((resolve, reject) => {
    const method = options.body ? "post" : "get";
    $httpClient[method](options, (error, response, data) => {
      if (error) return reject(error);
      try {
        resolve($.toObj(data));
      } catch {
        resolve({});
      }
    });
  });
}

function sendMsg(message) {
  if (!message) return Promise.resolve();
  return new Promise(resolve => {
    $.msg($.name, "", message);
    resolve();
  });
}

function ObjectKeys2LowerCase(obj) {
  return Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k.toLowerCase(), v]));
}

function base64decode(r) {
  for (var n, e, t, o, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", i = "", f = 0, c = r.length; f < c;) {
    do { n = a.indexOf(r.charAt(f++)) } while (f < c && -1 == n);
    if (-1 == n) break;
    do { e = a.indexOf(r.charAt(f++)) } while (f < c && -1 == e);
    if (-1 == e) break;
    i += String.fromCharCode(n << 2 | (48 & e) >> 4);
    do {
      if ("=" == (t = r.charAt(f++))) return i;
      t = a.indexOf(t)
    } while (f < c && -1 == t);
    if (-1 == t) break;
    i += String.fromCharCode((15 & e) << 4 | (60 & t) >> 2);
    do {
      if ("=" == (o = r.charAt(f++))) return i;
      o = a.indexOf(o)
    } while (f < c && -1 == o);
    if (-1 == o) break;
    i += String.fromCharCode((3 & t) << 6 | o)
  }
  return i;
}

function Json2Form(obj) {
  return Object.keys(obj).sort().map(key => `${key}=${obj[key]}`).join("&");
}
