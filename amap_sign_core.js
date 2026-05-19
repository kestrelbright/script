// ============== Env 类定义（Shadowrocket 兼容） ==============
function Env(t, e) {
  return new class {
    constructor(t, e) {
      this.name = t;
      this.data = null;
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.startTime = (new Date).getTime();
      Object.assign(this, e);
      this.log("", `🔔${this.name}, 开始!`)
    }
    getEnv() {
      return typeof $rocket !== 'undefined' ? "Shadowrocket" :
        typeof $task !== 'undefined' ? "Quantumult X" :
        typeof $loon !== 'undefined' ? "Loon" :
        typeof $environment !== 'undefined' ? "Surge" : "Node.js"
    }
    isNode() { return "Node.js" === this.getEnv() }
    isShadowrocket() { return "Shadowrocket" === this.getEnv() }
    toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } }
    toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } }
    getdata(t) {
      switch (this.getEnv()) {
        case "Shadowrocket": case "Surge": case "Loon":
          return $persistentStore.read(t);
        case "Quantumult X":
          return $prefs.valueForKey(t);
        default:
          return null
      }
    }
    setdata(t, e) {
      switch (this.getEnv()) {
        case "Shadowrocket": case "Surge": case "Loon":
          return $persistentStore.write(t, e);
        case "Quantumult X":
          return $prefs.setValueForKey(t, e);
        default:
          return false
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date;
      let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds() };
      if (/(y+)/.test(t)) t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, ("00" + a[e]).substr(("" + a[e]).length)));
      return t
    }
    msg(e, s = "", a = "") {
      switch (this.getEnv()) {
        case "Shadowrocket": case "Surge": case "Loon":
          $notification.post(e, s, a);
          break;
        case "Quantumult X":
          $notify(e, s, a);
          break
      }
    }
    log(...t) { console.log(t.join(this.logSeparator)) }
    logErr(t) { console.log(`❗️${this.name}, 错误!`, t) }
    done(t = {}) {
      this.log("", `🔔${this.name}, 结束!`);
      switch (this.getEnv()) {
        case "Shadowrocket": case "Surge": case "Loon": case "Quantumult X":
          $done(t);
          break
      }
    }
  }(t, e)
}

// ============================================================
//  高德打车签到 - Shadowrocket 完整版
// ============================================================

const $ = new Env("高德地图签到");
const _key = 'GD_Val';
var ckobj = $.toObj($.getdata(_key));
$.messages = [];

// ---------- 工具函数 ----------
function ObjectKeys2LowerCase(obj) {
  return Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k.toLowerCase(), v]));
}

function Json2Form(obj) {
  return Object.keys(obj).sort().map(key => `${key}=${obj[key]}`).join('&');
}

// ============== 完整的 CryptoJS (MD5) ==============
function intCryptoJS() {
  CryptoJS = function(t, r) {
    var n;
    if ("undefined" != typeof window && window.crypto && (n = window.crypto),
      "undefined" != typeof self && self.crypto && (n = self.crypto),
      "undefined" != typeof globalThis && globalThis.crypto && (n = globalThis.crypto),
      !n && "undefined" != typeof window && window.msCrypto && (n = window.msCrypto),
      !n && "undefined" != typeof global && global.crypto && (n = global.crypto),
      !n && "function" == typeof require) try { n = require("crypto") } catch (t) {}
    var e = function() {
      if (n) {
        if ("function" == typeof n.getRandomValues) try { return n.getRandomValues(new Uint32Array(1))[0] } catch (t) {}
        if ("function" == typeof n.randomBytes) try { return n.randomBytes(4).readInt32LE() } catch (t) {}
      }
      throw new Error("Native crypto module could not be used to get secure random number.")
    };
    var i = Object.create || function() { function t() {} return function(r) { var n; return t.prototype = r, n = new t, t.prototype = null, n } }(),
      o = {},
      a = o.lib = {},
      s = a.Base = {
        extend: function(t) { var r = i(this); return t && r.mixIn(t), r.hasOwnProperty("init") && this.init !== r.init || (r.init = function() { r.$super.init.apply(this, arguments) }), r.init.prototype = r, r.$super = this, r },
        create: function() { var t = this.extend(); return t.init.apply(t, arguments), t },
        init: function() {},
        mixIn: function(t) { for (var r in t) t.hasOwnProperty(r) && (this[r] = t[r]); t.hasOwnProperty("toString") && (this.toString = t.toString) },
        clone: function() { return this.init.prototype.extend(this) }
      },
      c = a.WordArray = s.extend({
        init: function(t, r) { t = this.words = t || [], this.sigBytes = null != r ? r : 4 * t.length },
        toString: function(t) { return (t || f).stringify(this) },
        concat: function(t) { var r = this.words,
            n = t.words,
            e = this.sigBytes,
            i = t.sigBytes; if (this.clamp(), e % 4) for (var o = 0; o < i; o++) { var a = n[o >>> 2] >>> 24 - o % 4 * 8 & 255;
            r[e + o >>> 2] |= a << 24 - (e + o) % 4 * 8 } else for (var s = 0; s < i; s += 4) r[e + s >>> 2] = n[s >>> 2]; return this.sigBytes += i, this },
        clamp: function() { var r = this.words,
            n = this.sigBytes;
          r[n >>> 2] &= 4294967295 << 32 - n % 4 * 8, r.length = t.ceil(n / 4) },
        clone: function() { var t = s.clone.call(this); return t.words = this.words.slice(0), t }
      }),
      u = o.enc = {},
      f = u.Hex = {
        stringify: function(t) { for (var r = t.words, n = t.sigBytes, e = [], i = 0; i < n; i++) { var o = r[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            e.push((o >>> 4).toString(16)), e.push((15 & o).toString(16)) } return e.join("") },
        parse: function(t) { for (var r = t.length, n = [], e = 0; e < r; e += 2) n[e >>> 3] |= parseInt(t.substr(e, 2), 16) << 24 - e % 8 * 4; return new c.init(n, r / 2) }
      },
      h = u.Latin1 = {
        stringify: function(t) { for (var r = t.words, n = t.sigBytes, e = [], i = 0; i < n; i++) { var o = r[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            e.push(String.fromCharCode(o)) } return e.join("") },
        parse: function(t) { for (var r = t.length, n = [], e = 0; e < r; e++) n[e >>> 2] |= (255 & t.charCodeAt(e)) << 24 - e % 4 * 8; return new c.init(n, r) }
      },
      p = u.Utf8 = {
        stringify: function(t) { try { return decodeURIComponent(escape(h.stringify(t))) } catch (t) { throw new Error("Malformed UTF-8 data") } },
        parse: function(t) { return h.parse(unescape(encodeURIComponent(t))) }
      },
      d = a.BufferedBlockAlgorithm = s.extend({
        reset: function() { this._data = new c.init, this._nDataBytes = 0 },
        _append: function(t) { "string" == typeof t && (t = p.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes },
        _process: function(r) { var n, e = this._data,
            i = e.words,
            o = e.sigBytes,
            a = this.blockSize,
            s = o / (4 * a),
            u = (s = r ? t.ceil(s) : t.max((0 | s) - this._minBufferSize, 0)) * a,
            f = t.min(4 * u, o); if (u) { for (var h = 0; h < u; h += a) this._doProcessBlock(i, h);
            n = i.splice(0, u), e.sigBytes -= f } return new c.init(n, f) },
        clone: function() { var t = s.clone.call(this); return t._data = this._data.clone(), t },
        _minBufferSize: 0
      }),
      l = (a.Hasher = d.extend({
        cfg: s.extend(),
        init: function(t) { this.cfg = this.cfg.extend(t), this.reset() },
        reset: function() { d.reset.call(this), this._doReset() },
        update: function(t) { return this._append(t), this._process(), this },
        finalize: function(t) { return t && this._append(t), this._doFinalize() },
        blockSize: 16,
        _createHelper: function(t) { return function(r, n) { return new t.init(n).finalize(r) } },
        _createHmacHelper: function(t) { return function(r, n) { return new l.HMAC.init(t, n).finalize(r) } }
      }), o.algo = {});
    return o
  }(Math);
  !function(t) {
    var r = CryptoJS,
      n = r.lib,
      e = n.WordArray,
      i = n.Hasher,
      o = r.algo,
      a = [];
    !function() { for (var r = 0; r < 64; r++) a[r] = 4294967296 * t.abs(t.sin(r + 1)) | 0 }();
    var s = o.MD5 = i.extend({
      _doReset: function() { this._hash = new e.init([1732584193, 4023233417, 2562383102, 271733878]) },
      _doProcessBlock: function(t, r) {
        for (var n = 0; n < 16; n++) { var e = r + n,
            i = t[e];
          t[e] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8) } var o = this._hash.words,
          s = t[r + 0],
          p = t[r + 1],
          d = t[r + 2],
          l = t[r + 3],
          y = t[r + 4],
          v = t[r + 5],
          g = t[r + 6],
          w = t[r + 7],
          _ = t[r + 8],
          m = t[r + 9],
          B = t[r + 10],
          b = t[r + 11],
          C = t[r + 12],
          S = t[r + 13],
          x = t[r + 14],
          A = t[r + 15],
          H = o[0],
          z = o[1],
          M = o[2],
          D = o[3];
        z = h(z = h(z = h(z = h(z = f(z = f(z = f(z = f(z = u(z = u(z = u(z = u(z = c(z = c(z = c(z = c(z, M = c(M, D = c(D, H = c(H, z, M, D, s, 7, a[0]), z, M, p, 12, a[1]), H, z, d, 17, a[2]), D, H, l, 22, a[3]), M = c(M, D = c(D, H = c(H, z, M, D, y, 7, a[4]), z, M, v, 12, a[5]), H, z, g, 17, a[6]), D, H, w, 22, a[7]), M = c(M, D = c(D, H = c(H, z, M, D, _, 7, a[8]), z, M, m, 12, a[9]), H, z, B, 17, a[10]), D, H, b, 22, a[11]), M = c(M, D = c(D, H = c(H, z, M, D, C, 7, a[12]), z, M, S, 12, a[13]), H, z, x, 17, a[14]), D, H, A, 22, a[15]), M = u(M, D = u(D, H = u(H, z, M, D, p, 5, a[16]), z, M, g, 9, a[17]), H, z, b, 14, a[18]), D, H, s, 20, a[19]), M = u(M, D = u(D, H = u(H, z, M, D, v, 5, a[20]), z, M, B, 9, a[21]), H, z, A, 14, a[22]), D, H, y, 20, a[23]), M = u(M, D = u(D, H = u(H, z, M, D, m, 5, a[24]), z, M, x, 9, a[25]), H, z, l, 14, a[26]), D, H, _, 20, a[27]), M = u(M, D = u(D, H = u(H, z, M, D, S, 5, a[28]), z, M, d, 9, a[29]), H, z, w, 14, a[30]), D, H, C, 20, a[31]), M = f(M, D = f(D, H = f(H, z, M, D, v, 4, a[32]), z, M, _, 11, a[33]), H, z, b, 16, a[34]), D, H, x, 23, a[35]), M = f(M, D = f(D, H = f(H, z, M, D, p, 4, a[36]), z, M, y, 11, a[37]), H, z, w, 16, a[38]), D, H, B, 23, a[39]), M = f(M, D = f(D, H = f(H, z, M, D, S, 4, a[40]), z, M, s, 11, a[41]), H, z, l, 16, a[42]), D, H, g, 23, a[43]), M = f(M, D = f(D, H = f(H, z, M, D, m, 4, a[44]), z, M, C, 11, a[45]), H, z, A, 16, a[46]), D, H, d, 23, a[47]), M = h(M, D = h(D, H = h(H, z, M, D, s, 6, a[48]), z, M, w, 10, a[49]), H, z, x, 15, a[50]), D, H, v, 21, a[51]), M = h(M, D = h(D, H = h(H, z, M, D, C, 6, a[52]), z, M, l, 10, a[53]), H, z, B, 15, a[54]), D, H, p, 21, a[55]), M = h(M, D = h(D, H = h(H, z, M, D, _, 6, a[56]), z, M, A, 10, a[57]), H, z, g, 15, a[58]), D, H, S, 21, a[59]), M = h(M, D = h(D, H = h(H, z, M, D, y, 6, a[60]), z, M, b, 10, a[61]), H, z, d, 15, a[62]), D, H, m, 21, a[63]),
          o[0] = o[0] + H | 0, o[1] = o[1] + z | 0, o[2] = o[2] + M | 0, o[3] = o[3] + D | 0
      },
      _doFinalize: function() { var r = this._data,
          n = r.words,
          e = 8 * this._nDataBytes,
          i = 8 * r.sigBytes;
        n[i >>> 5] |= 128 << 24 - i % 32; var o = t.floor(e / 4294967296),
          a = e;
        n[15 + (i + 64 >>> 9 << 4)] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8),
          n[14 + (i + 64 >>> 9 << 4)] = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8),
          r.sigBytes = 4 * (n.length + 1), this._process(); for (var s = this._hash, c = s.words, u = 0; u < 4; u++) { var f = c[u];
          c[u] = 16711935 & (f << 8 | f >>> 24) | 4278255360 & (f << 24 | f >>> 8) } return s },
      clone: function() { var t = i.clone.call(this); return t._hash = this._hash.clone(), t }
    });

    function c(t, r, n, e, i, o, a) { var s = t + (r & n | ~r & e) + i + a; return (s << o | s >>> 32 - o) + r }

    function u(t, r, n, e, i, o, a) { var s = t + (r & e | n & ~e) + i + a; return (s << o | s >>> 32 - o) + r }

    function f(t, r, n, e, i, o, a) { var s = t + (r ^ n ^ e) + i + a; return (s << o | s >>> 32 - o) + r }

    function h(t, r, n, e, i, o, a) { var s = t + (n ^ (r | ~e)) + i + a; return (s << o | s >>> 32 - o) + r }
    r.MD5 = i._createHelper(s)
  }(Math)
}

function md5(word) { return CryptoJS.MD5(word).toString() }

// ============== 完整的 RSA 加密 ==============
function intRSA() {
  RSA = {};
  var dbits;
  var canary = 0xdeadbeefcafe,
    j_lm = 15715070 == (16777215 & canary);

  function BigInteger(t, e, i) { null != t && ("number" == typeof t ? this.fromNumber(t, e, i) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e)) }

  function nbi() { return new BigInteger(null) }

  function am1(t, e, i, r, n, s) { for (; --s >= 0;) { var o = e * this[t++] + i[r] + n;
      n = Math.floor(o / 67108864), i[r++] = 67108863 & o } return n }

  function am2(t, e, i, r, n, s) { for (var o = 32767 & e, h = e >> 15; --s >= 0;) { var a = 32767 & this[t],
        u = this[t++] >> 15,
        p = h * a + u * o;
      n = ((a = o * a + ((32767 & p) << 15) + i[r] + (1073741823 & n)) >>> 30) + (p >>> 15) + h * u + (n >>> 30), i[r++] = 1073741823 & a } return n }

  function am3(t, e, i, r, n, s) { for (var o = 16383 & e, h = e >> 14; --s >= 0;) { var a = 16383 & this[t],
        u = this[t++] >> 14,
        p = h * a + u * o;
      n = ((a = o * a + ((16383 & p) << 14) + i[r] + n) >> 28) + (p >> 14) + h * u, i[r++] = 268435455 & a } return n }
  j_lm && "Microsoft Internet Explorer" == navigator.appName ? (BigInteger.prototype.am = am2, dbits = 30) : j_lm && "Netscape" != navigator.appName ? (BigInteger.prototype.am = am1, dbits = 26) : (BigInteger.prototype.am = am3, dbits = 28), BigInteger.prototype.DB = dbits, BigInteger.prototype.DM = (1 << dbits) - 1, BigInteger.prototype.DV = 1 << dbits;
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2, BI_FP), BigInteger.prototype.F1 = BI_FP - dbits, BigInteger.prototype.F2 = 2 * dbits - BI_FP;
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz",
    BI_RC = new Array,
    rr, vv;
  for (rr = "0".charCodeAt(0), vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  for (rr = "a".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  for (rr = "A".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(t) { return BI_RM.charAt(t) }

  function intAt(t, e) { var i = BI_RC[t.charCodeAt(e)]; return null == i ? -1 : i }

  function bnpCopyTo(t) { for (var e = this.t - 1; e >= 0; --e) t[e] = this[e];
    t.t = this.t, t.s = this.s }

  function bnpFromInt(t) { this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + this.DV : this.t = 0 }

  function nbv(t) { var e = nbi(); return e.fromInt(t), e }

  function bnpFromString(t, e) { var i; if (16 == e) i = 4;
    else if (8 == e) i = 3;
    else if (256 == e) i = 8;
    else if (2 == e) i = 1;
    else if (32 == e) i = 5;
    else { if (4 != e) return void this.fromRadix(t, e);
      i = 2 } this.t = 0, this.s = 0; for (var r = t.length, n = !1, s = 0; --r >= 0;) { var o = 8 == i ? 255 & t[r] : intAt(t, r); o < 0 ? "-" == t.charAt(r) && (n = !0) : (n = !1, 0 == s ? this[this.t++] = o : s + i > this.DB ? (this[this.t - 1] |= (o & (1 << this.DB - s) - 1) << s, this[this.t++] = o >> this.DB - s) : this[this.t - 1] |= o << s, (s += i) >= this.DB && (s -= this.DB)) } 8 == i && 0 != (128 & t[0]) && (this.s = -1, s > 0 && (this[this.t - 1] |= (1 << this.DB - s) - 1 << s)), this.clamp(), n && BigInteger.ZERO.subTo(this, this) }

  function bnpClamp() { for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;) --this.t }

  function bnToString(t) { if (this.s < 0) return "-" + this.negate().toString(t); var e; if (16 == t) e = 4;
    else if (8 == t) e = 3;
    else if (2 == t) e = 1;
    else if (32 == t) e = 5;
    else { if (4 != t) return this.toRadix(t);
      e = 2 } var i, r = (1 << e) - 1,
      n = !1,
      s = "",
      o = this.t,
      h = this.DB - o * this.DB % e; if (o-- > 0) for (h < this.DB && (i = this[o] >> h) > 0 && (n = !0, s = int2char(i)); o >= 0;) h < e ? (i = (this[o] & (1 << h) - 1) << e - h, i |= this[--o] >> (h += this.DB - e)) : (i = this[o] >> (h -= e) & r, h <= 0 && (h += this.DB, --o)), i > 0 && (n = !0), n && (s += int2char(i)); return n ? s : "0" }

  function bnNegate() { var t = nbi(); return BigInteger.ZERO.subTo(this, t), t }

  function bnAbs() { return this.s < 0 ? this.negate() : this }

  function bnCompareTo(t) { var e = this.s - t.s; if (0 != e) return e; var i = this.t; if (0 != (e = i - t.t)) return this.s < 0 ? -e : e; for (; --i >= 0;) if (0 != (e = this[i] - t[i])) return e; return 0 }

  function nbits(t) { var e, i = 1; return 0 != (e = t >>> 16) && (t = e, i += 16), 0 != (e = t >> 8) && (t = e, i += 8), 0 != (e = t >> 4) && (t = e, i += 4), 0 != (e = t >> 2) && (t = e, i += 2), 0 != (e = t >> 1) && (t = e, i += 1), i }

  function bnBitLength() { return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM) }

  function bnpDLShiftTo(t, e) { var i; for (i = this.t - 1; i >= 0; --i) e[i + t] = this[i]; for (i = t - 1; i >= 0; --i) e[i] = 0;
    e.t = this.t + t, e.s = this.s }

  function bnpDRShiftTo(t, e) { for (var i = t; i < this.t; ++i) e[i - t] = this[i];
    e.t = Math.max(this.t - t, 0), e.s = this.s }

  function bnpLShiftTo(t, e) { var i, r = t % this.DB,
      n = this.DB - r,
      s = (1 << n) - 1,
      o = Math.floor(t / this.DB),
      h = this.s << r & this.DM; for (i = this.t - 1; i >= 0; --i) e[i + o + 1] = this[i] >> n | h,
    h = (this[i] & s) << r; for (i = o - 1; i >= 0; --i) e[i] = 0;
    e[o] = h, e.t = this.t + o + 1, e.s = this.s, e.clamp() }

  function bnpRShiftTo(t, e) { e.s = this.s; var i = Math.floor(t / this.DB); if (i >= this.t) e.t = 0;
    else { var r = t % this.DB,
        n = this.DB - r,
        s = (1 << r) - 1;
      e[0] = this[i] >> r; for (var o = i + 1; o < this.t; ++o) e[o - i - 1] |= (this[o] & s) << n,
        e[o - i] = this[o] >> r;
      r > 0 && (e[this.t - i - 1] |= (this.s & s) << n), e.t = this.t - i, e.clamp() } }

  function bnpSubTo(t, e) { for (var i = 0, r = 0, n = Math.min(t.t, this.t); i < n;) r += this[i] - t[i], e[i++] = r & this.DM, r >>= this.DB; if (t.t < this.t) { for (r -= t.s; i < this.t;) r += this[i], e[i++] = r & this.DM, r >>= this.DB;
      r += this.s } else { for (r += this.s; i < t.t;) r -= t[i], e[i++] = r & this.DM, r >>= this.DB;
      r -= t.s } e.s = r < 0 ? -1 : 0, r < -1 ? e[i++] = this.DV + r : r > 0 && (e[i++] = r), e.t = i, e.clamp() }

  function bnpMultiplyTo(t, e) { var i = this.abs(),
      r = t.abs(),
      n = i.t; for (e.t = n + r.t; --n >= 0;) e[n] = 0; for (n = 0; n < r.t; ++n) e[n + i.t] = i.am(0, r[n], e, n, 0, i.t);
    e.s = 0, e.clamp(), this.s != t.s && BigInteger.ZERO.subTo(e, e) }

  function bnpSquareTo(t) { for (var e = this.abs(), i = t.t = 2 * e.t; --i >= 0;) t[i] = 0; for (i = 0; i < e.t - 1; ++i) { var r = e.am(i, e[i], t, 2 * i, 0, 1); (t[i + e.t] += e.am(i + 1, 2 * e[i], t, 2 * i + 1, r, e.t - i - 1)) >= e.DV && (t[i + e.t] -= e.DV, t[i + e.t + 1] = 1) } t.t > 0 && (t[t.t - 1] += e.am(i, e[i], t, 2 * i, 0, 1)), t.s = 0, t.clamp() }

  function bnpDivRemTo(t, e, i) { var r = t.abs(); if (!(r.t <= 0)) { var n = this.abs(); if (n.t < r.t) return null != e && e.fromInt(0), void(null != i && this.copyTo(i)); null == i && (i = nbi()); var s = nbi(),
        o = this.s,
        h = t.s,
        a = this.DB - nbits(r[r.t - 1]); a > 0 ? (r.lShiftTo(a, s), n.lShiftTo(a, i)) : (r.copyTo(s), n.copyTo(i)); var u = s.t,
        p = s[u - 1]; if (0 != p) { var c = p * (1 << this.F1) + (u > 1 ? s[u - 2] >> this.F2 : 0),
          g = this.FV / c,
          l = (1 << this.F1) / c,
          f = 1 << this.F2,
          d = i.t,
          b = d - u,
          v = null == e ? nbi() : e; for (s.dlShiftTo(b, v), i.compareTo(v) >= 0 && (i[i.t++] = 1, i.subTo(v, i)), BigInteger.ONE.dlShiftTo(u, v), v.subTo(s, s); s.t < u;) s[s.t++] = 0; for (; --b >= 0;) { var y = i[--d] == p ? this.DM : Math.floor(i[d] * g + (i[d - 1] + f) * l); if ((i[d] += s.am(0, y, i, b, 0, u)) < y) for (s.dlShiftTo(b, v), i.subTo(v, i); i[d] < --y;) i.subTo(v, i) } null != e && (i.drShiftTo(u, e), o != h && BigInteger.ZERO.subTo(e, e)), i.t = u, i.clamp(), a > 0 && i.rShiftTo(a, i), o < 0 && BigInteger.ZERO.subTo(i, i) } } }

  function bnMod(t) { var e = nbi(); return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(BigInteger.ZERO) > 0 && t.subTo(e, e), e }

  function Classic(t) { this.m = t }

  function cConvert(t) { return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t }

  function cRevert(t) { return t }

  function cReduce(t) { t.divRemTo(this.m, null, t) }

  function cMulTo(t, e, i) { t.multiplyTo(e, i), this.reduce(i) }

  function cSqrTo(t, e) { t.squareTo(e), this.reduce(e) }

  function bnpInvDigit() { if (this.t < 1) return 0; var t = this[0]; if (0 == (1 & t)) return 0; var e = 3 & t; return (e = (e = (e = (e = e * (2 - (15 & t) * e) & 15) * (2 - (255 & t) * e) & 255) * (2 - ((65535 & t) * e & 65535)) & 65535) * (2 - t * e % this.DV) % this.DV) > 0 ? this.DV - e : -e }

  function Montgomery(t) { this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t }

  function montConvert(t) { var e = nbi(); return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(BigInteger.ZERO) > 0 && this.m.subTo(e, e), e }

  function montRevert(t) { var e = nbi(); return t.copyTo(e), this.reduce(e), e }

  function montReduce(t) { for (; t.t <= this.mt2;) t[t.t++] = 0; for (var e = 0; e < this.m.t; ++e) { var i = 32767 & t[e],
        r = i * this.mpl + ((i * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM; for (t[i = e + this.m.t] += this.m.am(0, r, t, e, 0, this.m.t); t[i] >= t.DV;) t[i] -= t.DV, t[++i]++ } t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t) }

  function montSqrTo(t, e) { t.squareTo(e), this.reduce(e) }

  function montMulTo(t, e, i) { t.multiplyTo(e, i), this.reduce(i) }

  function bnpIsEven() { return 0 == (this.t > 0 ? 1 & this[0] : this.s) }

  function bnpExp(t, e) { if (t > 4294967295 || t < 1) return BigInteger.ONE; var i = nbi(),
      r = nbi(),
      n = e.convert(this),
      s = nbits(t) - 1; for (n.copyTo(i); --s >= 0;) { if (e.sqrTo(i, r), (t & 1 << s) > 0) e.mulTo(r, n, i);
      else { var o = i;
        i = r, r = o } } return e.revert(i) }

  function bnModPowInt(t, e) { var i; return i = t < 256 || e.isEven() ? new Classic(e) : new Montgomery(e), this.exp(t, i) }

  function bnClone() { var t = nbi(); return this.copyTo(t), t }

  function bnIntValue() { if (this.s < 0) { if (1 == this.t) return this[0] - this.DV; if (0 == this.t) return -1 } else { if (1 == this.t) return this[0]; if (0 == this.t) return 0 } return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0] }

  function bnByteValue() { return 0 == this.t ? this.s : this[0] << 24 >> 24 }

  function bnShortValue() { return 0 == this.t ? this.s : this[0] << 16 >> 16 }

  function bnpChunkSize(t) { return Math.floor(Math.LN2 * this.DB / Math.log(t)) }

  function bnSigNum() { return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1 }

  function bnpToRadix(t) { if (null == t && (t = 10), 0 == this.signum() || t < 2 || t > 36) return "0"; var e = this.chunkSize(t),
      i = Math.pow(t, e),
      r = nbv(i),
      n = nbi(),
      s = nbi(),
      o = ""; for (this.divRemTo(r, n, s); n.signum() > 0;) o = (i + s.intValue()).toString(t).substr(1) + o, n.divRemTo(r, n, s); return s.intValue().toString(t) + o }

  function bnpFromRadix(t, e) { this.fromInt(0), null == e && (e = 10); for (var i = this.chunkSize(e), r = Math.pow(e, i), n = !1, s = 0, o = 0, h = 0; h < t.length; ++h) { var a = intAt(t, h); a < 0 ? "-" == t.charAt(h) && 0 == this.signum() && (n = !0) : (o = e * o + a, ++s >= i && (this.dMultiply(r), this.dAddOffset(o, 0), s = 0, o = 0)) } s > 0 && (this.dMultiply(Math.pow(e, s)), this.dAddOffset(o, 0)), n && BigInteger.ZERO.subTo(this, this) }

  function bnpFromNumber(t, e, i) {
    if ("number" == typeof e)
      if (t < 2) this.fromInt(1);
      else for (this.fromNumber(t, i), this.testBit(t - 1) || this.bitwiseTo(BigInteger.ONE.shiftLeft(t - 1), op_or, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(e);) this.dAddOffset(2, 0), this.bitLength() > t && this.subTo(BigInteger.ONE.shiftLeft(t - 1), this);
    else { var r = new Array,
        n = 7 & t;
      r.length = 1 + (t >> 3), e.nextBytes(r), n > 0 ? r[0] &= (1 << n) - 1 : r[0] = 0, this.fromString(r, 256) }
  }

  function bnToByteArray() { var t = this.t,
      e = new Array;
    e[0] = this.s; var i, r = this.DB - t * this.DB % 8,
      n = 0; if (t-- > 0) for (r < this.DB && (i = this[t] >> r) != (this.s & this.DM) >> r && (e[n++] = i | this.s << this.DB - r); t >= 0;) r < 8 ? (i = (this[t] & (1 << r) - 1) << 8 - r, i |= this[--t] >> (r += this.DB - 8)) : (i = this[t] >> (r -= 8) & 255, r <= 0 && (r += this.DB, --t)), 0 != (128 & i) && (i |= -256), 0 == n && (128 & this.s) != (128 & i) && ++n, (n > 0 || i != this.s) && (e[n++] = i); return e }

  function bnEquals(t) { return 0 == this.compareTo(t) }

  function bnMin(t) { return this.compareTo(t) < 0 ? this : t }

  function bnMax(t) { return this.compareTo(t) > 0 ? this : t }

  function bnpBitwiseTo(t, e, i) { var r, n, s = Math.min(t.t, this.t); for (r = 0; r < s; ++r) i[r] = e(this[r], t[r]); if (t.t < this.t) { for (n = t.s & this.DM, r = s; r < this.t; ++r) i[r] = e(this[r], n);
      i.t = this.t } else { for (n = this.s & this.DM, r = s; r < t.t; ++r) i[r] = e(n, t[r]);
      i.t = t.t } i.s = e(this.s, t.s), i.clamp() }

  function op_and(t, e) { return t & e }

  function bnAnd(t) { var e = nbi(); return this.bitwiseTo(t, op_and, e), e }

  function op_or(t, e) { return t | e }

  function bnOr(t) { var e = nbi(); return this.bitwiseTo(t, op_or, e), e }

  function op_xor(t, e) { return t ^ e }

  function bnXor(t) { var e = nbi(); return this.bitwiseTo(t, op_xor, e), e }

  function op_andnot(t, e) { return t & ~e }

  function bnAndNot(t) { var e = nbi(); return this.bitwiseTo(t, op_andnot, e), e }

  function bnNot() { for (var t = nbi(), e = 0; e < this.t; ++e) t[e] = this.DM & ~this[e]; return t.t = this.t, t.s = ~this.s, t }

  function bnShiftLeft(t) { var e = nbi(); return t < 0 ? this.rShiftTo(-t, e) : this.lShiftTo(t, e), e }

  function bnShiftRight(t) { var e = nbi(); return t < 0 ? this.lShiftTo(-t, e) : this.rShiftTo(t, e), e }

  function lbit(t) { if (0 == t) return -1; var e = 0; return 0 == (65535 & t) && (t >>= 16, e += 16), 0 == (255 & t) && (t >>= 8, e += 8), 0 == (15 & t) && (t >>= 4, e += 4), 0 == (3 & t) && (t >>= 2, e += 2), 0 == (1 & t) && ++e, e }

  function bnGetLowestSetBit() { for (var t = 0; t < this.t; ++t) if (0 != this[t]) return t * this.DB + lbit(this[t]); return this.s < 0 ? this.t * this.DB : -1 }

  function cbit(t) { for (var e = 0; 0 != t;) t &= t - 1, ++e; return e }

  function bnBitCount() { for (var t = 0, e = this.s & this.DM, i = 0; i < this.t; ++i) t += cbit(this[i] ^ e); return t }

  function bnTestBit(t) { var e = Math.floor(t / this.DB); return e >= this.t ? 0 != this.s : 0 != (this[e] & 1 << t % this.DB) }

  function bnpChangeBit(t, e) { var i = BigInteger.ONE.shiftLeft(t); return this.bitwiseTo(i, e, i), i }

  function bnSetBit(t) { return this.changeBit(t, op_or) }

  function bnClearBit(t) { return this.changeBit(t, op_andnot) }

  function bnFlipBit(t) { return this.changeBit(t, op_xor) }

  function bnpAddTo(t, e) { for (var i = 0, r = 0, n = Math.min(t.t, this.t); i < n;) r += this[i] + t[i], e[i++] = r & this.DM, r >>= this.DB; if (t.t < this.t) { for (r += t.s; i < this.t;) r += this[i], e[i++] = r & this.DM, r >>= this.DB;
      r += this.s } else { for (r += this.s; i < t.t;) r += t[i], e[i++] = r & this.DM, r >>= this.DB;
      r += t.s } e.s = r < 0 ? -1 : 0, r >  0 ? e[i++] = r : r < -1 && (e[i++] = this.DV + r), e.t = i, e.clamp() }

  function bnAdd(t) { var e = nbi(); return this.addTo(t, e), e }

  function bnSubtract(t) { var e = nbi(); return this.subTo(t, e), e }

  function bnMultiply(t) { var e = nbi(); return this.multiplyTo(t, e), e }

  function bnSquare() { var t = nbi(); return this.squareTo(t), t }

  function bnDivide(t) { var e = nbi(); return this.divRemTo(t, e, null), e }

  function bnRemainder(t) { var e = nbi(); return this.divRemTo(t, null, e), e }

  function bnDivideAndRemainder(t) { var e = nbi(), i = nbi(); return this.divRemTo(t, e, i), new Array(e, i) }

  function bnpDMultiply(t) { this[this.t] = this.am(0, t - 1, this, 0, 0, this.t), ++this.t, this.clamp() }

  function bnpDAddOffset(t, e) { if (0 != t) { for (; this.t <= e;) this[this.t++] = 0;
      for (this[e] += t; this[e] >= this.DV;) this[e] -= this.DV, ++e >= this.t && (this[this.t++] = 0), ++this[e] } }

  function NullExp() {}

  function nNop(t) { return t }

  function nMulTo(t, e, i) { t.multiplyTo(e, i) }

  function nSqrTo(t, e) { t.squareTo(e) }

  function bnpExpmod(t, e) { var i = t.bitLength(),
      r, n = nbv(1),
      s; if (i <= 0) return n; s = i < 18 ? 1 : i < 48 ? 3 : i < 144 ? 4 : i < 768 ? 5 : 6; var o = new NullExp; if (o.convert = nNop, o.revert = nNop, o.mulTo = nMulTo, o.sqrTo = nSqrTo, i < 8) r = new Classic(e);
    else if (e.isEven()) r = new Barrett(e);
    else r = new Montgomery(e); var h = new Array,
      a = 3,
      u = s - 1,
      p = (1 << s) - 1; if (h[1] = r.convert(this), s > 1) { var c = nbi(); for (r.sqrTo(h[1], c); a <= p;) h[a] = nbi(), r.mulTo(c, h[a - 2], h[a]), a += 2 } var g = t.t - 1,
      l,
      f = !0,
      d = nbi(),
      b; for (i = nbits(t[g]) - 1; g >= 0;) { for (i >= u ? l = t[g] >> i - u & p : (l = (t[g] & (1 << i + 1) - 1) << u - i, g > 0 && (l |= t[g - 1] >> this.DB + i - u)), a = s; 0 == (1 & l);) l >>= 1, --a; if ((i -= a) < 0) i += this.DB, --g; if (f) h[l].copyTo(n), f = !1;
        else { for (; a > 1;) r.sqrTo(n, d), r.sqrTo(d, n), a -= 2; a > 0 ? r.sqrTo(n, d) : (b = n, n = d, d = b), r.mulTo(d, h[l], n) } for (; g >= 0 && 0 == (t[g] & 1 << i);) r.sqrTo(n, d), b = n, n = d, d = b, --i < 0 && (i = this.DB - 1, --g) } return r.revert(n) }

  function bnModPow(t, e) { return this.expmod(t, e) }

  function bnGCD(t) { var e = this.s < 0 ? this.negate() : this.clone(),
      i = t.s < 0 ? t.negate() : t.clone(); if (e.compareTo(i) < 0) { var r = e;
      e = i, i = r } var n = e.getLowestSetBit(),
      s = i.getLowestSetBit(); if (s < 0) return e; n < s && (s = n); s > 0 && (e.rShiftTo(s, e), i.rShiftTo(s, i)); for (; e.signum() > 0;) (n = e.getLowestSetBit()) > 0 && e.rShiftTo(n, e), (n = i.getLowestSetBit()) > 0 && i.rShiftTo(n, i), e.compareTo(i) >= 0 ? (e.subTo(i, e), e.rShiftTo(1, e)) : (i.subTo(e, i), i.rShiftTo(1, i)); s > 0 && i.lShiftTo(s, i); return i }

  function bnpModInt(t) { if (t <= 0) return 0; var e = this.DV % t,
      i = this.s < 0 ? t - 1 : 0; if (this.t > 0) if (0 == e) i = this[0] % t;
    else for (var r = this.t - 1; r >= 0; --r) i = (e * i + this[r]) % t; return i }

  function bnModInverse(t) { var e = t.isEven(); if (this.isEven() && e || 0 == t.signum()) return BigInteger.ZERO; for (var i = t.clone(), r = this.clone(), n = nbv(1), s = nbv(0), o = nbv(0), h = nbv(1);;) { for (; i.isEven();) i.rShiftTo(1, i), e ? (n.isEven() && s.isEven() || (n.addTo(this, n), s.subTo(t, s)), n.rShiftTo(1, n)) : s.isEven() || s.subTo(t, s), s.rShiftTo(1, s); for (; r.isEven();) r.rShiftTo(1, r), e ? (o.isEven() && h.isEven() || (o.addTo(this, o), h.subTo(t, h)), o.rShiftTo(1, o)) : h.isEven() || h.subTo(t, h), h.rShiftTo(1, h); if (i.compareTo(r) >= 0) { i.subTo(r, i), e && n.subTo(o, n), s.subTo(h, s) } else { r.subTo(i, r), e && o.subTo(n, o), h.subTo(s, h) } if (0 == i.signum()) { if (0 != s.signum()) return null; return e && o.compareTo(t) >= 0 ? o.subTo(t, o) : o.signum() < 0 && (o.addTo(t, o), o.signum() < 0) ? o.addTo(t, o) : o, o } } }

  function bnIsProbablePrime(t) { var e, i = this.abs(); if (1 == i.t && i[0] <= lowprimes[lowprimes.length - 1]) { for (e = 0; e < lowprimes.length; ++e) if (i[0] == lowprimes[e]) return !0; return !1 } if (i.isEven()) return !1; for (e = 1; e < lowprimes.length;) { for (var r = lowprimes[e], n = e + 1; n < lowprimes.length && r < lplim;) r *= lowprimes[n++]; for (r = i.modInt(r); e < n;) if (r % lowprimes[e++] == 0) return !1 } return i.millerRabin(t) }

  function bnpMillerRabin(t) { var e = this.subtract(BigInteger.ONE),
      i = e.getLowestSetBit(); if (i <= 0) return !1; var r = e.shiftRight(i); (t = t + 1 >> 1) > lowprimes.length && (t = lowprimes.length); for (var n = nbi(), s = 0; s < t; ++s) { n.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]); var o = n.modPow(r, this); if (0 != o.compareTo(BigInteger.ONE) && 0 != o.compareTo(e)) { for (var h = 1; h++ < i && 0 != o.compareTo(e);) if (o = o.modPow(BigInteger.TWO, this), 0 == o.compareTo(BigInteger.ONE)) return !1; if (0 != o.compareTo(e)) return !1 } } return !0 }

  BigInteger.prototype.copyTo = bnpCopyTo, BigInteger.prototype.fromInt = bnpFromInt, BigInteger.prototype.fromString = bnpFromString, BigInteger.prototype.clamp = bnpClamp, BigInteger.prototype.dlShiftTo = bnpDLShiftTo, BigInteger.prototype.drShiftTo = bnpDRShiftTo, BigInteger.prototype.lShiftTo = bnpLShiftTo, BigInteger.prototype.rShiftTo = bnpRShiftTo, BigInteger.prototype.subTo = bnpSubTo, BigInteger.prototype.multiplyTo = bnpMultiplyTo, BigInteger.prototype.squareTo = bnpSquareTo, BigInteger.prototype.divRemTo = bnpDivRemTo, BigInteger.prototype.invDigit = bnpInvDigit, BigInteger.prototype.isEven = bnpIsEven, BigInteger.prototype.exp = bnpExp, BigInteger.prototype.toString = bnToString, BigInteger.prototype.negate = bnNegate, BigInteger.prototype.abs = bnAbs, BigInteger.prototype.compareTo = bnCompareTo, BigInteger.prototype.bitLength = bnBitLength, BigInteger.prototype.mod = bnMod, BigInteger.prototype.modPowInt = bnModPowInt, BigInteger.prototype.clone = bnClone, BigInteger.prototype.intValue = bnIntValue, BigInteger.prototype.byteValue = bnByteValue, BigInteger.prototype.shortValue = bnShortValue, BigInteger.prototype.chunkSize = bnpChunkSize, BigInteger.prototype.signum = bnSigNum, BigInteger.prototype.toRadix = bnpToRadix, BigInteger.prototype.fromRadix = bnpFromRadix, BigInteger.prototype.fromNumber = bnpFromNumber, BigInteger.prototype.bitwiseTo = bnpBitwiseTo, BigInteger.prototype.changeBit = bnpChangeBit, BigInteger.prototype.addTo = bnpAddTo, BigInteger.prototype.dMultiply = bnpDMultiply, BigInteger.prototype.dAddOffset = bnpDAddOffset, BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo, BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo, BigInteger.prototype.modInt = bnpModInt, BigInteger.prototype.millerRabin = bnpMillerRabin, BigInteger.prototype.square = bnSquare, BigInteger.prototype.toByteArray = bnToByteArray, BigInteger.prototype.equals = bnEquals, BigInteger.prototype.min = bnMin, BigInteger.prototype.max = bnMax, BigInteger.prototype.and = bnAnd, BigInteger.prototype.or = bnOr, BigInteger.prototype.xor = bnXor, BigInteger.prototype.andNot = bnAndNot, BigInteger.prototype.not = bnNot, BigInteger.prototype.shiftLeft = bnShiftLeft, BigInteger.prototype.shiftRight = bnShiftRight, BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit, BigInteger.prototype.bitCount = bnBitCount, BigInteger.prototype.testBit = bnTestBit, BigInteger.prototype.setBit = bnSetBit, BigInteger.prototype.clearBit = bnClearBit, BigInteger.prototype.flipBit = bnFlipBit, BigInteger.prototype.add = bnAdd, BigInteger.prototype.subtract = bnSubtract, BigInteger.prototype.multiply = bnMultiply, BigInteger.prototype.divide = bnDivide, BigInteger.prototype.remainder = bnRemainder, BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder, BigInteger.prototype.modPow = bnModPow, BigInteger.prototype.modInverse = bnModInverse, BigInteger.prototype.isProbablePrime = bnIsProbablePrime, BigInteger.prototype.expmod = bnpExpmod, BigInteger.TWO = nbv(2), BigInteger.ONE = nbv(1), BigInteger.ZERO = nbv(0);

  var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887];
  var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

  function Barrett(t) { this.r2 = nbi(), this.q3 = nbi(), BigInteger.ONE.dlShiftTo(2 * t.t, this.r2), this.mu = this.r2.divide(t), this.m = t }

  function barrettConvert(t) { if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m); if (t.compareTo(this.m) < 0) return t; var e = nbi(); return t.copyTo(e), this.reduce(e), e }

  function barrettRevert(t) { return t }

  function barrettReduce(t) { t.drShiftTo(this.m.t - 1, this.r2), t.t > this.m.t + 1 && (t.t = this.m.t + 1, t.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); for (; t.compareTo(this.r2) < 0;) t.dAddOffset(1, this.m.t + 1);
    for (t.subTo(this.r2, t); t.compareTo(this.m) >= 0;) t.subTo(this.m, t) }

  function barrettSqrTo(t, e) { t.squareTo(e), this.reduce(e) }

  function barrettMulTo(t, e, i) { t.multiplyTo(e, i), this.reduce(i) }

  function bnpMultiplyLowerTo(t, e, i) { var r = Math.min(this.t + t.t, e); for (i.s = 0, i.t = r; r > 0;) i[--r] = 0; for (var n = i.t - this.t; r < n; ++r) i[r + this.t] = this.am(0, t[r], i, r, 0, this.t); for (var s = Math.min(t.t, e); r < s; ++r) this.am(0, t[r], i, r, 0, e - r);
    i.clamp() }

  function bnpMultiplyUpperTo(t, e, i) { --e; var r = i.t = this.t + t.t - e; for (i.s = 0; --r >= 0;) i[r] = 0; for (r = Math.max(e - this.t, 0); r < t.t; ++r) i[this.t + r - e] = this.am(e - r, t[r], i, 0, 0, this.t + r - e + 1);
    i.clamp(), i.drShiftTo(1, i) }

  Barrett.prototype.convert = barrettConvert, Barrett.prototype.revert = barrettRevert, Barrett.prototype.reduce = barrettReduce, Barrett.prototype.mulTo = barrettMulTo, Barrett.prototype.sqrTo = barrettSqrTo;

  Classic.prototype.convert = cConvert, Classic.prototype.revert = cRevert, Classic.prototype.reduce = cReduce, Classic.prototype.mulTo = cMulTo, Classic.prototype.sqrTo = cSqrTo;
  Montgomery.prototype.convert = montConvert, Montgomery.prototype.revert = montRevert, Montgomery.prototype.reduce = montReduce, Montgomery.prototype.mulTo = montMulTo, Montgomery.prototype.sqrTo = montSqrTo;
  NullExp.prototype.convert = nNop, NullExp.prototype.revert = nNop, NullExp.prototype.mulTo = nMulTo, NullExp.prototype.sqrTo = nSqrTo;

  // RSA Key
  function RSAKey() { this.n = null, this.e = 0, this.d = null, this.p = null, this.q = null, this.dmp1 = null, this.dmq1 = null, this.coeff = null }

  function RSASetPublic(t, e) {
    if (null != t && null != e && t.length > 0 && e.length > 0) {
      this.n = parseBigInt(t, 16), this.e = parseInt(e, 16)
    } else throw "Invalid RSA public key"
  }

  function RSADoPublic(t) { return t.modPowInt(this.e, this.n) }

  function RSAEncrypt(t) {
    var e = pkcs1pad2(t, (this.n.bitLength() + 7) >> 3);
    if (null == e) return null;
    var i = this.doPublic(e);
    if (null == i) return null;
    var r = i.toString(16);
    return 0 == (1 & r.length) ? r : "0" + r
  }

  function RSAEncryptLong(t, e, i) {
    var r = (this.n.bitLength() + 7) >> 3,
      n = "",
      s = 0,
      o = r - 11;
    if (o <= 0) return null;
    for (; s + o < t.length;) n += this.encrypt(t.substring(s, s + o)), s += o;
    return n += this.encrypt(t.substring(s, t.length)), i ? n : hex2b64(n)
  }

  function parseBigInt(t, e) { return new BigInteger(t, e) }

  function linebrk(t, e) { for (var i = "", r = 0; r + e < t.length;) i += t.substring(r, r + e) + "\n", r += e; return i + t.substring(r, t.length) }

  function byte2Hex(t) { return t < 16 ? "0" + t.toString(16) : t.toString(16) }

  function pkcs1pad2(t, e) {
    if (e < t.length + 11) return null;
    var i = new Array;
    i[e - 1] = 0;
    for (var r = t.length - 1; r >= 0 && e > 11;) {
      var n = t.charCodeAt(r--);
      n < 128 ? i[--e] = n : n > 127 && n < 2048 ? (i[--e] = 63 & n | 128, i[--e] = n >> 6 | 192) : (i[--e] = 63 & n | 128, i[--e] = n >> 6 & 63 | 128, i[--e] = n >> 12 | 224)
    }
    i[--e] = 0;
    for (var s = new SecureRandom, o = new Array; e > 2;) {
      for (o[0] = 0; 0 == o[0];) s.nextBytes(o);
      i[--e] = o[0]
    }
    return i[--e] = 2, i[--e] = 0, new BigInteger(i)
  }

  function hex2b64(t) {
    var e, i, r = "";
    for (e = 0; e + 3 <= t.length; e += 3) i = parseInt(t.substring(e, e + 3), 16), r += b64map.charAt(i >> 6) + b64map.charAt(63 & i);
    if (e + 1 == t.length) i = parseInt(t.substring(e, e + 1), 16), r += b64map.charAt(i << 2);
    else if (e + 2 == t.length) {
      i = parseInt(t.substring(e, e + 2), 16), r += b64map.charAt(i >> 2) + b64map.charAt((3 & i) << 4)
    }
    for (; (3 & r.length) > 0;) r += b64pad;
    return r
  }

  var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    b64pad = "=";

  RSAKey.prototype.doPublic = RSADoPublic;
  RSAKey.prototype.setPublic = RSASetPublic;
  RSAKey.prototype.encrypt = RSAEncrypt;
  RSAKey.prototype.public_encryptLong = RSAEncryptLong;

  // SecureRandom
  function SecureRandom() {}
  SecureRandom.prototype.nextBytes = function(t) {
    for (var e = 0; e < t.length; ++e) t[e] = Math.floor(256 * Math.random())
  };

  function parsePublicKey(t) {
    var e = atob(t),
      i = [];
    for (var r = 0; r < e.length; r++) i.push(e.charCodeAt(r));
    var n = parseDER(i, 0);
    var seq = n.value;
    var s0 = parseDER(seq, 0);
    var s1 = parseDER(seq, s0.totalLen);
    var bitString = s1.value;
    var inner = parseDER(bitString, 1);
    var innerSeq = inner.value;
    var mod = parseDER(innerSeq, 0);
    var exp = parseDER(innerSeq, mod.totalLen);
    var modHex = bytesToHex(mod.value.slice(mod.value[0] === 0 ? 1 : 0));
    var expHex = bytesToHex(exp.value);
    var key = new RSAKey();
    key.setPublic(modHex, expHex);
    return key;
  }

  function parseDER(data, offset) {
    var tag = data[offset];
    var lenByte = data[offset + 1];
    var len, headerLen;
    if (lenByte < 0x80) {
      len = lenByte;
      headerLen = 2;
    } else {
      var numBytes = lenByte & 0x7f;
      len = 0;
      for (var i = 0; i < numBytes; i++) len = (len << 8) | data[offset + 2 + i];
      headerLen = 2 + numBytes;
    }
    return {
      tag: tag,
      value: data.slice(offset + headerLen, offset + headerLen + len),
      totalLen: headerLen + len
    };
  }

  function bytesToHex(bytes) {
    return bytes.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  }

  RSA.JSEncrypt = function() { this.key = null; };
  RSA.JSEncrypt.prototype.setPublicKey = function(t) {
    try { this.key = parsePublicKey(t); } catch (e) { $.log('RSA setPublicKey error: ' + e); }
  };
  RSA.JSEncrypt.prototype.public_encryptLong = function(t, e, i) {
    if (!this.key) return null;
    return this.key.public_encryptLong(t, e, i);
  };
}

// ============== 完整的 XXTEA 加密 ==============
function Encrypt_Body(body, key) {
  function strToBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xC0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3F));
      } else {
        bytes.push(0xE0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3F));
        bytes.push(0x80 | (code & 0x3F));
      }
    }
    return bytes;
  }

  function bytesToWords(bytes) {
    var words = [];
    for (var i = 0; i < bytes.length; i++) {
      words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    }
    return words;
  }

  function wordsToBytes(words, len) {
    var bytes = [];
    for (var i = 0; i < len; i++) {
      bytes.push((words[i >> 2] >>> (24 - (i % 4) * 8)) & 0xFF);
    }
    return bytes;
  }

  function xxtea(v, n, key) {
    var DELTA = 0x9e3779b9;
    var MX = function(z, y, sum, e, p, k) {
      return (((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z)));
    };
    var sum = 0, e, p, q;
    var z = v[n - 1], y = v[0];
    q = Math.floor(6 + 52 / n);
    while (q-- > 0) {
      sum = (sum + DELTA) >>> 0;
      e = (sum >>> 2) & 3;
      for (p = 0; p < n - 1; p++) {
        y = v[p + 1];
        v[p] = (v[p] + MX(z, y, sum, e, p, key)) >>> 0;
        z = v[p];
      }
      y = v[0];
      v[n - 1] = (v[n - 1] + MX(z, y, sum, e, n - 1, key)) >>> 0;
      z = v[n - 1];
    }
    return v;
  }

  function encryptXXTEA(bodyStr, keyStr) {
    var bodyBytes = strToBytes(bodyStr);
    var keyBytes = strToBytes(keyStr);

    // 补齐 body 到 4 字节倍数
    var bodyLen = bodyBytes.length;
    while (bodyBytes.length % 4 !== 0) bodyBytes.push(0);

    // 补齐 key 到 16 字节
    while (keyBytes.length < 16) keyBytes.push(0);
    keyBytes = keyBytes.slice(0, 16);

    var v = [];
    for (var i = 0; i < bodyBytes.length; i += 4) {
      v.push(
        ((bodyBytes[i] << 24) | (bodyBytes[i+1] << 16) | (bodyBytes[i+2] << 8) | bodyBytes[i+3]) >>> 0
      );
    }
    var k = [];
    for (var i = 0; i < 16; i += 4) {
      k.push(
        ((keyBytes[i] << 24) | (keyBytes[i+1] << 16) | (keyBytes[i+2] << 8) | keyBytes[i+3]) >>> 0
      );
    }

    var encrypted = xxtea(v, v.length, k);
    var resultBytes = wordsToBytes(encrypted, encrypted.length * 4);

    // Base64 编码
    var binary = '';
    for (var i = 0; i < resultBytes.length; i++) {
      binary += String.fromCharCode(resultBytes[i]);
    }
    return btoa(binary);
  }

  return encryptXXTEA(body, key);
}

// ============== RS
// ============== 对外暴露的核心函数 ==============
// 注意：此文件不直接执行，由 amap_sign_rs.js 加载后调用

async function runAmapSignCore(runtime) {
  // runtime = { sessionid, userId, adiu }

  // 初始化加密库
  intCryptoJS();
  intRSA();

  $.log("核心脚本已加载，开始签到流程...");
  $.log("sessionid:", runtime.sessionid ? runtime.sessionid.slice(0, 12) + "..." : "无");

  try {
    const result = await doSign(runtime);
    return result;
  } catch (e) {
    $.log("签到异常:", e.message || e);
    return "签到失败: " + (e.message || e);
  }
}

// 请求封装（兼容 Shadowrocket）
function request(options) {
  return new Promise((resolve, reject) => {
    const method = (options.method || "GET").toUpperCase();
    const reqOpts = {
      url: options.url,
      headers: options.headers || {}
    };
    if (options.body) reqOpts.body = options.body;

    const cb = (err, resp, data) => {
      if (err) return reject(new Error(String(err)));
      resolve({
        status: resp.status || resp.statusCode,
        headers: resp.headers || {},
        body: data || ""
      });
    };

    if (method === "GET") {
      $httpClient.get(reqOpts, cb);
    } else {
      $httpClient.post(reqOpts, cb);
    }
  });
}


async function doSign(runtime) {

  const timestamp = Date.now();
  const uid = runtime.userId || "";
  const adiu = runtime.adiu || "";

  // 示例：生成 sign（具体算法等抓包后确认）
  const signRaw = `uid=${uid}&timestamp=${timestamp}&adiu=${adiu}`;
  const sign = md5(signRaw);

  const resp = await request({
    url: "hhttps://m5.amap.com/ws/alice/activity/daily_sign/do_sign",
    method: "POST",
    headers: {
      "Cookie": "sessionid=" + runtime.sessionid,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
    },
    body: `uid=${uid}&timestamp=${timestamp}&sign=${sign}`
  });

  $.log("签到响应:", resp.status, resp.body?.slice(0, 200));

  const data = JSON.parse(resp.body || "{}");
  return data.message || data.msg || data.result || "签到完成";
}
