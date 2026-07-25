var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x2, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v2, i, a2) => a2.indexOf(v2) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v2] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v2);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          responseHeaders.set(k, v2);
        } else {
          responseHeaders.delete(k);
          for (const v22 of v2) {
            responseHeaders.append(k, v22);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p2 of [path].flat()) {
        this.#path = p2;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a2, b2) {
  if (a2.length === 1) {
    return b2.length === 1 ? a2 < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a2 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a2.length === b2.length ? a2 < b2 ? -1 : 1 : b2.length - a2.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m2];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a2, b2) => b2.length - a2.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m2];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p2 = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p2, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p2;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v2, i, a2) => a2.indexOf(v2) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m2 = node.#methods[i];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p2 = 0; p2 < len; p2++) {
                partOffsets[p2] = offset;
                offset += parts[p2].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m2 = matcher.exec(restPathString);
            if (m2) {
              params[name] = m2[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m2[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m2[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a2, b2) => {
        return a2.score - b2.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process, Deno } = globalThis;
  const isNoColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : process !== void 0 ? (
    // eslint-disable-next-line no-unsafe-optional-chaining
    "NO_COLOR" in process?.env
  ) : false;
  return !isNoColor;
}
__name(getColorEnabled, "getColorEnabled");
async function getColorEnabledAsync() {
  const { navigator } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator !== void 0 && navigator.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}
__name(getColorEnabledAsync, "getColorEnabledAsync");

// node_modules/hono/dist/middleware/logger/index.js
var humanize = /* @__PURE__ */ __name((times) => {
  const [delimiter, separator] = [",", "."];
  const orderTimes = times.map((v2) => v2.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
  return orderTimes.join(separator);
}, "humanize");
var time3 = /* @__PURE__ */ __name((start) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
}, "time");
var colorStatus = /* @__PURE__ */ __name(async (status) => {
  const colorEnabled = await getColorEnabledAsync();
  if (colorEnabled) {
    switch (status / 100 | 0) {
      case 5:
        return `\x1B[31m${status}\x1B[0m`;
      case 4:
        return `\x1B[33m${status}\x1B[0m`;
      case 3:
        return `\x1B[36m${status}\x1B[0m`;
      case 2:
        return `\x1B[32m${status}\x1B[0m`;
    }
  }
  return `${status}`;
}, "colorStatus");
async function log3(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
__name(log3, "log");
var logger = /* @__PURE__ */ __name((fn = console.log) => {
  return /* @__PURE__ */ __name(async function logger2(c, next) {
    const { method, url } = c.req;
    const path = url.slice(url.indexOf("/", 8));
    await log3(fn, "<--", method, path);
    const start = Date.now();
    await next();
    await log3(fn, "-->", method, path, c.res.status, time3(start));
  }, "logger2");
}, "logger");

// src/middleware/tenant.ts
async function tenantMiddleware(c, next) {
  const tenantId = c.req.header("X-Tenant-ID") || "default";
  if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    return c.json({ error: "Invalid tenant ID" }, 400);
  }
  c.set("tenantId", tenantId);
  await next();
}
__name(tenantMiddleware, "tenantMiddleware");

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  __name(assertIs, "assertIs");
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  __name(assertNever, "assertNever");
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  __name(joinValues, "joinValues");
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = /* @__PURE__ */ __name((data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
}, "getParsedType");

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = /* @__PURE__ */ __name((obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
}, "quotelessJson");
var ZodError = class _ZodError extends Error {
  static {
    __name(this, "ZodError");
  }
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = /* @__PURE__ */ __name((error3) => {
      for (const issue of error3.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }, "processError");
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error3 = new ZodError(issues);
  return error3;
};

// node_modules/zod/v3/locales/en.js
var errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
  let message2;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message2 = "Required";
      } else {
        message2 = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message2 = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message2 = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message2 = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message2 = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message2 = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message2 = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message2 = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message2 = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message2 = `${message2} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message2 = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message2 = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message2 = `Invalid ${issue.validation}`;
      } else {
        message2 = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message2 = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message2 = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message2 = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message2 = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message2 = "Number must be finite";
      break;
    default:
      message2 = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message: message2 };
}, "errorMap");
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
__name(setErrorMap, "setErrorMap");
function getErrorMap() {
  return overrideErrorMap;
}
__name(getErrorMap, "getErrorMap");

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = /* @__PURE__ */ __name((params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m2) => !!m2).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
}, "makeIssue");
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x2) => !!x2)
  });
  ctx.common.issues.push(issue);
}
__name(addIssueToContext, "addIssueToContext");
var ParseStatus = class _ParseStatus {
  static {
    __name(this, "ParseStatus");
  }
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
var OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
var isAborted = /* @__PURE__ */ __name((x2) => x2.status === "aborted", "isAborted");
var isDirty = /* @__PURE__ */ __name((x2) => x2.status === "dirty", "isDirty");
var isValid = /* @__PURE__ */ __name((x2) => x2.status === "valid", "isValid");
var isAsync = /* @__PURE__ */ __name((x2) => typeof Promise !== "undefined" && x2 instanceof Promise, "isAsync");

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message2) => typeof message2 === "string" ? { message: message2 } : message2 || {};
  errorUtil2.toString = (message2) => typeof message2 === "string" ? message2 : message2?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  static {
    __name(this, "ParseInputLazyPath");
  }
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = /* @__PURE__ */ __name((ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error3 = new ZodError(ctx.common.issues);
        this._error = error3;
        return this._error;
      }
    };
  }
}, "handleResult");
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    const { message: message2 } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message2 ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message2 ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message2 ?? invalid_type_error ?? ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
__name(processCreateParams, "processCreateParams");
var ZodType = class {
  static {
    __name(this, "ZodType");
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message2) {
    const getIssueProperties = /* @__PURE__ */ __name((val) => {
      if (typeof message2 === "string" || typeof message2 === "undefined") {
        return { message: message2 };
      } else if (typeof message2 === "function") {
        return message2(val);
      } else {
        return message2;
      }
    }, "getIssueProperties");
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      }), "setError");
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: /* @__PURE__ */ __name((data) => this["~validate"](data), "validate")
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
__name(timeRegexSource, "timeRegexSource");
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
__name(timeRegex, "timeRegex");
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
__name(datetimeRegex, "datetimeRegex");
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidIP, "isValidIP");
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
__name(isValidJWT, "isValidJWT");
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidCidr, "isValidCidr");
var ZodString = class _ZodString extends ZodType {
  static {
    __name(this, "ZodString");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message2) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message2)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message2) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message2) });
  }
  url(message2) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message2) });
  }
  emoji(message2) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message2) });
  }
  uuid(message2) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message2) });
  }
  nanoid(message2) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message2) });
  }
  cuid(message2) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message2) });
  }
  cuid2(message2) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message2) });
  }
  ulid(message2) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message2) });
  }
  base64(message2) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message2) });
  }
  base64url(message2) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message2)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message2) {
    return this._addCheck({ kind: "date", message: message2 });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message2) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message2) });
  }
  regex(regex, message2) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message2)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message2) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  endsWith(value, message2) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  min(minLength, message2) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message2)
    });
  }
  max(maxLength, message2) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message2)
    });
  }
  length(len, message2) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message2)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message2) {
    return this.min(1, errorUtil.errToObj(message2));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
__name(floatSafeRemainder, "floatSafeRemainder");
var ZodNumber = class _ZodNumber extends ZodType {
  static {
    __name(this, "ZodNumber");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message2) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message2)
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  finite(message2) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message2)
    });
  }
  safe(message2) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  static {
    __name(this, "ZodBigInt");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  static {
    __name(this, "ZodBoolean");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  static {
    __name(this, "ZodDate");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message2) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  max(maxDate, message2) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  static {
    __name(this, "ZodSymbol");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  static {
    __name(this, "ZodUndefined");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  static {
    __name(this, "ZodNull");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  static {
    __name(this, "ZodAny");
  }
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  static {
    __name(this, "ZodUnknown");
  }
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  static {
    __name(this, "ZodNever");
  }
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  static {
    __name(this, "ZodVoid");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  static {
    __name(this, "ZodArray");
  }
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message2) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message2) }
    });
  }
  max(maxLength, message2) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message2) }
    });
  }
  length(len, message2) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message2) }
    });
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
__name(deepPartialify, "deepPartialify");
var ZodObject = class _ZodObject extends ZodType {
  static {
    __name(this, "ZodObject");
  }
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message2) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message2 !== void 0 ? {
        errorMap: /* @__PURE__ */ __name((issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message2).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }, "errorMap")
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...augmentation
      }), "shape")
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }), "shape"),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  static {
    __name(this, "ZodUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    __name(handleResults, "handleResults");
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = /* @__PURE__ */ __name((type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
}, "getDiscriminator");
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  static {
    __name(this, "ZodDiscriminatedUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a2, b2) {
  const aType = getParsedType(a2);
  const bType = getParsedType(b2);
  if (a2 === b2) {
    return { valid: true, data: a2 };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b2);
    const sharedKeys = util.objectKeys(a2).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a2, ...b2 };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a2[key], b2[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a2.length !== b2.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a2.length; index++) {
      const itemA = a2[index];
      const itemB = b2[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a2 === +b2) {
    return { valid: true, data: a2 };
  } else {
    return { valid: false };
  }
}
__name(mergeValues, "mergeValues");
var ZodIntersection = class extends ZodType {
  static {
    __name(this, "ZodIntersection");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    }, "handleParsed");
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  static {
    __name(this, "ZodTuple");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x2) => !!x2);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  static {
    __name(this, "ZodRecord");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  static {
    __name(this, "ZodMap");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  static {
    __name(this, "ZodSet");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    __name(finalizeSet, "finalizeSet");
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message2) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message2) }
    });
  }
  max(maxSize, message2) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message2) }
    });
  }
  size(size, message2) {
    return this.min(size, message2).max(size, message2);
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  static {
    __name(this, "ZodFunction");
  }
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error3) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error3
        }
      });
    }
    __name(makeArgsIssue, "makeArgsIssue");
    function makeReturnsIssue(returns, error3) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error3
        }
      });
    }
    __name(makeReturnsIssue, "makeReturnsIssue");
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error3 = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error3.addIssue(makeArgsIssue(args, e));
          throw error3;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error3.addIssue(makeReturnsIssue(result, e));
          throw error3;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  static {
    __name(this, "ZodLazy");
  }
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  static {
    __name(this, "ZodLiteral");
  }
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
__name(createZodEnum, "createZodEnum");
var ZodEnum = class _ZodEnum extends ZodType {
  static {
    __name(this, "ZodEnum");
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  static {
    __name(this, "ZodNativeEnum");
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  static {
    __name(this, "ZodPromise");
  }
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  static {
    __name(this, "ZodEffects");
  }
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: /* @__PURE__ */ __name((arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      }, "addIssue"),
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = /* @__PURE__ */ __name((acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      }, "executeRefinement");
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  static {
    __name(this, "ZodOptional");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  static {
    __name(this, "ZodNullable");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  static {
    __name(this, "ZodDefault");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  static {
    __name(this, "ZodCatch");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  static {
    __name(this, "ZodNaN");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  static {
    __name(this, "ZodBranded");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  static {
    __name(this, "ZodPipeline");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = /* @__PURE__ */ __name(async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }, "handleAsync");
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a2, b2) {
    return new _ZodPipeline({
      in: a2,
      out: b2,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  static {
    __name(this, "ZodReadonly");
  }
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = /* @__PURE__ */ __name((data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    }, "freeze");
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p2 = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p22 = typeof p2 === "string" ? { message: p2 } : p2;
  return p22;
}
__name(cleanParams, "cleanParams");
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
__name(custom, "custom");
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = /* @__PURE__ */ __name((cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params), "instanceOfType");
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
var onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
var oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
var coerce = {
  string: /* @__PURE__ */ __name(((arg) => ZodString.create({ ...arg, coerce: true })), "string"),
  number: /* @__PURE__ */ __name(((arg) => ZodNumber.create({ ...arg, coerce: true })), "number"),
  boolean: /* @__PURE__ */ __name(((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })), "boolean"),
  bigint: /* @__PURE__ */ __name(((arg) => ZodBigInt.create({ ...arg, coerce: true })), "bigint"),
  date: /* @__PURE__ */ __name(((arg) => ZodDate.create({ ...arg, coerce: true })), "date")
};
var NEVER = INVALID;

// scripts/hash.ts
async function hash(password) {
  const encoder2 = new TextEncoder();
  const data = encoder2.encode(password + "sws-swap-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
__name(hash, "hash");
async function verify(password, hashValue) {
  const hashed = await hash(password);
  return hashed === hashValue;
}
__name(verify, "verify");

// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");
function encode(string) {
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127) {
      throw new TypeError("non-ASCII string encountered in encode()");
    }
    bytes[i] = code;
  }
  return bytes;
}
__name(encode, "encode");

// node_modules/jose/dist/webapi/lib/base64.js
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
__name(encodeBase64, "encodeBase64");
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(decodeBase64, "decodeBase64");

// node_modules/jose/dist/webapi/util/base64url.js
function decode(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
__name(decode, "decode");
function encode2(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(encode2, "encode");

// node_modules/jose/dist/webapi/lib/crypto_key.js
var unusable = /* @__PURE__ */ __name((name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`), "unusable");
var isAlgorithm = /* @__PURE__ */ __name((algorithm, name) => algorithm.name === name, "isAlgorithm");
function getHashLength(hash2) {
  return parseInt(hash2.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function checkHashLength(algorithm, expected) {
  const actual = getHashLength(algorithm.hash);
  if (actual !== expected)
    throw unusable(`SHA-${expected}`, "algorithm.hash");
}
__name(checkHashLength, "checkHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87": {
      if (!isAlgorithm(key.algorithm, alg))
        throw unusable(alg);
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// node_modules/jose/dist/webapi/lib/invalid_key_input.js
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalidKeyInput = /* @__PURE__ */ __name((actual, ...types) => message("Key must be ", actual, ...types), "invalidKeyInput");
var withAlg = /* @__PURE__ */ __name((alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types), "withAlg");

// node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
  static {
    __name(this, "JWTClaimValidationFailed");
  }
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
var JWTExpired = class extends JOSEError {
  static {
    __name(this, "JWTExpired");
  }
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
var JOSEAlgNotAllowed = class extends JOSEError {
  static {
    __name(this, "JOSEAlgNotAllowed");
  }
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static {
    __name(this, "JWSSignatureVerificationFailed");
  }
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};

// node_modules/jose/dist/webapi/lib/is_key_like.js
var isCryptoKey = /* @__PURE__ */ __name((key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
}, "isCryptoKey");
var isKeyObject = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag] === "KeyObject", "isKeyObject");
var isKeyLike = /* @__PURE__ */ __name((key) => isCryptoKey(key) || isKeyObject(key), "isKeyLike");

// node_modules/jose/dist/webapi/lib/helpers.js
function assertNotSet(value, name) {
  if (value) {
    throw new TypeError(`${name} can only be called once`);
  }
}
__name(assertNotSet, "assertNotSet");
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
__name(decodeBase64url, "decodeBase64url");

// node_modules/jose/dist/webapi/lib/type_checks.js
var isObjectLike = /* @__PURE__ */ __name((value) => typeof value === "object" && value !== null, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");
function isDisjoint(...headers) {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}
__name(isDisjoint, "isDisjoint");
var isJWK = /* @__PURE__ */ __name((key) => isObject(key) && typeof key.kty === "string", "isJWK");
var isPrivateJWK = /* @__PURE__ */ __name((key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string"), "isPrivateJWK");
var isPublicJWK = /* @__PURE__ */ __name((key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0, "isPublicJWK");
var isSecretJWK = /* @__PURE__ */ __name((key) => key.kty === "oct" && typeof key.k === "string", "isSecretJWK");

// node_modules/jose/dist/webapi/lib/signing.js
function checkKeyLength(alg, key) {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}
__name(checkKeyLength, "checkKeyLength");
function subtleAlgorithm(alg, algorithm) {
  const hash2 = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash: hash2, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash: hash2, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash: hash2, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash: hash2, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return { name: alg };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleAlgorithm, "subtleAlgorithm");
async function getSigKey(alg, key, usage) {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
}
__name(getSigKey, "getSigKey");
async function sign(alg, key, data) {
  const cryptoKey = await getSigKey(alg, key, "sign");
  checkKeyLength(alg, cryptoKey);
  const signature = await crypto.subtle.sign(subtleAlgorithm(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}
__name(sign, "sign");
async function verify2(alg, key, signature, data) {
  const cryptoKey = await getSigKey(alg, key, "verify");
  checkKeyLength(alg, cryptoKey);
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}
__name(verify2, "verify");

// node_modules/jose/dist/webapi/lib/jwk_to_key.js
var unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "AKP": {
      switch (jwk.alg) {
        case "ML-DSA-44":
        case "ML-DSA-65":
        case "ML-DSA-87":
          algorithm = { name: jwk.alg };
          keyUsages = jwk.priv ? ["sign"] : ["verify"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
        case "ES384":
        case "ES512":
          algorithm = {
            name: "ECDSA",
            namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[jwk.alg]
          };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
async function jwkToKey(jwk) {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  if (keyData.kty !== "AKP") {
    delete keyData.alg;
  }
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
}
__name(jwkToKey, "jwkToKey");

// node_modules/jose/dist/webapi/lib/normalize_key.js
var unusableForAlg = "given KeyObject instance cannot be used for this algorithm";
var cache;
var handleJWK = /* @__PURE__ */ __name(async (key, jwk, alg, freeze = false) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwkToKey({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "handleJWK");
var handleKeyObject = /* @__PURE__ */ __name((keyObject, alg) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(keyObject);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const isPublic = keyObject.type === "public";
  const extractable = isPublic ? true : false;
  let cryptoKey;
  if (keyObject.asymmetricKeyType === "x25519") {
    switch (alg) {
      case "ECDH-ES":
      case "ECDH-ES+A128KW":
      case "ECDH-ES+A192KW":
      case "ECDH-ES+A256KW":
        break;
      default:
        throw new TypeError(unusableForAlg);
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
  }
  if (keyObject.asymmetricKeyType === "ed25519") {
    if (alg !== "EdDSA" && alg !== "Ed25519") {
      throw new TypeError(unusableForAlg);
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
      isPublic ? "verify" : "sign"
    ]);
  }
  switch (keyObject.asymmetricKeyType) {
    case "ml-dsa-44":
    case "ml-dsa-65":
    case "ml-dsa-87": {
      if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
        throw new TypeError(unusableForAlg);
      }
      cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
        isPublic ? "verify" : "sign"
      ]);
    }
  }
  if (keyObject.asymmetricKeyType === "rsa") {
    let hash2;
    switch (alg) {
      case "RSA-OAEP":
        hash2 = "SHA-1";
        break;
      case "RS256":
      case "PS256":
      case "RSA-OAEP-256":
        hash2 = "SHA-256";
        break;
      case "RS384":
      case "PS384":
      case "RSA-OAEP-384":
        hash2 = "SHA-384";
        break;
      case "RS512":
      case "PS512":
      case "RSA-OAEP-512":
        hash2 = "SHA-512";
        break;
      default:
        throw new TypeError(unusableForAlg);
    }
    if (alg.startsWith("RSA-OAEP")) {
      return keyObject.toCryptoKey({
        name: "RSA-OAEP",
        hash: hash2
      }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
    }
    cryptoKey = keyObject.toCryptoKey({
      name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
      hash: hash2
    }, extractable, [isPublic ? "verify" : "sign"]);
  }
  if (keyObject.asymmetricKeyType === "ec") {
    const nist = /* @__PURE__ */ new Map([
      ["prime256v1", "P-256"],
      ["secp384r1", "P-384"],
      ["secp521r1", "P-521"]
    ]);
    const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
    if (!namedCurve) {
      throw new TypeError(unusableForAlg);
    }
    const expectedCurve = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
    if (expectedCurve[alg] && namedCurve === expectedCurve[alg]) {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg.startsWith("ECDH-ES")) {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDH",
        namedCurve
      }, extractable, isPublic ? [] : ["deriveBits"]);
    }
  }
  if (!cryptoKey) {
    throw new TypeError(unusableForAlg);
  }
  if (!cached) {
    cache.set(keyObject, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "handleKeyObject");
async function normalizeKey(key, alg) {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
}
__name(normalizeKey, "normalizeKey");

// node_modules/jose/dist/webapi/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");

// node_modules/jose/dist/webapi/lib/validate_algorithms.js
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}
__name(validateAlgorithms, "validateAlgorithms");

// node_modules/jose/dist/webapi/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0) {
    let expected;
    switch (usage) {
      case "sign":
      case "verify":
        expected = "sig";
        break;
      case "encrypt":
      case "decrypt":
        expected = "enc";
        break;
    }
    if (key.use !== expected) {
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
    }
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  }
  if (Array.isArray(key.key_ops)) {
    let expectedKeyOp;
    switch (true) {
      case (usage === "sign" || usage === "verify"):
      case alg === "dir":
      case alg.includes("CBC-HS"):
        expectedKeyOp = usage;
        break;
      case alg.startsWith("PBES2"):
        expectedKeyOp = "deriveBits";
        break;
      case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
        if (!alg.includes("GCM") && alg.endsWith("KW")) {
          expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
        } else {
          expectedKeyOp = usage;
        }
        break;
      case (usage === "encrypt" && alg.startsWith("RSA")):
        expectedKeyOp = "wrapKey";
        break;
      case usage === "decrypt":
        expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
        break;
    }
    if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
    }
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key instanceof Uint8Array)
    return;
  if (isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!isKeyLike(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage) => {
  if (isJWK(key)) {
    switch (usage) {
      case "decrypt":
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
      case "encrypt":
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
    }
  }
  if (!isKeyLike(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (key.type === "public") {
    switch (usage) {
      case "sign":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
      case "decrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
    }
  }
  if (key.type === "private") {
    switch (usage) {
      case "verify":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
      case "encrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
    }
  }
}, "asymmetricTypeCheck");
function checkKeyType(alg, key, usage) {
  switch (alg.substring(0, 2)) {
    case "A1":
    case "A2":
    case "di":
    case "HS":
    case "PB":
      symmetricTypeCheck(alg, key, usage);
      break;
    default:
      asymmetricTypeCheck(alg, key, usage);
  }
}
__name(checkKeyType, "checkKeyType");

// node_modules/jose/dist/webapi/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!isDisjoint(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validateAlgorithms("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  checkKeyType(alg, key, "verify");
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder.encode(jws.payload) : jws.payload);
  const signature = decodeBase64url(jws.signature, "signature", JWSInvalid);
  const k = await normalizeKey(key, alg);
  const verified = await verify2(alg, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    payload = decodeBase64url(jws.payload, "payload", JWSInvalid);
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key: k };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// node_modules/jose/dist/webapi/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "epoch");
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
function secs(str) {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}
__name(secs, "secs");
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var normalizeTyp = /* @__PURE__ */ __name((value) => {
  if (value.includes("/")) {
    return value.toLowerCase();
  }
  return `application/${value.toLowerCase()}`;
}, "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}
__name(validateClaimsSet, "validateClaimsSet");
var JWTClaimsBuilder = class {
  static {
    __name(this, "JWTClaimsBuilder");
  }
  #payload;
  constructor(payload) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this.#payload = structuredClone(payload);
  }
  data() {
    return encoder.encode(JSON.stringify(this.#payload));
  }
  get iss() {
    return this.#payload.iss;
  }
  set iss(value) {
    this.#payload.iss = value;
  }
  get sub() {
    return this.#payload.sub;
  }
  set sub(value) {
    this.#payload.sub = value;
  }
  get aud() {
    return this.#payload.aud;
  }
  set aud(value) {
    this.#payload.aud = value;
  }
  set jti(value) {
    this.#payload.jti = value;
  }
  set nbf(value) {
    if (typeof value === "number") {
      this.#payload.nbf = validateInput("setNotBefore", value);
    } else if (value instanceof Date) {
      this.#payload.nbf = validateInput("setNotBefore", epoch(value));
    } else {
      this.#payload.nbf = epoch(/* @__PURE__ */ new Date()) + secs(value);
    }
  }
  set exp(value) {
    if (typeof value === "number") {
      this.#payload.exp = validateInput("setExpirationTime", value);
    } else if (value instanceof Date) {
      this.#payload.exp = validateInput("setExpirationTime", epoch(value));
    } else {
      this.#payload.exp = epoch(/* @__PURE__ */ new Date()) + secs(value);
    }
  }
  set iat(value) {
    if (value === void 0) {
      this.#payload.iat = epoch(/* @__PURE__ */ new Date());
    } else if (value instanceof Date) {
      this.#payload.iat = validateInput("setIssuedAt", epoch(value));
    } else if (typeof value === "string") {
      this.#payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value));
    } else {
      this.#payload.iat = validateInput("setIssuedAt", value);
    }
  }
};

// node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// node_modules/jose/dist/webapi/jws/flattened/sign.js
var FlattenedSign = class {
  static {
    __name(this, "FlattenedSign");
  }
  #payload;
  #protectedHeader;
  #unprotectedHeader;
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this.#payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    assertNotSet(this.#protectedHeader, "setProtectedHeader");
    this.#protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
    this.#unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this.#protectedHeader && !this.#unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this.#protectedHeader,
      ...this.#unprotectedHeader
    };
    const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this.#protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyType(alg, key, "sign");
    let payloadS;
    let payloadB;
    if (b64) {
      payloadS = encode2(this.#payload);
      payloadB = encode(payloadS);
    } else {
      payloadB = this.#payload;
      payloadS = "";
    }
    let protectedHeaderString;
    let protectedHeaderBytes;
    if (this.#protectedHeader) {
      protectedHeaderString = encode2(JSON.stringify(this.#protectedHeader));
      protectedHeaderBytes = encode(protectedHeaderString);
    } else {
      protectedHeaderString = "";
      protectedHeaderBytes = new Uint8Array();
    }
    const data = concat(protectedHeaderBytes, encode("."), payloadB);
    const k = await normalizeKey(key, alg);
    const signature = await sign(alg, k, data);
    const jws = {
      signature: encode2(signature),
      payload: payloadS
    };
    if (this.#unprotectedHeader) {
      jws.header = this.#unprotectedHeader;
    }
    if (this.#protectedHeader) {
      jws.protected = protectedHeaderString;
    }
    return jws;
  }
};

// node_modules/jose/dist/webapi/jws/compact/sign.js
var CompactSign = class {
  static {
    __name(this, "CompactSign");
  }
  #flattened;
  constructor(payload) {
    this.#flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this.#flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this.#flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};

// node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT = class {
  static {
    __name(this, "SignJWT");
  }
  #protectedHeader;
  #jwt;
  constructor(payload = {}) {
    this.#jwt = new JWTClaimsBuilder(payload);
  }
  setIssuer(issuer) {
    this.#jwt.iss = issuer;
    return this;
  }
  setSubject(subject) {
    this.#jwt.sub = subject;
    return this;
  }
  setAudience(audience) {
    this.#jwt.aud = audience;
    return this;
  }
  setJti(jwtId) {
    this.#jwt.jti = jwtId;
    return this;
  }
  setNotBefore(input) {
    this.#jwt.nbf = input;
    return this;
  }
  setExpirationTime(input) {
    this.#jwt.exp = input;
    return this;
  }
  setIssuedAt(input) {
    this.#jwt.iat = input;
    return this;
  }
  setProtectedHeader(protectedHeader) {
    this.#protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(this.#jwt.data());
    sig.setProtectedHeader(this.#protectedHeader);
    if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};

// src/middleware/auth.ts
async function authMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    c.set("userId", payload.sub);
    c.set("userTier", payload.tier);
    c.set("userEmail", payload.email);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}
__name(authMiddleware, "authMiddleware");
async function optionalAuth(c, next) {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      c.set("userId", payload.sub);
      c.set("userTier", payload.tier);
    } catch {
    }
  }
  await next();
}
__name(optionalAuth, "optionalAuth");
async function createToken(userId, email, tier, secret) {
  return new SignJWT({ sub: userId, email, tier }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(new TextEncoder().encode(secret));
}
__name(createToken, "createToken");

// node_modules/@neondatabase/serverless/index.mjs
var So = Object.create;
var Ie = Object.defineProperty;
var Eo = Object.getOwnPropertyDescriptor;
var Ao = Object.getOwnPropertyNames;
var Co = Object.getPrototypeOf;
var _o = Object.prototype.hasOwnProperty;
var Io = /* @__PURE__ */ __name((r, e, t) => e in r ? Ie(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t, "Io");
var a = /* @__PURE__ */ __name((r, e) => Ie(r, "name", { value: e, configurable: true }), "a");
var G = /* @__PURE__ */ __name((r, e) => () => (r && (e = r(r = 0)), e), "G");
var T = /* @__PURE__ */ __name((r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports), "T");
var ie = /* @__PURE__ */ __name((r, e) => {
  for (var t in e) Ie(r, t, {
    get: e[t],
    enumerable: true
  });
}, "ie");
var Dn = /* @__PURE__ */ __name((r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i of Ao(e)) !_o.call(r, i) && i !== t && Ie(r, i, { get: /* @__PURE__ */ __name(() => e[i], "get"), enumerable: !(n = Eo(e, i)) || n.enumerable });
  return r;
}, "Dn");
var Se = /* @__PURE__ */ __name((r, e, t) => (t = r != null ? So(Co(r)) : {}, Dn(e || !r || !r.__esModule ? Ie(t, "default", { value: r, enumerable: true }) : t, r)), "Se");
var O = /* @__PURE__ */ __name((r) => Dn(Ie({}, "__esModule", { value: true }), r), "O");
var E = /* @__PURE__ */ __name((r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t), "E");
var Qn = T((lt) => {
  "use strict";
  p();
  lt.byteLength = Po;
  lt.toByteArray = Bo;
  lt.fromByteArray = ko;
  var ae = [], te = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (Ee = 0, On = qt.length; Ee < On; ++Ee) ae[Ee] = qt[Ee], te[qt.charCodeAt(Ee)] = Ee;
  var Ee, On;
  te[45] = 62;
  te[95] = 63;
  function qn(r) {
    var e = r.length;
    if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  __name(qn, "qn");
  a(qn, "getLens");
  function Po(r) {
    var e = qn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  __name(Po, "Po");
  a(Po, "byteLength");
  function Ro(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  __name(Ro, "Ro");
  a(Ro, "_byteLength");
  function Bo(r) {
    var e, t = qn(r), n = t[0], i = t[1], s = new To(Ro(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
    for (c = 0; c < u; c += 4) e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i === 2 && (e = te[r.charCodeAt(
      c
    )] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = te[r.charCodeAt(c)] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  __name(Bo, "Bo");
  a(Bo, "toByteArray");
  function Lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  __name(Lo, "Lo");
  a(Lo, "tripletToBase64");
  function Fo(r, e, t) {
    for (var n, i = [], s = e; s < t; s += 3) n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(Lo(n));
    return i.join("");
  }
  __name(Fo, "Fo");
  a(Fo, "encodeChunk");
  function ko(r) {
    for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s) i.push(Fo(
      r,
      o,
      o + s > u ? u : o + s
    ));
    return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
  }
  __name(ko, "ko");
  a(ko, "fromByteArray");
});
var Nn = T((Qt) => {
  p();
  Qt.read = function(r, e, t, n, i) {
    var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i - 1 : 0, g = t ? -1 : 1, A = r[e + y];
    for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u; f > 0; s = s * 256 + r[e + y], y += g, f -= 8) ;
    for (o = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; o = o * 256 + r[e + y], y += g, f -= 8) ;
    if (s === 0) s = 1 - l;
    else {
      if (s === c) return o ? NaN : (A ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - l;
    }
    return (A ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Qt.write = function(r, e, t, n, i, s) {
    var o, u, c, l = s * 8 - i - 1, f = (1 << l) - 1, y = f >> 1, g = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + A] = u & 255, A += C, u /= 256, i -= 8) ;
    for (o = o << i | u, l += i; l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8) ;
    r[t + A - C] |= D * 128;
  };
});
var ii = T((Be) => {
  "use strict";
  p();
  var Nt = Qn(), Pe = Nn(), Wn = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
  Be.Buffer = h;
  Be.SlowBuffer = Qo;
  Be.INSPECT_MAX_BYTES = 50;
  var ft = 2147483647;
  Be.kMaxLength = ft;
  h.TYPED_ARRAY_SUPPORT = Mo();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Mo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return false;
    }
  }
  __name(Mo, "Mo");
  a(Mo, "typedArraySupport");
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
    if (h.isBuffer(this)) return this.buffer;
  }, "get") });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
    if (h.isBuffer(
      this
    )) return this.byteOffset;
  }, "get") });
  function he(r) {
    if (r > ft) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(r);
    return Object.setPrototypeOf(e, h.prototype), e;
  }
  __name(he, "he");
  a(he, "createBuffer");
  function h(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string") throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      );
      return $t(r);
    }
    return Gn(r, e, t);
  }
  __name(h, "h");
  a(h, "Buffer");
  h.poolSize = 8192;
  function Gn(r, e, t) {
    if (typeof r == "string") return Do(r, e);
    if (ArrayBuffer.isView(r)) return Oo(r);
    if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(
      r.buffer,
      SharedArrayBuffer
    ))) return jt(r, e, t);
    if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return h.from(n, e, t);
    let i = qo(r);
    if (i) return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return h.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  __name(Gn, "Gn");
  a(Gn, "from");
  h.from = function(r, e, t) {
    return Gn(r, e, t);
  };
  Object.setPrototypeOf(
    h.prototype,
    Uint8Array.prototype
  );
  Object.setPrototypeOf(h, Uint8Array);
  function Vn(r) {
    if (typeof r != "number") throw new TypeError(
      '"size" argument must be of type number'
    );
    if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  __name(Vn, "Vn");
  a(Vn, "assertSize");
  function Uo(r, e, t) {
    return Vn(r), r <= 0 ? he(r) : e !== void 0 ? typeof t == "string" ? he(r).fill(e, t) : he(r).fill(e) : he(r);
  }
  __name(Uo, "Uo");
  a(Uo, "alloc");
  h.alloc = function(r, e, t) {
    return Uo(r, e, t);
  };
  function $t(r) {
    return Vn(r), he(r < 0 ? 0 : Gt(r) | 0);
  }
  __name($t, "$t");
  a($t, "allocUnsafe");
  h.allocUnsafe = function(r) {
    return $t(
      r
    );
  };
  h.allocUnsafeSlow = function(r) {
    return $t(r);
  };
  function Do(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
    let t = zn(r, e) | 0, n = he(t), i = n.write(
      r,
      e
    );
    return i !== t && (n = n.slice(0, i)), n;
  }
  __name(Do, "Do");
  a(Do, "fromString");
  function Wt(r) {
    let e = r.length < 0 ? 0 : Gt(r.length) | 0, t = he(e);
    for (let n = 0; n < e; n += 1) t[n] = r[n] & 255;
    return t;
  }
  __name(Wt, "Wt");
  a(Wt, "fromArrayLike");
  function Oo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return jt(e.buffer, e.byteOffset, e.byteLength);
    }
    return Wt(r);
  }
  __name(Oo, "Oo");
  a(Oo, "fromArrayView");
  function jt(r, e, t) {
    if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(
      r,
      e,
      t
    ), Object.setPrototypeOf(n, h.prototype), n;
  }
  __name(jt, "jt");
  a(jt, "fromArrayBuffer");
  function qo(r) {
    if (h.isBuffer(r)) {
      let e = Gt(r.length) | 0, t = he(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0) return typeof r.length != "number" || zt(r.length) ? he(0) : Wt(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return Wt(r.data);
  }
  __name(qo, "qo");
  a(qo, "fromObject");
  function Gt(r) {
    if (r >= ft) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ft.toString(16) + " bytes");
    return r | 0;
  }
  __name(Gt, "Gt");
  a(Gt, "checked");
  function Qo(r) {
    return +r != r && (r = 0), h.alloc(+r);
  }
  __name(Qo, "Qo");
  a(Qo, "SlowBuffer");
  h.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== h.prototype;
  }, "isBuffer");
  h.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t)) throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    );
    if (e === t) return 0;
    let n = e.length, i = t.length;
    for (let s = 0, o = Math.min(n, i); s < o; ++s) if (e[s] !== t[s]) {
      n = e[s], i = t[s];
      break;
    }
    return n < i ? -1 : i < n ? 1 : 0;
  }, "compare");
  h.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  h.concat = a(function(e, t) {
    if (!Array.isArray(e)) throw new TypeError(
      '"list" argument must be an Array of Buffers'
    );
    if (e.length === 0) return h.alloc(0);
    let n;
    if (t === void 0)
      for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
    let i = h.allocUnsafe(t), s = 0;
    for (n = 0; n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array)) s + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
      else if (h.isBuffer(o)) o.copy(i, s);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i;
  }, "concat");
  function zn(r, e) {
    if (h.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string") throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
    );
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0) return 0;
    let i = false;
    for (; ; ) switch (e) {
      case "ascii":
      case "latin1":
      case "binary":
        return t;
      case "utf8":
      case "utf-8":
        return Ht(r).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t * 2;
      case "hex":
        return t >>> 1;
      case "base64":
        return ni(r).length;
      default:
        if (i) return n ? -1 : Ht(r).length;
        e = ("" + e).toLowerCase(), i = true;
    }
  }
  __name(zn, "zn");
  a(zn, "byteLength");
  h.byteLength = zn;
  function No(r, e, t) {
    let n = false;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
    for (r || (r = "utf8"); ; ) switch (r) {
      case "hex":
        return Zo(this, e, t);
      case "utf8":
      case "utf-8":
        return Yn(this, e, t);
      case "ascii":
        return Ko(this, e, t);
      case "latin1":
      case "binary":
        return Yo(
          this,
          e,
          t
        );
      case "base64":
        return Vo(this, e, t);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Jo(
          this,
          e,
          t
        );
      default:
        if (n) throw new TypeError("Unknown encoding: " + r);
        r = (r + "").toLowerCase(), n = true;
    }
  }
  __name(No, "No");
  a(
    No,
    "slowToString"
  );
  h.prototype._isBuffer = true;
  function Ae(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  __name(Ae, "Ae");
  a(Ae, "swap");
  h.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2) Ae(this, t, t + 1);
    return this;
  }, "swap16");
  h.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4) Ae(this, t, t + 3), Ae(this, t + 1, t + 2);
    return this;
  }, "swap32");
  h.prototype.swap64 = a(
    function() {
      let e = this.length;
      if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < e; t += 8) Ae(this, t, t + 7), Ae(this, t + 1, t + 6), Ae(this, t + 2, t + 5), Ae(this, t + 3, t + 4);
      return this;
    },
    "swap64"
  );
  h.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Yn(
      this,
      0,
      e
    ) : No.apply(this, arguments);
  }, "toString");
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = a(function(e) {
    if (!h.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
    return this === e ? true : h.compare(this, e) === 0;
  }, "equals");
  h.prototype.inspect = a(function() {
    let e = "", t = Be.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Wn && (h.prototype[Wn] = h.prototype.inspect);
  h.prototype.compare = a(function(e, t, n, i, s) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length) throw new RangeError("out of range index");
    if (i >= s && t >= n) return 0;
    if (i >= s) return -1;
    if (t >= n) return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e) return 0;
    let o = s - i, u = n - t, c = Math.min(o, u), l = this.slice(
      i,
      s
    ), f = e.slice(t, n);
    for (let y = 0; y < c; ++y) if (l[y] !== f[y]) {
      o = l[y], u = f[y];
      break;
    }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Kn(r, e, t, n, i) {
    if (r.length === 0) return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, zt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i) return -1;
      t = r.length - 1;
    } else if (t < 0) if (i) t = 0;
    else return -1;
    if (typeof e == "string" && (e = h.from(
      e,
      n
    )), h.isBuffer(e)) return e.length === 0 ? -1 : jn(r, e, t, n, i);
    if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : jn(r, [e], t, n, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  __name(Kn, "Kn");
  a(Kn, "bidirectionalIndexOf");
  function jn(r, e, t, n, i) {
    let s = 1, o = r.length, u = e.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2) return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(f, y) {
      return s === 1 ? f[y] : f.readUInt16BE(y * s);
    }
    __name(c, "c");
    a(c, "read");
    let l;
    if (i) {
      let f = -1;
      for (l = t; l < o; l++) if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
        if (f === -1 && (f = l), l - f + 1 === u) return f * s;
      } else f !== -1 && (l -= l - f), f = -1;
    } else for (t + u > o && (t = o - u), l = t; l >= 0; l--) {
      let f = true;
      for (let y = 0; y < u; y++) if (c(r, l + y) !== c(e, y)) {
        f = false;
        break;
      }
      if (f) return l;
    }
    return -1;
  }
  __name(jn, "jn");
  a(jn, "arrayIndexOf");
  h.prototype.includes = a(function(e, t, n) {
    return this.indexOf(
      e,
      t,
      n
    ) !== -1;
  }, "includes");
  h.prototype.indexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, true);
  }, "indexOf");
  h.prototype.lastIndexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, false);
  }, "lastIndexOf");
  function Wo(r, e, t, n) {
    t = Number(t) || 0;
    let i = r.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0; o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (zt(u)) return o;
      r[t + o] = u;
    }
    return o;
  }
  __name(Wo, "Wo");
  a(Wo, "hexWrite");
  function jo(r, e, t, n) {
    return ht(Ht(e, r.length - t), r, t, n);
  }
  __name(jo, "jo");
  a(jo, "utf8Write");
  function Ho(r, e, t, n) {
    return ht(ra(e), r, t, n);
  }
  __name(Ho, "Ho");
  a(
    Ho,
    "asciiWrite"
  );
  function $o(r, e, t, n) {
    return ht(ni(e), r, t, n);
  }
  __name($o, "$o");
  a($o, "base64Write");
  function Go(r, e, t, n) {
    return ht(
      na(e, r.length - t),
      r,
      t,
      n
    );
  }
  __name(Go, "Go");
  a(Go, "ucs2Write");
  h.prototype.write = a(function(e, t, n, i) {
    if (t === void 0) i = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string") i = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let o = false;
    for (; ; ) switch (i) {
      case "hex":
        return Wo(this, e, t, n);
      case "utf8":
      case "utf-8":
        return jo(this, e, t, n);
      case "ascii":
      case "latin1":
      case "binary":
        return Ho(this, e, t, n);
      case "base64":
        return $o(this, e, t, n);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Go(this, e, t, n);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i);
        i = ("" + i).toLowerCase(), o = true;
    }
  }, "write");
  h.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Vo(r, e, t) {
    return e === 0 && t === r.length ? Nt.fromByteArray(r) : Nt.fromByteArray(r.slice(e, t));
  }
  __name(Vo, "Vo");
  a(Vo, "base64Slice");
  function Yn(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i = e;
    for (; i < t; ) {
      let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i + u <= t) {
        let c, l, f, y;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
            break;
          case 3:
            c = r[i + 1], l = r[i + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            c = r[i + 1], l = r[i + 2], f = r[i + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
    }
    return zo(n);
  }
  __name(Yn, "Yn");
  a(Yn, "utf8Slice");
  var Hn = 4096;
  function zo(r) {
    let e = r.length;
    if (e <= Hn) return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (; n < e; ) t += String.fromCharCode.apply(String, r.slice(n, n += Hn));
    return t;
  }
  __name(zo, "zo");
  a(zo, "decodeCodePointsArray");
  function Ko(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i] & 127);
    return n;
  }
  __name(Ko, "Ko");
  a(Ko, "asciiSlice");
  function Yo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i]);
    return n;
  }
  __name(Yo, "Yo");
  a(Yo, "latin1Slice");
  function Zo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let s = e; s < t; ++s) i += ia[r[s]];
    return i;
  }
  __name(Zo, "Zo");
  a(Zo, "hexSlice");
  function Jo(r, e, t) {
    let n = r.slice(e, t), i = "";
    for (let s = 0; s < n.length - 1; s += 2) i += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i;
  }
  __name(Jo, "Jo");
  a(Jo, "utf16leSlice");
  h.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i = this.subarray(e, t);
    return Object.setPrototypeOf(i, h.prototype), i;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + e > t) throw new RangeError("Trying to access beyond buffer length");
  }
  __name(q, "q");
  a(q, "checkOffset");
  h.prototype.readUintLE = h.prototype.readUIntLE = a(
    function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
      let i = this[e], s = 1, o = 0;
      for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
      return i;
    },
    "readUIntLE"
  );
  h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e + --t], s = 1;
    for (; t > 0 && (s *= 256); ) i += this[e + --t] * s;
    return i;
  }, "readUIntBE");
  h.prototype.readUint8 = h.prototype.readUInt8 = a(
    function(e, t) {
      return e = e >>> 0, t || q(e, 1, this.length), this[e];
    },
    "readUInt8"
  );
  h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(
      e,
      2,
      this.length
    ), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  h.prototype.readBigUInt64LE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  h.prototype.readBigUInt64BE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(s);
  }, "readBigUInt64BE"));
  h.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
    return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
  }, "readIntLE");
  h.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = t, s = 1, o = this[e + --i];
    for (; i > 0 && (s *= 256); ) o += this[e + --i] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  h.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  h.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(
      e,
      2,
      this.length
    );
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  h.prototype.readInt16BE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e + 1] | this[e] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16BE");
  h.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  h.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  h.prototype.readBigInt64LE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  h.prototype.readBigInt64BE = we(a(function(e) {
    e = e >>> 0, Re(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i) << BigInt(32)) + BigInt(
      this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
    );
  }, "readBigInt64BE"));
  h.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, true, 23, 4);
  }, "readFloatLE");
  h.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  h.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  h.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(
      this,
      e,
      false,
      52,
      8
    );
  }, "readDoubleBE");
  function V(r, e, t, n, i, s) {
    if (!h.isBuffer(r)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < s) throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length) throw new RangeError("Index out of range");
  }
  __name(V, "V");
  a(V, "checkInt");
  h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(
        this,
        e,
        t,
        n,
        u,
        0
      );
    }
    let s = 1, o = 0;
    for (this[t] = e & 255; ++o < n && (s *= 256); ) this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Zn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  __name(Zn, "Zn");
  a(Zn, "wrtBigUInt64LE");
  function Jn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  __name(Jn, "Jn");
  a(Jn, "wrtBigUInt64BE");
  h.prototype.writeBigUInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64LE"));
  h.prototype.writeBigUInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64BE"));
  h.prototype.writeIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255; ++s < n && (o *= 256); )
      e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  h.prototype.writeIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  h.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  h.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  h.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  h.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  h.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  h.prototype.writeBigInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  h.prototype.writeBigInt64BE = we(
    a(function(e, t = 0) {
      return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE")
  );
  function Xn(r, e, t, n, i, s) {
    if (t + n > r.length) throw new RangeError("Index out of range");
    if (t < 0) throw new RangeError("Index out of range");
  }
  __name(Xn, "Xn");
  a(Xn, "checkIEEE754");
  function ei(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(r, e, t, n, 23, 4), t + 4;
  }
  __name(ei, "ei");
  a(
    ei,
    "writeFloat"
  );
  h.prototype.writeFloatLE = a(function(e, t, n) {
    return ei(this, e, t, true, n);
  }, "writeFloatLE");
  h.prototype.writeFloatBE = a(function(e, t, n) {
    return ei(this, e, t, false, n);
  }, "writeFloatBE");
  function ti(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Pe.write(
      r,
      e,
      t,
      n,
      52,
      8
    ), t + 8;
  }
  __name(ti, "ti");
  a(ti, "writeDouble");
  h.prototype.writeDoubleLE = a(function(e, t, n) {
    return ti(this, e, t, true, n);
  }, "writeDoubleLE");
  h.prototype.writeDoubleBE = a(function(e, t, n) {
    return ti(this, e, t, false, n);
  }, "writeDoubleBE");
  h.prototype.copy = a(function(e, t, n, i) {
    if (!h.isBuffer(e)) throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0) return 0;
    if (t < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (i < 0) throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
    let s = i - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
  }, "copy");
  h.prototype.fill = a(function(e, t, n, i) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !h.isEncoding(i)) throw new TypeError(
        "Unknown encoding: " + i
      );
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (e = o);
      }
    } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
    if (n <= t) return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number") for (s = t; s < n; ++s) this[s] = e;
    else {
      let o = h.isBuffer(e) ? e : h.from(
        e,
        i
      ), u = o.length;
      if (u === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (s = 0; s < n - t; ++s) this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Te = {};
  function Vt(r, e, t) {
    var n;
    Te[r] = (n = class extends t {
      static {
        __name(this, "n");
      }
      constructor() {
        super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(
          this,
          "code",
          { configurable: true, enumerable: true, value: s, writable: true }
        );
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  __name(Vt, "Vt");
  a(Vt, "E");
  Vt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vt(
    "ERR_INVALID_ARG_TYPE",
    function(r, e) {
      return `The "${r}" argument must be of type number. Received type ${typeof e}`;
    },
    TypeError
  );
  Vt("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = $n(String(t)) : typeof t == "bigint" && (i = String(
      t
    ), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = $n(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
  }, RangeError);
  function $n(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3) e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  __name($n, "$n");
  a($n, "addNumericalSeparator");
  function Xo(r, e, t) {
    Re(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && je(e, r.length - (t + 1));
  }
  __name(Xo, "Xo");
  a(Xo, "checkBounds");
  function ri(r, e, t, n, i, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Te.ERR_OUT_OF_RANGE("value", u, r);
    }
    Xo(n, i, s);
  }
  __name(ri, "ri");
  a(ri, "checkIntBI");
  function Re(r, e) {
    if (typeof r != "number") throw new Te.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  __name(Re, "Re");
  a(Re, "validateNumber");
  function je(r, e, t) {
    throw Math.floor(r) !== r ? (Re(r, t), new Te.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Te.ERR_BUFFER_OUT_OF_BOUNDS() : new Te.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  __name(je, "je");
  a(je, "boundsError");
  var ea = /[^+/0-9A-Za-z-_]/g;
  function ta(r) {
    if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2) return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  __name(ta, "ta");
  a(ta, "base64clean");
  function Ht(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i = null, s = [];
    for (let o = 0; o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(239, 191, 189), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else i && (e -= 3) > -1 && s.push(239, 191, 189);
      if (i = null, t < 128) {
        if ((e -= 1) < 0) break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0) break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0) break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0) break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return s;
  }
  __name(Ht, "Ht");
  a(Ht, "utf8ToBytes");
  function ra(r) {
    let e = [];
    for (let t = 0; t < r.length; ++t) e.push(r.charCodeAt(t) & 255);
    return e;
  }
  __name(ra, "ra");
  a(
    ra,
    "asciiToBytes"
  );
  function na(r, e) {
    let t, n, i, s = [];
    for (let o = 0; o < r.length && !((e -= 2) < 0); ++o) t = r.charCodeAt(
      o
    ), n = t >> 8, i = t % 256, s.push(i), s.push(n);
    return s;
  }
  __name(na, "na");
  a(na, "utf16leToBytes");
  function ni(r) {
    return Nt.toByteArray(
      ta(r)
    );
  }
  __name(ni, "ni");
  a(ni, "base64ToBytes");
  function ht(r, e, t, n) {
    let i;
    for (i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)
      e[i + t] = r[i];
    return i;
  }
  __name(ht, "ht");
  a(ht, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  __name(ue, "ue");
  a(ue, "isInstance");
  function zt(r) {
    return r !== r;
  }
  __name(zt, "zt");
  a(zt, "numberIsNaN");
  var ia = (function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      let n = t * 16;
      for (let i = 0; i < 16; ++i) e[n + i] = r[t] + r[i];
    }
    return e;
  })();
  function we(r) {
    return typeof BigInt > "u" ? sa : r;
  }
  __name(we, "we");
  a(we, "defineBigIntMethod");
  function sa() {
    throw new Error("BigInt not supported");
  }
  __name(sa, "sa");
  a(sa, "BufferBigIntNotDefined");
});
var b;
var v;
var x;
var d;
var m;
var p = G(() => {
  "use strict";
  b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : ii().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var ge = T((Bl, Kt) => {
  "use strict";
  p();
  var Le = typeof Reflect == "object" ? Reflect : null, si = Le && typeof Le.apply == "function" ? Le.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), pt;
  Le && typeof Le.ownKeys == "function" ? pt = Le.ownKeys : Object.getOwnPropertySymbols ? pt = a(function(e) {
    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : pt = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function oa(r) {
    console && console.warn && console.warn(r);
  }
  __name(oa, "oa");
  a(
    oa,
    "ProcessEmitWarning"
  );
  var ai = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function R() {
    R.init.call(this);
  }
  __name(R, "R");
  a(R, "EventEmitter");
  Kt.exports = R;
  Kt.exports.once = la;
  R.EventEmitter = R;
  R.prototype._events = void 0;
  R.prototype._eventsCount = 0;
  R.prototype._maxListeners = void 0;
  var oi = 10;
  function dt(r) {
    if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  __name(dt, "dt");
  a(dt, "checkListener");
  Object.defineProperty(R, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return oi;
  }, "get"), set: a(
    function(r) {
      if (typeof r != "number" || r < 0 || ai(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
      oi = r;
    },
    "set"
  ) });
  R.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  R.prototype.setMaxListeners = a(function(e) {
    if (typeof e != "number" || e < 0 || ai(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
    return this._maxListeners = e, this;
  }, "setMaxListeners");
  function ui(r) {
    return r._maxListeners === void 0 ? R.defaultMaxListeners : r._maxListeners;
  }
  __name(ui, "ui");
  a(ui, "_getMaxListeners");
  R.prototype.getMaxListeners = a(function() {
    return ui(this);
  }, "getMaxListeners");
  R.prototype.emit = a(function(e) {
    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
    var i = e === "error", s = this._events;
    if (s !== void 0) i = i && s.error === void 0;
    else if (!i) return false;
    if (i) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === void 0) return false;
    if (typeof c == "function") si(c, this, t);
    else for (var l = c.length, f = pi(c, l), n = 0; n < l; ++n) si(f[n], this, t);
    return true;
  }, "emit");
  function ci(r, e, t, n) {
    var i, s, o;
    if (dt(
      t
    ), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = ui(r), i > 0 && o.length > i && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
    }
    return r;
  }
  __name(ci, "ci");
  a(ci, "_addListener");
  R.prototype.addListener = a(function(e, t) {
    return ci(this, e, t, false);
  }, "addListener");
  R.prototype.on = R.prototype.addListener;
  R.prototype.prependListener = a(function(e, t) {
    return ci(this, e, t, true);
  }, "prependListener");
  function aa() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  __name(aa, "aa");
  a(aa, "onceWrapper");
  function li(r, e, t) {
    var n = {
      fired: false,
      wrapFn: void 0,
      target: r,
      type: e,
      listener: t
    }, i = aa.bind(n);
    return i.listener = t, n.wrapFn = i, i;
  }
  __name(li, "li");
  a(li, "_onceWrap");
  R.prototype.once = a(function(e, t) {
    return dt(t), this.on(e, li(this, e, t)), this;
  }, "once");
  R.prototype.prependOnceListener = a(function(e, t) {
    return dt(t), this.prependListener(e, li(this, e, t)), this;
  }, "prependOnceListener");
  R.prototype.removeListener = a(function(e, t) {
    var n, i, s, o, u;
    if (dt(t), i = this._events, i === void 0) return this;
    if (n = i[e], n === void 0) return this;
    if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
    else if (typeof n != "function") {
      for (s = -1, o = n.length - 1; o >= 0; o--) if (n[o] === t || n[o].listener === t) {
        u = n[o].listener, s = o;
        break;
      }
      if (s < 0) return this;
      s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
    }
    return this;
  }, "removeListener");
  R.prototype.off = R.prototype.removeListener;
  R.prototype.removeAllListeners = a(function(e) {
    var t, n, i;
    if (n = this._events, n === void 0) return this;
    if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i = 0; i < s.length; ++i) o = s[i], o !== "removeListener" && this.removeAllListeners(
        o
      );
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function") this.removeListener(e, t);
    else if (t !== void 0) for (i = t.length - 1; i >= 0; i--) this.removeListener(e, t[i]);
    return this;
  }, "removeAllListeners");
  function fi(r, e, t) {
    var n = r._events;
    if (n === void 0) return [];
    var i = n[e];
    return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? ca(i) : pi(i, i.length);
  }
  __name(fi, "fi");
  a(fi, "_listeners");
  R.prototype.listeners = a(function(e) {
    return fi(this, e, true);
  }, "listeners");
  R.prototype.rawListeners = a(function(e) {
    return fi(this, e, false);
  }, "rawListeners");
  R.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : hi.call(r, e);
  };
  R.prototype.listenerCount = hi;
  function hi(r) {
    var e = this._events;
    if (e !== void 0) {
      var t = e[r];
      if (typeof t == "function")
        return 1;
      if (t !== void 0) return t.length;
    }
    return 0;
  }
  __name(hi, "hi");
  a(hi, "listenerCount");
  R.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? pt(this._events) : [];
  }, "eventNames");
  function pi(r, e) {
    for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
    return t;
  }
  __name(pi, "pi");
  a(pi, "arrayClone");
  function ua(r, e) {
    for (; e + 1 < r.length; e++) r[e] = r[e + 1];
    r.pop();
  }
  __name(ua, "ua");
  a(ua, "spliceOne");
  function ca(r) {
    for (var e = new Array(r.length), t = 0; t < e.length; ++t) e[t] = r[t].listener || r[t];
    return e;
  }
  __name(ca, "ca");
  a(ca, "unwrapListeners");
  function la(r, e) {
    return new Promise(function(t, n) {
      function i(o) {
        r.removeListener(e, s), n(o);
      }
      __name(i, "i");
      a(i, "errorListener");
      function s() {
        typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
      }
      __name(s, "s");
      a(s, "resolver"), di(r, e, s, { once: true }), e !== "error" && fa(r, i, { once: true });
    });
  }
  __name(la, "la");
  a(la, "once");
  function fa(r, e, t) {
    typeof r.on == "function" && di(r, "error", e, t);
  }
  __name(fa, "fa");
  a(
    fa,
    "addErrorHandlerIfEventEmitter"
  );
  function di(r, e, t, n) {
    if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function") r.addEventListener(e, a(/* @__PURE__ */ __name(function i(s) {
      n.once && r.removeEventListener(e, i), t(s);
    }, "i"), "wrapListener"));
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  __name(di, "di");
  a(di, "eventTargetAgnosticAddListener");
});
var wi = {};
ie(wi, { Socket: /* @__PURE__ */ __name(() => ce, "Socket"), isIP: /* @__PURE__ */ __name(() => ha, "isIP") });
function ha(r) {
  return 0;
}
__name(ha, "ha");
var mi;
var yi;
var S;
var ce;
var Fe = G(() => {
  "use strict";
  p();
  mi = Se(ge(), 1);
  a(ha, "isIP");
  yi = /^[^.]+\./, S = class S2 extends mi.EventEmitter {
    static {
      __name(this, "S");
    }
    constructor() {
      super(...arguments);
      E(this, "opts", {});
      E(this, "connecting", false);
      E(this, "pending", true);
      E(
        this,
        "writable",
        true
      );
      E(this, "encrypted", false);
      E(this, "authorized", false);
      E(this, "destroyed", false);
      E(this, "ws", null);
      E(this, "writeBuffer");
      E(this, "tlsState", 0);
      E(this, "tlsRead");
      E(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      S2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      S2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      S2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      S2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return S2.opts.wsProxy ?? S2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      S2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? S2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      S2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? S2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      S2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      S2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return S2.opts.disableSNI ?? S2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      S2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? S2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get disableWarningInBrowsers() {
      return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
    }
    static set disableWarningInBrowsers(t) {
      S2.opts.disableWarningInBrowsers = t;
    }
    get disableWarningInBrowsers() {
      return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
    }
    set disableWarningInBrowsers(t) {
      this.opts.disableWarningInBrowsers = t;
    }
    static get pipelineConnect() {
      return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      S2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? S2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return S2.opts.subtls ?? S2.defaults.subtls;
    }
    static set subtls(t) {
      S2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? S2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      S2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? S2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return S2.opts.rootCerts ?? S2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      S2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? S2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i = this.wsProxy;
      if (i === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i) {
      this.connecting = true, i && this.once("connect", i);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, l = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
          this.emit("error", f), this.emit("close");
        }), c.addEventListener("message", (f) => {
          if (this.tlsState === 0) {
            let y = d.from(f.data);
            this.emit("data", y);
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), l ? s() : c.addEventListener(
          "open",
          s
        );
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(l), o(this.ws);
        else try {
          this.ws = new WebSocket(l), o(this.ws);
        } catch {
          this.ws = new __unstable_WebSocket(l), o(this.ws);
        }
      } catch (c) {
        let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(f, { headers: { Upgrade: "websocket" } }).then(
          (y) => {
            if (this.ws = y.webSocket, this.ws == null) throw c;
            this.ws.accept(), o(this.ws, true);
          }
        ).catch((y) => {
          this.emit(
            "error",
            new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)
          ), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === void 0) throw new Error(
        "For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information."
      );
      this.tlsState = 1;
      let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t = await this.tlsRead();
        if (t === void 0) break;
        {
          let n = d.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws && this.ws.send(t);
        return;
      }
      if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(() => {
        this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
      }, 0);
      else {
        let n = new Uint8Array(
          this.writeBuffer.length + t.length
        );
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i = (s) => {
    }) {
      return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t,
          n,
          i
        );
      }) : (this.tlsWrite(t), i()), true);
    }
    end(t = d.alloc(0), n = "utf8", i = () => {
    }) {
      return this.write(t, n, () => {
        this.ws.close(), i();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(S, "Socket"), E(S, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t, n, i) => {
      let s;
      return i?.jwtAuth ? s = t.replace(yi, "apiauth.") : s = t.replace(yi, "api."), "https://" + s + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false,
    disableWarningInBrowsers: false
  }), E(S, "opts", {});
  ce = S;
});
var gi = {};
ie(gi, { parse: /* @__PURE__ */ __name(() => Yt, "parse") });
function Yt(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(
    t.length
  ), { username: i, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(
    n
  );
  s = decodeURIComponent(s), i = decodeURIComponent(i), l = decodeURIComponent(l);
  let A = i + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
  return {
    href: r,
    protocol: t,
    auth: A,
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: l,
    search: f,
    query: C,
    hash: g
  };
}
__name(Yt, "Yt");
var Zt = G(() => {
  "use strict";
  p();
  a(Yt, "parse");
});
var tr = T((Ai) => {
  "use strict";
  p();
  Ai.parse = function(r, e) {
    return new er(r, e).parse();
  };
  var vt = class vt2 {
    static {
      __name(this, "vt");
    }
    constructor(e, t) {
      this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(
        e
      );
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[") for (; !this.isEof(); ) {
        var e = this.nextCharacter();
        if (e.value === "=") break;
      }
    }
    parse(e) {
      var t, n, i;
      for (this.consumeDimensions(); !this.isEof(); ) if (t = this.nextCharacter(), t.value === "{" && !i) this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(
        true
      )), this.position += n.position - 2);
      else if (t.value === "}" && !i) {
        if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
      } else t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
      if (this.dimension !== 0) throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(vt, "ArrayParser");
  var er = vt;
  function Ca(r) {
    return r;
  }
  __name(Ca, "Ca");
  a(Ca, "identity");
});
var rr = T((Zl, Ci) => {
  p();
  var _a = tr();
  Ci.exports = { create: a(function(r, e) {
    return { parse: a(function() {
      return _a.parse(r, e);
    }, "parse") };
  }, "create") };
});
var Ti = T((ef, Ii) => {
  "use strict";
  p();
  var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ra = /^-?infinity$/;
  Ii.exports = a(function(e) {
    if (Ra.test(e)) return Number(e.replace("i", "I"));
    var t = Ia.exec(e);
    if (!t) return Ba(
      e
    ) || null;
    var n = !!t[8], i = parseInt(t[1], 10);
    n && (i = _i(i));
    var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(
      t[4],
      10
    ), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
    f = f ? 1e3 * parseFloat(f) : 0;
    var y, g = La(e);
    return g != null ? (y = new Date(Date.UTC(i, s, o, u, c, l, f)), nr(i) && y.setUTCFullYear(i), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i, s, o, u, c, l, f), nr(i) && y.setFullYear(i)), y;
  }, "parseDate");
  function Ba(r) {
    var e = Ta.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = _i(t));
      var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
      return nr(
        t
      ) && o.setFullYear(t), o;
    }
  }
  __name(Ba, "Ba");
  a(Ba, "getDate");
  function La(r) {
    if (r.endsWith("+00")) return 0;
    var e = Pa.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z") return 0;
      var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(
        e[3] || 0,
        10
      ) * 60 + parseInt(e[4] || 0, 10);
      return i * n * 1e3;
    }
  }
  __name(La, "La");
  a(La, "timeZoneOffset");
  function _i(r) {
    return -(r - 1);
  }
  __name(_i, "_i");
  a(_i, "bcYearToNegativeYear");
  function nr(r) {
    return r >= 0 && r < 100;
  }
  __name(nr, "nr");
  a(nr, "is0To99");
});
var Ri = T((nf, Pi) => {
  p();
  Pi.exports = ka;
  var Fa = Object.prototype.hasOwnProperty;
  function ka(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Fa.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }
  __name(ka, "ka");
  a(ka, "extend");
});
var Fi = T((af, Li) => {
  "use strict";
  p();
  var Ma = Ri();
  Li.exports = ke;
  function ke(r) {
    if (!(this instanceof ke))
      return new ke(r);
    Ma(this, Va(r));
  }
  __name(ke, "ke");
  a(ke, "PostgresInterval");
  var Ua = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "years"
  ];
  ke.prototype.toPostgres = function() {
    var r = Ua.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t + " " + e;
    }, this).join(" ");
  };
  var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
  ke.prototype.toISOString = ke.prototype.toISO = function() {
    var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i + Da[n];
    }
    __name(t, "t");
  };
  var ir = "([+-]?\\d+)", Qa = ir + "\\s+years?", Na = ir + "\\s+mons?", Wa = ir + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), Bi = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
  function Ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(
      e,
      10
    ) / 1e3;
  }
  __name(Ga, "Ga");
  a(Ga, "parseMilliseconds");
  function Va(r) {
    if (!r) return {};
    var e = Ha.exec(r), t = e[8] === "-";
    return Object.keys(Bi).reduce(function(n, i) {
      var s = Bi[i], o = e[s];
      return !o || (o = i === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i) && (o *= -1), n[i] = o), n;
    }, {});
  }
  __name(Va, "Va");
  a(Va, "parse");
});
var Mi = T((lf, ki) => {
  "use strict";
  p();
  ki.exports = a(function(e) {
    if (/^\\x/.test(e)) return new d(e.substr(
      2
    ), "hex");
    for (var t = "", n = 0; n < e.length; ) if (e[n] !== "\\") t += e[n], ++n;
    else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
    else {
      for (var i = 1; n + i < e.length && e[n + i] === "\\"; ) i++;
      for (var s = 0; s < Math.floor(i / 2); ++s) t += "\\";
      n += Math.floor(i / 2) * 2;
    }
    return new d(t, "binary");
  }, "parseBytea");
});
var Wi = T((pf, Ni) => {
  p();
  var Ve = tr(), ze = rr(), xt = Ti(), Di = Fi(), Oi = Mi();
  function St(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  __name(St, "St");
  a(St, "allowNull");
  function qi(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  __name(qi, "qi");
  a(qi, "parseBool");
  function za(r) {
    return r ? Ve.parse(r, qi) : null;
  }
  __name(za, "za");
  a(za, "parseBoolArray");
  function Ka(r) {
    return parseInt(r, 10);
  }
  __name(Ka, "Ka");
  a(Ka, "parseBaseTenInt");
  function sr(r) {
    return r ? Ve.parse(r, St(Ka)) : null;
  }
  __name(sr, "sr");
  a(sr, "parseIntegerArray");
  function Ya(r) {
    return r ? Ve.parse(r, St(function(e) {
      return Qi(e).trim();
    })) : null;
  }
  __name(Ya, "Ya");
  a(Ya, "parseBigIntegerArray");
  var Za = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = cr(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), or = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r) return null;
    var e = ze.create(r);
    return e.parse();
  }, "parseStringArray"), ar = a(function(r) {
    if (!r) return null;
    var e = ze.create(
      r,
      function(t) {
        return t !== null && (t = xt(t)), t;
      }
    );
    return e.parse();
  }, "parseDateArray"), Ja = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = Di(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), Xa = a(function(r) {
    return r ? Ve.parse(r, St(Oi)) : null;
  }, "parseByteAArray"), ur = a(function(r) {
    return parseInt(r, 10);
  }, "parseInteger"), Qi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), Ui = a(function(r) {
    return r ? Ve.parse(r, St(JSON.parse)) : null;
  }, "parseJsonArray"), cr = a(
    function(r) {
      return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(
        r[1]
      ) });
    },
    "parsePoint"
  ), eu = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(") return null;
    for (var e = "(", t = "", n = false, i = 2; i < r.length - 1; i++) {
      if (n || (e += r[i]), r[i] === ")") {
        n = true;
        continue;
      } else if (!n) continue;
      r[i] !== "," && (t += r[i]);
    }
    var s = cr(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), tu = a(function(r) {
    r(20, Qi), r(21, ur), r(23, ur), r(26, ur), r(700, parseFloat), r(701, parseFloat), r(16, qi), r(1082, xt), r(1114, xt), r(1184, xt), r(
      600,
      cr
    ), r(651, re), r(718, eu), r(1e3, za), r(1001, Xa), r(1005, sr), r(1007, sr), r(1028, sr), r(1016, Ya), r(1017, Za), r(1021, or), r(1022, or), r(1231, or), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(
      1115,
      ar
    ), r(1182, ar), r(1185, ar), r(1186, Di), r(1187, Ja), r(17, Oi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Ui), r(3807, Ui), r(3907, re), r(2951, re), r(791, re), r(1183, re), r(1270, re);
  }, "init");
  Ni.exports = { init: tu };
});
var Hi = T((mf, ji) => {
  "use strict";
  p();
  var z = 1e6;
  function ru(r) {
    var e = r.readInt32BE(0), t = r.readUInt32BE(
      4
    ), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i = "", s, o, u, c, l, f;
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i;
  }
  __name(ru, "ru");
  a(ru, "readInt8");
  ji.exports = ru;
});
var Ki = T((bf, zi) => {
  p();
  var nu = Hi(), L = a(function(r, e, t, n, i) {
    t = t || 0, n = n || false, i = i || function(A, C, D) {
      return A * Math.pow(2, D) + C;
    };
    var s = t >> 3, o = a(function(A) {
      return n ? ~A & 255 : A;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var l = 0;
    t % 8 + e >= 8 && (l = i(0, o(r[s]) & u, c));
    for (var f = e + t >> 3, y = s + 1; y < f; y++) l = i(l, o(
      r[y]
    ), 8);
    var g = (e + t) % 8;
    return g > 0 && (l = i(l, o(r[f]) >> 8 - g, g)), l;
  }, "parseBits"), Vi = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i = L(r, 1), s = L(r, t, 1);
    if (s === 0) return 0;
    var o = 1, u = a(function(l, f, y) {
      l === 0 && (l = 1);
      for (var g = 1; g <= y; g++) o /= 2, (f & 1 << y - g) > 0 && (l += o);
      return l;
    }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
    return s == Math.pow(
      2,
      t + 1
    ) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), iu = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
  }, "parseInt16"), $i = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(
      r,
      31,
      1,
      true
    ) + 1) : L(r, 31, 1);
  }, "parseInt32"), su = a(function(r) {
    return Vi(r, 23, 8);
  }, "parseFloat32"), ou = a(function(r) {
    return Vi(r, 52, 11);
  }, "parseFloat64"), au = a(function(r) {
    var e = L(r, 16, 32);
    if (e == 49152) return NaN;
    for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i = [], s = L(r, 16), o = 0; o < s; o++) n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, L(
      r,
      16,
      48
    ));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Gi = a(function(r, e) {
    var t = L(e, 1), n = L(
      e,
      63,
      1
    ), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
    return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
      return this.usec;
    }, i.setMicroSeconds = function(s) {
      this.usec = s;
    }, i.getUTCMicroSeconds = function() {
      return this.usec;
    }, i;
  }, "parseDate"), Ke = a(
    function(r) {
      for (var e = L(
        r,
        32
      ), t = L(r, 32, 32), n = L(r, 32, 64), i = 96, s = [], o = 0; o < e; o++) s[o] = L(r, 32, i), i += 32, i += 32;
      var u = a(function(l) {
        var f = L(r, 32, i);
        if (i += 32, f == 4294967295) return null;
        var y;
        if (l == 23 || l == 20) return y = L(r, f * 8, i), i += f * 8, y;
        if (l == 25) return y = r.toString(this.encoding, i >> 3, (i += f << 3) >> 3), y;
        console.log("ERROR: ElementType not implemented: " + l);
      }, "parseElement"), c = a(function(l, f) {
        var y = [], g;
        if (l.length > 1) {
          var A = l.shift();
          for (g = 0; g < A; g++) y[g] = c(l, f);
          l.unshift(A);
        } else for (g = 0; g < l[0]; g++) y[g] = u(f);
        return y;
      }, "parse");
      return c(s, n);
    },
    "parseArray"
  ), uu = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), cu = a(function(r) {
    return r === null ? null : L(r, 8) > 0;
  }, "parseBool"), lu = a(function(r) {
    r(20, nu), r(21, iu), r(23, $i), r(26, $i), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Gi.bind(null, false)), r(1184, Gi.bind(null, true)), r(1e3, Ke), r(1007, Ke), r(1016, Ke), r(1008, Ke), r(1009, Ke), r(25, uu);
  }, "init");
  zi.exports = { init: lu };
});
var Zi = T((Sf, Yi) => {
  p();
  Yi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = T((Ze) => {
  p();
  var fu = Wi(), hu = Ki(), pu = rr(), du = Zi();
  Ze.getTypeParser = yu;
  Ze.setTypeParser = mu;
  Ze.arrayParser = pu;
  Ze.builtins = du;
  var Ye = { text: {}, binary: {} };
  function Ji(r) {
    return String(r);
  }
  __name(Ji, "Ji");
  a(Ji, "noParse");
  function yu(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Ji;
  }
  __name(yu, "yu");
  a(yu, "getTypeParser");
  function mu(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  __name(mu, "mu");
  a(mu, "setTypeParser");
  fu.init(function(r, e) {
    Ye.text[r] = e;
  });
  hu.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var At = T((If, Xi) => {
  "use strict";
  p();
  var wu = Je();
  function Et(r) {
    this._types = r || wu, this.text = {}, this.binary = {};
  }
  __name(Et, "Et");
  a(Et, "TypeOverrides");
  Et.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  Et.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  Et.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Xi.exports = Et;
});
function Xe(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
    for (let B = 0, j = 0; B < 16; B++, j += 4) A[B] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
    for (let B = 16; B < 64; B++) {
      let j = g(A[B - 15], 7) ^ g(A[B - 15], 18) ^ A[B - 15] >>> 3, le = g(
        A[B - 2],
        17
      ) ^ g(A[B - 2], 19) ^ A[B - 2] >>> 10;
      A[B] = A[B - 16] + j + A[B - 7] + le | 0;
    }
    let I = e, w = t, Z = n, W = i, J = s, X = o, se = u, oe = c;
    for (let B = 0; B < 64; B++) {
      let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), le = J & X ^ ~J & se, de = oe + j + le + y[B] + A[B] | 0, We = g(I, 2) ^ g(
        I,
        13
      ) ^ g(I, 22), fe = I & w ^ I & Z ^ w & Z, _e = We + fe | 0;
      oe = se, se = X, X = J, J = W + de | 0, W = Z, Z = w, w = I, I = de + _e | 0;
    }
    e = e + I | 0, t = t + w | 0, n = n + Z | 0, i = i + W | 0, s = s + J | 0, o = o + X | 0, u = u + se | 0, c = c + oe | 0, f = 0;
  }, "process"), Y = a((I) => {
    typeof I == "string" && (I = new TextEncoder().encode(I));
    for (let w = 0; w < I.length; w++) C[f++] = I[w], f === 64 && D();
    l += I.length;
  }, "add"), P = a(() => {
    if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
      for (; f < 64; ) C[f++] = 0;
      D();
    }
    for (; f < 58; ) C[f++] = 0;
    let I = l * 8;
    C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
    let w = new Uint8Array(
      32
    );
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === void 0 ? { add: Y, digest: P } : (Y(r), P());
}
__name(Xe, "Xe");
var es = G(() => {
  "use strict";
  p();
  a(Xe, "sha256");
});
var U;
var et;
var ts = G(() => {
  "use strict";
  p();
  U = class U2 {
    static {
      __name(this, "U");
    }
    constructor() {
      E(this, "_dataLength", 0);
      E(this, "_bufferLength", 0);
      E(this, "_state", new Int32Array(4));
      E(this, "_buffer", new ArrayBuffer(68));
      E(this, "_buffer8");
      E(this, "_buffer32");
      this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(
        e
      ).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let t = U2.hexChars, n = U2.hexOut, i, s, o, u;
      for (u = 0; u < 4; u += 1) for (s = u * 8, i = e[u], o = 0; o < 8; o += 2) n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(
        i & 15
      ), i >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i = e[1], s = e[2], o = e[3];
      n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
      for (o = 0; o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128) t[i++] = s;
        else if (s < 2048) t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
        else if (s < 55296 || s > 56319) t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
          t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        }
        i >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e.charCodeAt(o++);
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e[o++];
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let t = e.buffer, n = e.state, i = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1) this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i), i.set(U2.buffer32Identity)), o <= 4294967295) i[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null) return;
        let c = parseInt(
          u[2],
          16
        ), l = parseInt(u[1], 16) || 0;
        i[14] = c, i[15] = l;
      }
      return U2._md5cycle(this._state, i), e ? this._state : U2._hex(
        this._state
      );
    }
  };
  a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U());
  et = U;
});
var lr = {};
ie(lr, { createHash: /* @__PURE__ */ __name(() => bu, "createHash"), createHmac: /* @__PURE__ */ __name(() => vu, "createHmac"), randomBytes: /* @__PURE__ */ __name(() => gu, "randomBytes") });
function gu(r) {
  return crypto.getRandomValues(d.alloc(r));
}
__name(gu, "gu");
function bu(r) {
  if (r === "sha256") return { update: a(function(e) {
    return { digest: a(
      function() {
        return d.from(Xe(e));
      },
      "digest"
    ) };
  }, "update") };
  if (r === "md5") return { update: a(function(e) {
    return {
      digest: a(function() {
        return typeof e == "string" ? et.hashStr(e) : et.hashByteArray(e);
      }, "digest")
    };
  }, "update") };
  throw new Error(`Hash type '${r}' not supported`);
}
__name(bu, "bu");
function vu(r, e) {
  if (r !== "sha256") throw new Error(`Only sha256 is supported (requested: '${r}')`);
  return { update: a(function(t) {
    return { digest: a(
      function() {
        typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(
          t
        ));
        let n = e.length;
        if (n > 64) e = Xe(e);
        else if (n < 64) {
          let c = new Uint8Array(64);
          c.set(e), e = c;
        }
        let i = new Uint8Array(
          64
        ), s = new Uint8Array(64);
        for (let c = 0; c < 64; c++) i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
        let o = new Uint8Array(t.length + 64);
        o.set(i, 0), o.set(t, 64);
        let u = new Uint8Array(96);
        return u.set(s, 0), u.set(Xe(o), 64), d.from(Xe(u));
      },
      "digest"
    ) };
  }, "update") };
}
__name(vu, "vu");
var fr = G(() => {
  "use strict";
  p();
  es();
  ts();
  a(gu, "randomBytes");
  a(bu, "createHash");
  a(vu, "createHmac");
});
var tt = T((Qf, hr) => {
  "use strict";
  p();
  hr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), xu = Me.getTypeParser(20, "text"), Su = Me.getTypeParser(
    1016,
    "text"
  );
  hr.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(
      23,
      "text"
    ) : xu), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : Su);
  });
});
var rt = T((Wf, ns) => {
  "use strict";
  p();
  var Eu = (fr(), O(lr)), Au = tt();
  function Cu(r) {
    var e = r.replace(
      /\\/g,
      "\\\\"
    ).replace(/"/g, '\\"');
    return '"' + e + '"';
  }
  __name(Cu, "Cu");
  a(Cu, "escapeElement");
  function rs(r) {
    for (var e = "{", t = 0; t < r.length; t++) t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + rs(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
    return e = e + "}", e;
  }
  __name(rs, "rs");
  a(rs, "arrayString");
  var Ct = a(function(r, e) {
    if (r == null) return null;
    if (r instanceof d) return r;
    if (ArrayBuffer.isView(r)) {
      var t = d.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? rs(r) : typeof r == "object" ? _u(r, e) : r.toString();
  }, "prepareValue");
  function _u(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), Ct(r.toPostgres(Ct), e);
    }
    return JSON.stringify(r);
  }
  __name(_u, "_u");
  a(_u, "prepareObject");
  function N(r, e) {
    for (r = "" + r; r.length < e; ) r = "0" + r;
    return r;
  }
  __name(N, "N");
  a(N, "pad");
  function Iu(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(
      r.getHours(),
      2
    ) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
    return e < 0 ? (i += "-", e *= -1) : i += "+", i += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i += " BC"), i;
  }
  __name(Iu, "Iu");
  a(Iu, "dateToString");
  function Tu(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(
      r.getUTCMilliseconds(),
      3
    );
    return n += "+00:00", t && (n += " BC"), n;
  }
  __name(Tu, "Tu");
  a(Tu, "dateToStringUTC");
  function Pu(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  __name(Pu, "Pu");
  a(Pu, "normalizeQueryConfig");
  var pr = a(function(r) {
    return Eu.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Ru = a(
    function(r, e, t) {
      var n = pr(e + r), i = pr(d.concat([d.from(n), t]));
      return "md5" + i;
    },
    "postgresMd5PasswordHash"
  );
  ns.exports = {
    prepareValue: a(function(e) {
      return Ct(e);
    }, "prepareValueWrapper"),
    normalizeQueryConfig: Pu,
    postgresMd5PasswordHash: Ru,
    md5: pr
  };
});
var nt = {};
ie(nt, { default: /* @__PURE__ */ __name(() => ku, "default") });
var ku;
var it = G(() => {
  "use strict";
  p();
  ku = {};
});
var ds = T((th, ps) => {
  "use strict";
  p();
  var yr = (fr(), O(lr));
  function Mu(r) {
    if (r.indexOf("SCRAM-SHA-256") === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = yr.randomBytes(
      18
    ).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  __name(Mu, "Mu");
  a(Mu, "startSession");
  function Uu(r, e, t) {
    if (r.message !== "SASLInitialResponse") throw new Error(
      "SASL: Last message was not SASLInitialResponse"
    );
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = qu(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i = d.from(n.salt, "base64"), s = Wu(e, i, n.iteration), o = Ue(s, "Client Key"), u = Nu(
      o
    ), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = Ue(u, y), A = hs(o, g), C = A.toString("base64"), D = Ue(s, "Server Key"), Y = Ue(D, y);
    r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
  }
  __name(Uu, "Uu");
  a(Uu, "continueSession");
  function Du(r, e) {
    if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = Qu(
      e
    );
    if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  __name(Du, "Du");
  a(Du, "finalizeSession");
  function Ou(r) {
    if (typeof r != "string") throw new TypeError("SASL: text must be a string");
    return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  __name(Ou, "Ou");
  a(Ou, "isPrintableChars");
  function ls(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  __name(ls, "ls");
  a(ls, "isBase64");
  function fs(r) {
    if (typeof r != "string") throw new TypeError("SASL: attribute pairs text must be a string");
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  __name(fs, "fs");
  a(fs, "parseAttributePairs");
  function qu(r) {
    let e = fs(r), t = e.get("r");
    if (t) {
      if (!Ou(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ls(n)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i = e.get("i");
    if (i) {
      if (!/^[1-9][0-9]*$/.test(i)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  __name(qu, "qu");
  a(qu, "parseServerFirstMessage");
  function Qu(r) {
    let t = fs(r).get("v");
    if (t) {
      if (!ls(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    return { serverSignature: t };
  }
  __name(Qu, "Qu");
  a(Qu, "parseServerFinalMessage");
  function hs(r, e) {
    if (!d.isBuffer(r)) throw new TypeError("first argument must be a Buffer");
    if (!d.isBuffer(e)) throw new TypeError(
      "second argument must be a Buffer"
    );
    if (r.length !== e.length) throw new Error("Buffer lengths must match");
    if (r.length === 0) throw new Error("Buffers cannot be empty");
    return d.from(r.map((t, n) => r[n] ^ e[n]));
  }
  __name(hs, "hs");
  a(hs, "xorBuffers");
  function Nu(r) {
    return yr.createHash("sha256").update(r).digest();
  }
  __name(Nu, "Nu");
  a(Nu, "sha256");
  function Ue(r, e) {
    return yr.createHmac("sha256", r).update(e).digest();
  }
  __name(Ue, "Ue");
  a(Ue, "hmacSha256");
  function Wu(r, e, t) {
    for (var n = Ue(
      r,
      d.concat([e, d.from([0, 0, 0, 1])])
    ), i = n, s = 0; s < t - 1; s++) n = Ue(r, n), i = hs(i, n);
    return i;
  }
  __name(Wu, "Wu");
  a(Wu, "Hi");
  ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
});
var mr = {};
ie(mr, { join: /* @__PURE__ */ __name(() => ju, "join") });
function ju(...r) {
  return r.join("/");
}
__name(ju, "ju");
var wr = G(() => {
  "use strict";
  p();
  a(
    ju,
    "join"
  );
});
var gr = {};
ie(gr, { stat: /* @__PURE__ */ __name(() => Hu, "stat") });
function Hu(r, e) {
  e(new Error("No filesystem"));
}
__name(Hu, "Hu");
var br = G(() => {
  "use strict";
  p();
  a(Hu, "stat");
});
var vr = {};
ie(vr, { default: /* @__PURE__ */ __name(() => $u, "default") });
var $u;
var xr = G(() => {
  "use strict";
  p();
  $u = {};
});
var ys = {};
ie(ys, { StringDecoder: /* @__PURE__ */ __name(() => Sr, "StringDecoder") });
var Er;
var Sr;
var ms = G(() => {
  "use strict";
  p();
  Er = class Er {
    static {
      __name(this, "Er");
    }
    constructor(e) {
      E(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(Er, "StringDecoder");
  Sr = Er;
});
var vs = T((fh, bs) => {
  "use strict";
  p();
  var { Transform: Gu } = (xr(), O(vr)), { StringDecoder: Vu } = (ms(), O(ys)), ve = /* @__PURE__ */ Symbol(
    "last"
  ), It = /* @__PURE__ */ Symbol("decoder");
  function zu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[It].write(r).split(
        this.matcher
      ), n.length === 1) return t();
      n.shift(), this.overflow = false;
    } else this[ve] += this[It].write(r), n = this[ve].split(this.matcher);
    this[ve] = n.pop();
    for (let i = 0; i < n.length; i++) try {
      gs(this, this.mapper(n[i]));
    } catch (s) {
      return t(s);
    }
    if (this.overflow = this[ve].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error(
        "maximum buffer reached"
      ));
      return;
    }
    t();
  }
  __name(zu, "zu");
  a(zu, "transform");
  function Ku(r) {
    if (this[ve] += this[It].end(), this[ve])
      try {
        gs(this, this.mapper(this[ve]));
      } catch (e) {
        return r(e);
      }
    r();
  }
  __name(Ku, "Ku");
  a(Ku, "flush");
  function gs(r, e) {
    e !== void 0 && r.push(e);
  }
  __name(gs, "gs");
  a(gs, "push");
  function ws(r) {
    return r;
  }
  __name(ws, "ws");
  a(ws, "noop");
  function Yu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
    let n = new Gu(t);
    return n[ve] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
      this._writableState.errorEmitted = false, s(i);
    }, n;
  }
  __name(Yu, "Yu");
  a(Yu, "split");
  bs.exports = Yu;
});
var Es = T((dh, pe) => {
  "use strict";
  p();
  var xs = (wr(), O(mr)), Zu = (xr(), O(vr)).Stream, Ju = vs(), Ss = (it(), O(nt)), Xu = 5432, Tt = m.platform === "win32", st = m.stderr, ec = 56, tc = 7, rc = 61440, nc = 32768;
  function ic(r) {
    return (r & rc) == nc;
  }
  __name(ic, "ic");
  a(ic, "isRegFile");
  var De = ["host", "port", "database", "user", "password"], Ar = De.length, sc = De[Ar - 1];
  function Cr() {
    var r = st instanceof Zu && st.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      st.write(Ss.format.apply(Ss, e));
    }
  }
  __name(Cr, "Cr");
  a(Cr, "warn");
  Object.defineProperty(pe.exports, "isWin", { get: a(function() {
    return Tt;
  }, "get"), set: a(function(r) {
    Tt = r;
  }, "set") });
  pe.exports.warnTo = function(r) {
    var e = st;
    return st = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec | tc) ? (Cr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Cr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var oc = pe.exports.match = function(r, e) {
    return De.slice(0, -1).reduce(function(t, n, i) {
      return i == 1 && Number(r[n] || Xu) === Number(
        e[n]
      ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i = e.pipe(
      Ju()
    );
    function s(c) {
      var l = ac(c);
      l && uc(l) && oc(r, l) && (n = l[sc], i.end());
    }
    __name(s, "s");
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), Cr("WARNING: error on reading file: %s", c), t(
        void 0
      );
    }, "onErr");
    e.on("error", u), i.on("data", s).on("end", o).on("error", u);
  };
  var ac = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/)) return null;
    for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(
      function(f, y, g) {
        var A = r.substring(y, g);
        Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[De[f]] = A;
      },
      "addToObj"
    ), l = 0; l < r.length - 1; l += 1) {
      if (e = r.charAt(l + 1), t = r.charAt(
        l
      ), u = n == Ar - 1, u) {
        c(n, i);
        break;
      }
      l >= 0 && e == ":" && t !== "\\" && (c(n, i, l + 1), i = l + 2, n += 1);
    }
    return o = Object.keys(o).length === Ar ? o : null, o;
  }, uc = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0; t < De.length; t += 1) {
      var n = e[t], i = r[De[t]] || "", s = n(i);
      if (!s) return false;
    }
    return true;
  };
});
var Cs = T((gh, _r) => {
  "use strict";
  p();
  var wh = (wr(), O(mr)), As = (br(), O(gr)), Pt = Es();
  _r.exports = function(r, e) {
    var t = Pt.getFileName();
    As.stat(t, function(n, i) {
      if (n || !Pt.usePgPass(i, t)) return e(void 0);
      var s = As.createReadStream(
        t
      );
      Pt.getPassword(r, s, e);
    });
  };
  _r.exports.warnTo = Pt.warnTo;
});
var _s = {};
ie(_s, { default: /* @__PURE__ */ __name(() => cc, "default") });
var cc;
var Is = G(() => {
  "use strict";
  p();
  cc = {};
});
var Ps = T((xh, Ts) => {
  "use strict";
  p();
  var lc = (Zt(), O(gi)), Ir = (br(), O(gr));
  function Tr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
    for (var n in t) Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i = (e.auth || ":").split(":");
    if (t.user = i[0], t.password = i.splice(1).join(
      ":"
    ), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(
      0
    ) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Ir.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Ir.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Ir.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  __name(Tr, "Tr");
  a(Tr, "parse");
  Ts.exports = Tr;
  Tr.parse = Tr;
});
var Rt = T((Ah, Ls) => {
  "use strict";
  p();
  var fc = (Is(), O(_s)), Bs = tt(), Rs = Ps().parse, H = a(function(r, e, t) {
    return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Bs[r];
  }, "val"), hc = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return Bs.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(function(r) {
    return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }, "quoteParamValue"), ne = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Oe(n));
  }, "add"), Rr = class Rr {
    static {
      __name(this, "Rr");
    }
    constructor(e) {
      e = typeof e == "string" ? Rs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Rs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: H("password", e)
      }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne(t, this, "user"), ne(t, this, "password"), ne(t, this, "port"), ne(t, this, "application_name"), ne(
        t,
        this,
        "fallback_application_name"
      ), ne(t, this, "connect_timeout"), ne(t, this, "options");
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne(t, n, "sslmode"), ne(t, n, "sslca"), ne(t, n, "sslkey"), ne(t, n, "sslcert"), ne(t, n, "sslrootcert"), this.database && t.push("dbname=" + Oe(this.database)), this.replication && t.push("replication=" + Oe(this.replication)), this.host && t.push("host=" + Oe(this.host)), this.isDomainSocket) return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Oe(this.client_encoding)), fc.lookup(this.host, function(i, s) {
        return i ? e(i, null) : (t.push("hostaddr=" + Oe(s)), e(null, t.join(" ")));
      });
    }
  };
  a(Rr, "ConnectionParameters");
  var Pr = Rr;
  Ls.exports = Pr;
});
var Ms = T((Ih, ks) => {
  "use strict";
  p();
  var pc = Je(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Lr = class Lr {
    static {
      __name(this, "Lr");
    }
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(
        t[2],
        10
      ), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(
        e.length
      ), n = 0, i = e.length; n < i; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i = e.length; n < i; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](
          s
        ) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0; t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(Lr, "Result");
  var Br = Lr;
  ks.exports = Br;
});
var qs = T((Rh, Os) => {
  "use strict";
  p();
  var { EventEmitter: dc } = ge(), Us = Ms(), Ds = rt(), kr = class kr extends dc {
    static {
      __name(this, "kr");
    }
    constructor(e, t, n) {
      super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(
            e.fields
          );
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(
        e
      ), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback) return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError) return this.handleError(
        this._canceledDueToError,
        e
      );
      if (this.callback) try {
        this.callback(null, this._results);
      } catch (t) {
        m.nextTick(() => {
          throw t;
        });
      }
      this.emit(
        "end",
        this._results
      );
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string") return new Error(
        "A query must have either text or a name. Supplying neither is unsupported."
      );
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {
    }
  };
  a(kr, "Query");
  var Fr = kr;
  Os.exports = Fr;
});
var ln = T((_) => {
  "use strict";
  p();
  Object.defineProperty(_, "__esModule", { value: true });
  _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = void 0;
  _.parseComplete = { name: "parseComplete", length: 5 };
  _.bindComplete = { name: "bindComplete", length: 5 };
  _.closeComplete = { name: "closeComplete", length: 5 };
  _.noData = { name: "noData", length: 5 };
  _.portalSuspended = { name: "portalSuspended", length: 5 };
  _.replicationStart = { name: "replicationStart", length: 4 };
  _.emptyQuery = { name: "emptyQuery", length: 4 };
  _.copyDone = { name: "copyDone", length: 4 };
  var Kr = class Kr extends Error {
    static {
      __name(this, "Kr");
    }
    constructor(e, t, n) {
      super(e), this.length = t, this.name = n;
    }
  };
  a(Kr, "DatabaseError");
  var Mr = Kr;
  _.DatabaseError = Mr;
  var Yr = class Yr {
    static {
      __name(this, "Yr");
    }
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Yr, "CopyDataMessage");
  var Ur = Yr;
  _.CopyDataMessage = Ur;
  var Zr = class Zr {
    static {
      __name(this, "Zr");
    }
    constructor(e, t, n, i) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
    }
  };
  a(Zr, "CopyResponse");
  var Dr = Zr;
  _.CopyResponse = Dr;
  var Jr = class Jr {
    static {
      __name(this, "Jr");
    }
    constructor(e, t, n, i, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Jr, "Field");
  var Or = Jr;
  _.Field = Or;
  var Xr = class Xr {
    static {
      __name(this, "Xr");
    }
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
    }
  };
  a(Xr, "RowDescriptionMessage");
  var qr = Xr;
  _.RowDescriptionMessage = qr;
  var en = class en {
    static {
      __name(this, "en");
    }
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(en, "ParameterDescriptionMessage");
  var Qr = en;
  _.ParameterDescriptionMessage = Qr;
  var tn = class tn {
    static {
      __name(this, "tn");
    }
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(tn, "ParameterStatusMessage");
  var Nr = tn;
  _.ParameterStatusMessage = Nr;
  var rn = class rn {
    static {
      __name(this, "rn");
    }
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(rn, "AuthenticationMD5Password");
  var Wr = rn;
  _.AuthenticationMD5Password = Wr;
  var nn = class nn {
    static {
      __name(this, "nn");
    }
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(nn, "BackendKeyDataMessage");
  var jr = nn;
  _.BackendKeyDataMessage = jr;
  var sn = class sn {
    static {
      __name(this, "sn");
    }
    constructor(e, t, n, i) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
    }
  };
  a(sn, "NotificationResponseMessage");
  var Hr = sn;
  _.NotificationResponseMessage = Hr;
  var on2 = class on {
    static {
      __name(this, "on");
    }
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a(on2, "ReadyForQueryMessage");
  var $r = on2;
  _.ReadyForQueryMessage = $r;
  var an = class an {
    static {
      __name(this, "an");
    }
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(an, "CommandCompleteMessage");
  var Gr = an;
  _.CommandCompleteMessage = Gr;
  var un = class un {
    static {
      __name(this, "un");
    }
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(un, "DataRowMessage");
  var Vr = un;
  _.DataRowMessage = Vr;
  var cn = class cn {
    static {
      __name(this, "cn");
    }
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(cn, "NoticeMessage");
  var zr = cn;
  _.NoticeMessage = zr;
});
var Qs = T((Bt) => {
  "use strict";
  p();
  Object.defineProperty(Bt, "__esModule", { value: true });
  Bt.Writer = void 0;
  var hn = class hn {
    static {
      __name(this, "hn");
    }
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
    }
    ensure(e) {
      if (this.buffer.length - this.offset < e) {
        let n = this.buffer, i = n.length + (n.length >> 1) + e;
        this.buffer = d.allocUnsafe(i), n.copy(
          this.buffer
        );
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e) this.ensure(1);
      else {
        let t = d.byteLength(e);
        this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      let t = d.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(
        e.length
      ), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      let t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
    }
  };
  a(hn, "Writer");
  var fn = hn;
  Bt.Writer = fn;
});
var Ws = T((Ft) => {
  "use strict";
  p();
  Object.defineProperty(Ft, "__esModule", { value: true });
  Ft.serialize = void 0;
  var pn = Qs(), F = new pn.Writer(), yc = a((r) => {
    F.addInt16(3).addInt16(0);
    for (let n of Object.keys(r)) F.addCString(
      n
    ).addCString(r[n]);
    F.addCString("client_encoding").addCString("UTF8");
    let e = F.addCString("").flush(), t = e.length + 4;
    return new pn.Writer().addInt32(t).add(e).flush();
  }, "startup"), mc = a(() => {
    let r = d.allocUnsafe(
      8
    );
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), wc = a((r) => F.addCString(r).flush(
    112
  ), "password"), gc = a(function(r, e) {
    return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
  }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
    return F.addString(r).flush(112);
  }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || Ns, n = t.length, i = F.addCString(e).addCString(r.text).addInt16(n);
    for (let s = 0; s < n; s++) i.addInt32(t[s]);
    return F.flush(80);
  }, "parse"), qe = new pn.Writer(), Sc = a(function(r, e) {
    for (let t = 0; t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (F.addInt16(0), qe.addInt32(-1)) : n instanceof d ? (F.addInt16(
        1
      ), qe.addInt32(n.length), qe.add(n)) : (F.addInt16(0), qe.addInt32(d.byteLength(n)), qe.addString(n));
    }
  }, "writeValues"), Ec = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || Ns, s = i.length;
    return F.addCString(e).addCString(t), F.addInt16(s), Sc(i, r.valueMapper), F.addInt16(s), F.add(qe.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
  }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
    if (!r || !r.portal && !r.rows) return Ac;
    let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i);
    return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), _c = a(
    (r, e) => {
      let t = d.allocUnsafe(16);
      return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(
        5678,
        6
      ), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
    },
    "cancel"
  ), dn = a((r, e) => {
    let n = 4 + d.byteLength(e) + 1, i = d.allocUnsafe(1 + n);
    return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
  }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? dn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Rc = a((r) => {
    let e = `${r.type}${r.name || ""}`;
    return dn(67, e);
  }, "close"), Bc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => dn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
    startup: yc,
    password: wc,
    requestSsl: mc,
    sendSASLInitialResponseMessage: gc,
    sendSCRAMClientFinalMessage: bc,
    query: vc,
    parse: xc,
    bind: Ec,
    execute: Cc,
    describe: Pc,
    close: Rc,
    flush: a(
      () => Fc,
      "flush"
    ),
    sync: a(() => kc, "sync"),
    end: a(() => Mc, "end"),
    copyData: Bc,
    copyDone: a(() => Uc, "copyDone"),
    copyFail: Lc,
    cancel: _c
  };
  Ft.serialize = Dc;
});
var js = T((kt) => {
  "use strict";
  p();
  Object.defineProperty(kt, "__esModule", { value: true });
  kt.BufferReader = void 0;
  var Oc = d.allocUnsafe(0), mn = class mn {
    static {
      __name(this, "mn");
    }
    constructor(e = 0) {
      this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(
        this.offset
      );
      return this.offset += 4, e;
    }
    uint32() {
      let e = this.buffer.readUInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (; this.buffer[t++] !== 0; ) ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(mn, "BufferReader");
  var yn = mn;
  kt.BufferReader = yn;
});
var Gs = T((Mt) => {
  "use strict";
  p();
  Object.defineProperty(Mt, "__esModule", { value: true });
  Mt.Parser = void 0;
  var k = ln(), qc = js(), wn = 1, Qc = 4, Hs = wn + Qc, $s = d.allocUnsafe(0), bn = class bn {
    static {
      __name(this, "bn");
    }
    constructor(e) {
      if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader(), e?.mode === "binary") throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
      for (; i + Hs <= n; ) {
        let s = this.buffer[i], o = this.buffer.readUInt32BE(
          i + wn
        ), u = wn + o;
        if (u + i <= n) {
          let c = this.handlePacket(i + Hs, s, o, this.buffer);
          t(c), i += u;
        } else break;
      }
      i === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (; t >= s; ) s *= 2;
            i = d.allocUnsafe(s);
          }
          this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i) {
      switch (t) {
        case 50:
          return k.bindComplete;
        case 49:
          return k.parseComplete;
        case 51:
          return k.closeComplete;
        case 110:
          return k.noData;
        case 115:
          return k.portalSuspended;
        case 99:
          return k.copyDone;
        case 87:
          return k.replicationStart;
        case 73:
          return k.emptyQuery;
        case 68:
          return this.parseDataRowMessage(e, n, i);
        case 67:
          return this.parseCommandCompleteMessage(
            e,
            n,
            i
          );
        case 90:
          return this.parseReadyForQueryMessage(e, n, i);
        case 65:
          return this.parseNotificationMessage(
            e,
            n,
            i
          );
        case 82:
          return this.parseAuthenticationResponse(e, n, i);
        case 83:
          return this.parseParameterStatusMessage(
            e,
            n,
            i
          );
        case 75:
          return this.parseBackendKeyData(e, n, i);
        case 69:
          return this.parseErrorMessage(e, n, i, "error");
        case 78:
          return this.parseErrorMessage(e, n, i, "notice");
        case 84:
          return this.parseRowDescriptionMessage(
            e,
            n,
            i
          );
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i);
        case 71:
          return this.parseCopyInMessage(
            e,
            n,
            i
          );
        case 72:
          return this.parseCopyOutMessage(e, n, i);
        case 100:
          return this.parseCopyData(e, n, i);
        default:
          return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.string(1);
      return new k.ReadyForQueryMessage(t, i);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring();
      return new k.CommandCompleteMessage(t, i);
    }
    parseCopyData(e, t, n) {
      let i = n.slice(e, e + (t - 4));
      return new k.CopyDataMessage(t, i);
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(
        e,
        t,
        n,
        "copyInResponse"
      );
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i, s, o);
      for (let c = 0; c < o; c++) u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new k.NotificationResponseMessage(t, i, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int16(), s = new k.RowDescriptionMessage(t, i);
      for (let o = 0; o < i; o++) s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new k.Field(e, t, n, i, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i);
      for (let o = 0; o < i; o++)
        s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new Array(i);
      for (let o = 0; o < i; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new k.DataRowMessage(t, s);
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring(), s = this.reader.cstring();
      return new k.ParameterStatusMessage(
        t,
        i,
        s
      );
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.int32();
      return new k.BackendKeyDataMessage(t, i, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let o = this.reader.bytes(4);
            return new k.AuthenticationMD5Password(t, o);
          }
          break;
        case 10:
          {
            s.name = "authenticationSASL", s.mechanisms = [];
            let o;
            do
              o = this.reader.cstring(), o && s.mechanisms.push(o);
            while (o);
          }
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (; o !== "\0"; ) s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(bn, "Parser");
  var gn = bn;
  Mt.Parser = gn;
});
var vn = T((xe) => {
  "use strict";
  p();
  Object.defineProperty(xe, "__esModule", { value: true });
  xe.DatabaseError = xe.serialize = xe.parse = void 0;
  var Nc = ln();
  Object.defineProperty(xe, "DatabaseError", { enumerable: true, get: a(
    function() {
      return Nc.DatabaseError;
    },
    "get"
  ) });
  var Wc = Ws();
  Object.defineProperty(xe, "serialize", {
    enumerable: true,
    get: a(function() {
      return Wc.serialize;
    }, "get")
  });
  var jc = Gs();
  function Hc(r, e) {
    let t = new jc.Parser();
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  __name(Hc, "Hc");
  a(Hc, "parse");
  xe.parse = Hc;
});
var Vs = {};
ie(Vs, { connect: /* @__PURE__ */ __name(() => $c, "connect") });
function $c({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
__name($c, "$c");
var zs = G(
  () => {
    "use strict";
    p();
    a($c, "connect");
  }
);
var En = T((Xh, Zs) => {
  "use strict";
  p();
  var Ks = (Fe(), O(wi)), Gc = ge().EventEmitter, { parse: Vc, serialize: Q } = vn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), Sn = class Sn extends Gc {
    static {
      __name(this, "Sn");
    }
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new Ks.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
      });
      let i = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl) return this.attachListeners(
        this.stream
      );
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (zs(), O(Vs));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (l) {
          return n.emit(
            "error",
            l
          );
        }
        n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on(
        "end",
        () => {
          this.emit("end");
        }
      ), Vc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(e, t));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(
        e
      ));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(e));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Ys);
    }
    sync() {
      this._ending = true, this._send(Ys), this._send(zc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(Kc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(Sn, "Connection");
  var xn = Sn;
  Zs.exports = xn;
});
var eo = T((np, Xs) => {
  "use strict";
  p();
  var Yc = ge().EventEmitter, rp = (it(), O(nt)), Zc = rt(), An = ds(), Jc = Cs(), Xc = At(), el = Rt(), Js = qs(), tl = tt(), rl = En(), Cn = class Cn extends Yc {
    static {
      __name(this, "Cn");
    }
    constructor(e) {
      super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(
        this,
        "password",
        { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }
      ), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a((n) => {
        m.nextTick(() => {
          n.handleError(e, this.connection);
        });
      }, "enqueueError");
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(
          () => {
            e(i);
          }
        );
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(
        n
      ), n.once("end", () => {
        let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i) => {
          i ? n(i) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(
        this
      )), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
        if (n !== void 0) {
          if (typeof n != "string") {
            t.emit("error", new TypeError(
              "Password must be a string"
            ));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : Jc(
        this.connectionParameters,
        (n) => {
          n !== void 0 && (this.connectionParameters.password = this.password = n), e();
        }
      );
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(
        () => {
          let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
          this.connection.password(t);
        }
      );
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = An.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e) {
      An.continueSession(
        this.saslSession,
        this.password,
        e.data
      ), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
    _handleAuthSASLFinal(e) {
      An.finalizeSession(this.saslSession, e.data), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(e);
        return;
      }
      this.activeQuery = null, t.handleError(
        e,
        this.connection
      );
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(e);
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(
        e,
        this.connection
      );
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(
            e.processID,
            e.secretKey
          );
        });
      } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(/"/g, '""') + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i = 0; i < e.length; i++) {
        var s = e[i];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
        this.readyForQuery = false, this.hasExecuted = true;
        let e = this.activeQuery.submit(this.connection);
        e && m.nextTick(() => {
          this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
        });
      } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i, s, o, u, c;
      if (e == null) throw new TypeError(
        "Client was passed a null or undefined query"
      );
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Js(e, t, n), i.callback || (s = new this._Promise((l, f) => {
        i.callback = (y, g) => y ? f(y) : l(g);
      }))), o && (c = i.callback, u = setTimeout(() => {
        var l = new Error("Query read timeout");
        m.nextTick(
          () => {
            i.handleError(l, this.connection);
          }
        ), c(l), i.callback = () => {
        };
        var f = this.queryQueue.indexOf(i);
        f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
      }, o), i.callback = (l, f) => {
        clearTimeout(u), c(l, f);
      }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i.handleError(new Error("Client was closed and is not queryable"), this.connection);
      }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(() => {
        i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
      }), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting) if (e) e();
      else return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
      else return new this._Promise((t) => {
        this.connection.once("end", t);
      });
    }
  };
  a(Cn, "Client");
  var Ut = Cn;
  Ut.Query = Js;
  Xs.exports = Ut;
});
var io = T((op, no) => {
  "use strict";
  p();
  var nl = ge().EventEmitter, to = a(function() {
  }, "NOOP"), ro = a((r, e) => {
    let t = r.findIndex(e);
    return t === -1 ? void 0 : r.splice(t, 1)[0];
  }, "removeWhere"), Tn = class Tn {
    static {
      __name(this, "Tn");
    }
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(Tn, "IdleItem");
  var _n = Tn, Pn = class Pn {
    static {
      __name(this, "Pn");
    }
    constructor(e) {
      this.callback = e;
    }
  };
  a(Pn, "PendingItem");
  var Qe = Pn;
  function il() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  __name(il, "il");
  a(il, "throwOnDoubleRelease");
  function Dt(r, e) {
    if (e)
      return { callback: e, result: void 0 };
    let t, n, i = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(o), o;
    });
    return { callback: i, result: s };
  }
  __name(Dt, "Dt");
  a(Dt, "promisify");
  function sl(r, e) {
    return a(/* @__PURE__ */ __name(function t(n) {
      n.client = e, e.removeListener("error", t), e.on("error", () => {
        r.log(
          "additional client error after disconnection due to error",
          n
        );
      }), r._remove(e), r.emit("error", n, e);
    }, "t"), "idleListener");
  }
  __name(sl, "sl");
  a(sl, "makeIdleListener");
  var Rn = class Rn extends nl {
    static {
      __name(this, "Rn");
    }
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: e.password
      }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t || ot().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _isAboveMin() {
      return this._clients.length > this.options.min;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
          this._remove(t.client);
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(
          t.timeoutId
        );
        let n = t.client;
        n.ref && n.ref();
        let i = t.idleListener;
        return this._acquireClient(n, e, i, false);
      }
      if (!this._isFull()) return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = ro(
        this._idle,
        (n) => n.client === e
      );
      t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter(
        (n) => n !== e
      ), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i) : this.Promise.reject(i);
      }
      let t = Dt(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis) return this._pendingQueue.push(new Qe(t.callback)), n;
        let i = a((u, c, l) => {
          clearTimeout(o), t.callback(u, c, l);
        }, "queueCallback"), s = new Qe(i), o = setTimeout(() => {
          ro(
            this._pendingQueue,
            (u) => u.callback === i
          ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return o.unref && o.unref(), this._pendingQueue.push(s), n;
      }
      return this.newClient(new Qe(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(
        t
      );
      let n = sl(this, t);
      this.log("checking client timeout");
      let i, s = false;
      this.options.connectionTimeoutMillis && (i = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i && clearTimeout(i), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, void 0, to);
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(
                t,
                new Qe((l, f, y) => y()),
                n,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u.unref(), t.once("end", () => clearTimeout(u));
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i) {
      i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
        if (s) return e.release(s), t.callback(s, void 0, to);
        t.callback(void 0, e, e.release);
      }) : t.callback(void 0, e, e.release);
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i) => {
        n && il(), n = true, this._release(e, t, i);
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new _n(
        e,
        t,
        s
      )), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = Dt(this.Promise, e);
        return v(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = void 0);
      let i = Dt(this.Promise, n);
      return n = i.callback, this.connect((s, o) => {
        if (s) return n(s);
        let u = false, c = a((l) => {
          u || (u = true, o.release(l), n(l));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (l, f) => {
            if (this.log("query dispatched"), o.removeListener(
              "error",
              c
            ), !u) return u = true, o.release(l), l ? n(l) : n(void 0, f);
          });
        } catch (l) {
          return o.release(l), n(l);
        }
      }), i.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = Dt(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Rn, "Pool");
  var In = Rn;
  no.exports = In;
});
var so = {};
ie(so, { default: /* @__PURE__ */ __name(() => ol, "default") });
var ol;
var oo = G(() => {
  "use strict";
  p();
  ol = {};
});
var ao = T((lp, al) => {
  al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
    async: "2.6.4",
    bluebird: "3.5.2",
    co: "4.6.0",
    "pg-copy-streams": "0.3.0"
  }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var lo = T((fp, co) => {
  "use strict";
  p();
  var uo = ge().EventEmitter, ul = (it(), O(nt)), Bn = rt(), Ne = co.exports = function(r, e, t) {
    uo.call(this), r = Bn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  ul.inherits(Ne, uo);
  var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Ne.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e) for (var t in e) {
      var n = cl[t] || t;
      r[n] = e[t];
    }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  Ne.prototype.then = function(r, e) {
    return this._getPromise().then(
      r,
      e
    );
  };
  Ne.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  Ne.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once("error", e);
    }.bind(this)), this._promise);
  };
  Ne.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(function(s, o, u) {
      if (r.native.arrayMode = false, v(function() {
        e.emit("_done");
      }), s) return e.handleError(s);
      e._emitRowEvents && (u.length > 1 ? o.forEach(
        (c, l) => {
          c.forEach((f) => {
            e.emit("row", f, u[l]);
          });
        }
      ) : o.forEach(function(c) {
        e.emit("row", c, u);
      })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
    }, "after");
    if (m.domain && (t = m.domain.bind(t)), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(Bn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(this.name, this.text, n.length, function(s) {
        return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
      });
    } else if (this.values) {
      if (!Array.isArray(
        this.values
      )) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i = this.values.map(Bn.prepareValue);
      r.native.query(this.text, i, t);
    } else r.native.query(this.text, t);
  };
});
var yo = T((yp, po) => {
  "use strict";
  p();
  var ll = (oo(), O(so)), fl = At(), dp = ao(), fo = ge().EventEmitter, hl = (it(), O(nt)), pl = Rt(), ho = lo(), K = po.exports = function(r) {
    fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new pl(r);
    this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  K.Query = ho;
  hl.inherits(K, fo);
  K.prototype._errorAllQueries = function(r) {
    let e = a((t) => {
      m.nextTick(() => {
        t.native = this.native, t.handleError(r);
      });
    }, "enqueueError");
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  K.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t) return r(t);
      e.native.connect(n, function(i) {
        if (i) return e.native.end(), r(i);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  K.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise((e, t) => {
      this._connect((n) => {
        n ? t(n) : e();
      });
    });
  };
  K.prototype.query = function(r, e, t) {
    var n, i, s, o, u;
    if (r == null) throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
      let c, l;
      i = new this._Promise((f, y) => {
        c = f, l = y;
      }), n.callback = (f, y) => f ? l(f) : c(y);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error(
        "Query read timeout"
      );
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {
      };
      var l = this._queryQueue.indexOf(n);
      l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, l) => {
      clearTimeout(o), u(c, l);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client has encountered a connection error and is not queryable"));
    }), i);
  };
  K.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
    var t;
    return r || (t = new this._Promise(function(n, i) {
      r = a((s) => s ? i(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  K.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  K.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once("_done", function() {
        t._pulseQueryQueue();
      });
    }
  };
  K.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  K.prototype.ref = function() {
  };
  K.prototype.unref = function() {
  };
  K.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(
      r,
      e,
      t
    );
  };
  K.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var Ln = T((gp, mo) => {
  "use strict";
  p();
  mo.exports = yo();
});
var ot = T((vp, at) => {
  "use strict";
  p();
  var dl = eo(), yl = tt(), ml = En(), wl = io(), { DatabaseError: gl } = vn(), bl = a(
    (r) => {
      var e;
      return e = class extends wl {
        static {
          __name(this, "e");
        }
        constructor(n) {
          super(n, r);
        }
      }, a(e, "BoundPool"), e;
    },
    "poolFactory"
  ), Fn = a(
    function(r) {
      this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = Je(), this.DatabaseError = gl;
    },
    "PG"
  );
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? at.exports = new Fn(Ln()) : (at.exports = new Fn(dl), Object.defineProperty(at.exports, "native", {
    configurable: true,
    enumerable: false,
    get() {
      var r = null;
      try {
        r = new Fn(Ln());
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") throw e;
      }
      return Object.defineProperty(at.exports, "native", { value: r }), r;
    }
  }));
});
p();
p();
Fe();
Zt();
p();
var pa = Object.defineProperty;
var da = Object.defineProperties;
var ya = Object.getOwnPropertyDescriptors;
var bi = Object.getOwnPropertySymbols;
var ma = Object.prototype.hasOwnProperty;
var wa = Object.prototype.propertyIsEnumerable;
var vi = a(
  (r, e, t) => e in r ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t,
  "__defNormalProp"
);
var ga = a((r, e) => {
  for (var t in e || (e = {})) ma.call(e, t) && vi(r, t, e[t]);
  if (bi) for (var t of bi(e)) wa.call(e, t) && vi(r, t, e[t]);
  return r;
}, "__spreadValues");
var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
var va = 1008e3;
var xi = new Uint8Array(
  new Uint16Array([258]).buffer
)[0] === 2;
var xa = new TextDecoder();
var Jt = new TextEncoder();
var yt = Jt.encode("0123456789abcdef");
var mt = Jt.encode("0123456789ABCDEF");
var Sa = Jt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var Si = Sa.slice();
Si[62] = 45;
Si[63] = 95;
var He;
var wt;
function Ea(r, { alphabet: e, scratchArr: t } = {}) {
  if (!He) if (He = new Uint16Array(256), wt = new Uint16Array(256), xi) for (let C = 0; C < 256; C++) He[C] = yt[C & 15] << 8 | yt[C >>> 4], wt[C] = mt[C & 15] << 8 | mt[C >>> 4];
  else for (let C = 0; C < 256; C++) He[C] = yt[C & 15] | yt[C >>> 4] << 8, wt[C] = mt[C & 15] | mt[C >>> 4] << 8;
  r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
  let n = r.length, i = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(
    r.buffer,
    r.byteOffset,
    s
  ), c = new Uint32Array(o.buffer, o.byteOffset, i), l = e === "upper" ? wt : He, f = 0, y = 0, g;
  if (xi)
    for (; f < s; ) g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
  else for (; f < s; )
    g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
  for (f <<= 2; f < n; ) o[f] = l[r[f++]];
  return xa.decode(o.subarray(0, n));
}
__name(Ea, "Ea");
a(Ea, "_toHex");
function Aa(r, e = {}) {
  let t = "", n = r.length, i = va >>> 1, s = Math.ceil(n / i), o = new Uint16Array(s > 1 ? i : n);
  for (let u = 0; u < s; u++) {
    let c = u * i, l = c + i;
    t += Ea(r.subarray(c, l), ba(ga(
      {},
      e
    ), { scratchArr: o }));
  }
  return t;
}
__name(Aa, "Aa");
a(Aa, "_toHexChunked");
function Ei(r, e = {}) {
  return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
}
__name(Ei, "Ei");
a(Ei, "toHex");
p();
var gt = class gt2 {
  static {
    __name(this, "gt");
  }
  constructor(e, t) {
    this.strings = e;
    this.values = t;
  }
  toParameterizedQuery(e = { query: "", params: [] }) {
    let { strings: t, values: n } = this;
    for (let i = 0, s = t.length; i < s; i++) if (e.query += t[i], i < n.length) {
      let o = n[i];
      if (o instanceof Ge) e.query += o.sql;
      else if (o instanceof Ce) if (o.queryData instanceof gt2) o.queryData.toParameterizedQuery(
        e
      );
      else {
        if (o.queryData.params?.length) throw new Error("This query is not composable");
        e.query += o.queryData.query;
      }
      else {
        let { params: u } = e;
        u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
      }
    }
    return e;
  }
};
a(gt, "SqlTemplate");
var $e = gt;
var Xt = class Xt2 {
  static {
    __name(this, "Xt");
  }
  constructor(e) {
    this.sql = e;
  }
};
a(Xt, "UnsafeRawSql");
var Ge = Xt;
p();
function bt() {
  typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
}
__name(bt, "bt");
a(bt, "warnIfBrowser");
Fe();
var as = Se(At());
var us = Se(rt());
var _t = class _t2 extends Error {
  static {
    __name(this, "_t");
  }
  constructor(t) {
    super(t);
    E(this, "name", "NeonDbError");
    E(this, "severity");
    E(this, "code");
    E(this, "detail");
    E(this, "hint");
    E(this, "position");
    E(this, "internalPosition");
    E(
      this,
      "internalQuery"
    );
    E(this, "where");
    E(this, "schema");
    E(this, "table");
    E(this, "column");
    E(this, "dataType");
    E(this, "constraint");
    E(this, "file");
    E(this, "line");
    E(this, "routine");
    E(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
  }
};
a(
  _t,
  "NeonDbError"
);
var be = _t;
var is = "transaction() expects an array of queries, or a function returning an array of queries";
var Bu = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Lu(r) {
  return r instanceof d ? "\\x" + Ei(r) : r;
}
__name(Lu, "Lu");
a(Lu, "encodeBuffersAsBytea");
function ss(r) {
  let { query: e, params: t } = r instanceof $e ? r.toParameterizedQuery() : r;
  return { query: e, params: t.map((n) => Lu((0, us.prepareValue)(n))) };
}
__name(ss, "ss");
a(ss, "prepareQuery");
function cs(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i,
  readOnly: s,
  deferrable: o,
  authToken: u,
  disableWarningInBrowsers: c
} = {}) {
  if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l;
  try {
    l = Yt(r);
  } catch {
    throw new Error(
      "Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r)
    );
  }
  let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
  if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function D(P, ...I) {
    if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I))) throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
    return new Ce(
      Y,
      new $e(P, I)
    );
  }
  __name(D, "D");
  a(D, "templateFn"), D.query = (P, I, w) => new Ce(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ge(
    P
  ), D.transaction = async (P, I) => {
    if (typeof P == "function" && (P = P(D)), !Array.isArray(P)) throw new Error(is);
    P.forEach((W) => {
      if (!(W instanceof Ce)) throw new Error(is);
    });
    let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
    return Y(w, Z, I);
  };
  async function Y(P, I, w) {
    let { fetchEndpoint: Z, fetchFunction: W } = ce, J = Array.isArray(
      P
    ) ? { queries: P.map((ee) => ss(ee)) } : ss(P), X = n ?? {}, se = e ?? false, oe = t ?? false, B = i, j = s, le = o;
    w !== void 0 && (w.fetchOptions !== void 0 && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== void 0 && (se = w.arrayMode), w.fullResults !== void 0 && (oe = w.fullResults), w.isolationLevel !== void 0 && (B = w.isolationLevel), w.readOnly !== void 0 && (j = w.readOnly), w.deferrable !== void 0 && (le = w.deferrable)), I !== void 0 && !Array.isArray(I) && I.fetchOptions !== void 0 && (X = { ...X, ...I.fetchOptions });
    let de = u;
    !Array.isArray(I) && I?.authToken !== void 0 && (de = I.authToken);
    let We = typeof Z == "function" ? Z(g, A, { jwtAuth: de !== void 0 }) : Z, fe = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, _e = await Fu(de);
    _e && (fe.Authorization = `Bearer ${_e}`), Array.isArray(P) && (B !== void 0 && (fe["Neon-Batch-Isolation-Level"] = B), j !== void 0 && (fe["Neon-Batch-Read-Only"] = String(j)), le !== void 0 && (fe["Neon-Batch-Deferrable"] = String(le))), c || ce.disableWarningInBrowsers || bt();
    let ye;
    try {
      ye = await (W ?? fetch)(We, { method: "POST", body: JSON.stringify(J), headers: fe, ...X });
    } catch (ee) {
      let M = new be(
        `Error connecting to database: ${ee}`
      );
      throw M.sourceError = ee, M;
    }
    if (ye.ok) {
      let ee = await ye.json();
      if (Array.isArray(P)) {
        let M = ee.results;
        if (!Array.isArray(M)) throw new be("Neon internal error: unexpected result format");
        return M.map(($, me) => {
          let Ot = I[me] ?? {}, vo = Ot.arrayMode ?? se, xo = Ot.fullResults ?? oe;
          return os(
            $,
            { arrayMode: vo, fullResults: xo, types: Ot.types }
          );
        });
      } else {
        let M = I ?? {}, $ = M.arrayMode ?? se, me = M.fullResults ?? oe;
        return os(ee, { arrayMode: $, fullResults: me, types: M.types });
      }
    } else {
      let { status: ee } = ye;
      if (ee === 400) {
        let M = await ye.json(), $ = new be(M.message);
        for (let me of Bu) $[me] = M[me] ?? void 0;
        throw $;
      } else {
        let M = await ye.text();
        throw new be(
          `Server error (HTTP status ${ee}): ${M}`
        );
      }
    }
  }
  __name(Y, "Y");
  return a(Y, "execute"), D;
}
__name(cs, "cs");
a(cs, "neon");
var dr = class dr2 {
  static {
    __name(this, "dr");
  }
  constructor(e, t, n) {
    this.execute = e;
    this.queryData = t;
    this.opts = n;
  }
  then(e, t) {
    return this.execute(this.queryData, this.opts).then(e, t);
  }
  catch(e) {
    return this.execute(this.queryData, this.opts).catch(e);
  }
  finally(e) {
    return this.execute(
      this.queryData,
      this.opts
    ).finally(e);
  }
};
a(dr, "NeonQueryPromise");
var Ce = dr;
function os(r, {
  arrayMode: e,
  fullResults: t,
  types: n
}) {
  let i = new as.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i.getTypeParser(
    c.dataTypeID
  )), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(
    c.map((l, f) => [s[f], l === null ? null : o[f](l)])
  ));
  return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i, r) : u;
}
__name(os, "os");
a(os, "processQueryResult");
async function Fu(r) {
  if (typeof r == "string") return r;
  if (typeof r == "function") try {
    return await Promise.resolve(r());
  } catch (e) {
    let t = new be("Error getting auth token.");
    throw e instanceof Error && (t = new be(`Error getting auth token: ${e.message}`)), t;
  }
}
__name(Fu, "Fu");
a(Fu, "getAuthToken");
p();
var go = Se(ot());
p();
var wo = Se(ot());
var kn = class kn2 extends wo.Client {
  static {
    __name(this, "kn");
  }
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i = typeof this.config != "string" && this.config?.host !== void 0 || typeof this.config != "string" && this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
    if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect) return o;
    let l = this.connection;
    if (u && l.on(
      "connect",
      () => l.stream.emit("data", "S")
    ), c) {
      l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
      let f = this.ssl ? "sslconnect" : "connect";
      l.on(f, () => {
        this.neonConfig.disableWarningInBrowsers || bt(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    if (typeof crypto > "u" || crypto.subtle === void 0 || crypto.subtle.importKey === void 0) throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
    let n = crypto.subtle, i = this.saslSession, s = this.password, o = t.data;
    if (i.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string") throw new Error(
      "SASL: protocol error"
    );
    let u = Object.fromEntries(o.split(",").map((M) => {
      if (!/^.=/.test(M)) throw new Error(
        "SASL: Invalid attribute pair entry"
      );
      let $ = M[0], me = M.substring(2);
      return [$, me];
    })), c = u.r, l = u.s, f = u.i;
    if (!c || !/^[!-+--~]+$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64"
    );
    if (!f || !/^[1-9][0-9]*$/.test(f)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count"
    );
    if (!c.startsWith(i.clientNonce))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    if (c.length === i.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder(), C = A.encode(s), D = await n.importKey(
      "raw",
      C,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), Y = new Uint8Array(await n.sign("HMAC", D, d.concat(
      [g, d.from([0, 0, 0, 1])]
    ))), P = Y;
    for (var I = 0; I < y - 1; I++) Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(
      P.map((M, $) => P[$] ^ Y[$])
    );
    let w = P, Z = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest(
      "SHA-256",
      W
    ), X = "n=*,r=" + i.clientNonce, se = "r=" + c + ",s=" + l + ",i=" + y, oe = "c=biws,r=" + c, B = X + "," + se + "," + oe, j = await n.importKey(
      "raw",
      J,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var le = new Uint8Array(await n.sign(
      "HMAC",
      j,
      A.encode(B)
    )), de = d.from(W.map((M, $) => W[$] ^ le[$])), We = de.toString("base64");
    let fe = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), _e = await n.sign("HMAC", fe, A.encode("Server Key")), ye = await n.importKey("raw", _e, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var ee = d.from(
      await n.sign("HMAC", ye, A.encode(B))
    );
    i.message = "SASLResponse", i.serverSignature = ee.toString("base64"), i.response = oe + ",p=" + We, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(
  kn,
  "NeonClient"
);
var ut = kn;
Fe();
var bo = Se(Rt());
function vl(r, e) {
  if (e) return { callback: e, result: void 0 };
  let t, n, i = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i, result: s };
}
__name(vl, "vl");
a(vl, "promisify");
var Un = class Un2 extends go.Pool {
  static {
    __name(this, "Un");
  }
  constructor() {
    super(...arguments);
    E(this, "Client", ut);
    E(this, "hasFetchUnsupportedListeners", false);
    E(this, "addListener", this.on);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i) {
    if (!ce.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function") return super.query(
      t,
      n,
      i
    );
    typeof n == "function" && (i = n, n = void 0);
    let s = vl(this.Promise, i);
    i = s.callback;
    try {
      let o = new bo.default(
        this.options
      ), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
      cs(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i(void 0, A)).catch((A) => i(
        A
      ));
    } catch (o) {
      i(o);
    }
    return s.result;
  }
};
a(Un, "NeonPool");
var Mn = Un;
Fe();
var ct = Se(ot());
var export_DatabaseError = ct.DatabaseError;
var export_defaults = ct.defaults;
var export_escapeIdentifier = ct.escapeIdentifier;
var export_escapeLiteral = ct.escapeLiteral;
var export_types = ct.types;

// src/db.ts
async function notify(client, userId, title2, body, eventType) {
  await client.query(
    "INSERT INTO notifications (user_id, title, body, channel, event_type) VALUES ($1, $2, $3, 'IN_APP', $4)",
    [userId, title2, body, eventType]
  );
}
__name(notify, "notify");
async function withTenant(env2, tenantId, callback) {
  const schema = `tenant_${tenantId}`;
  const pool = new Mn({ connectionString: env2.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(`SET search_path = "${schema}", public`);
    return await callback(client);
  } finally {
    client.release();
    await pool.end();
  }
}
__name(withTenant, "withTenant");

// src/routes/auth.ts
var loginSchema = external_exports.object({
  email: external_exports.string().email(),
  password: external_exports.string().min(6)
});
var registerSchema = external_exports.object({
  email: external_exports.string().email(),
  password: external_exports.string().min(6),
  name: external_exports.string().min(2)
});
var authRoutes = new Hono2();
authRoutes.use("*", optionalAuth);
authRoutes.post("/auth/login", async (c) => {
  const tenantId = c.get("tenantId");
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const { email, password } = parsed.data;
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "SELECT id, email, password_hash, name, tier, kyc_status, avatar_url, currency FROM users WHERE email = $1",
      [email]
    );
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const valid = await verify(password, result.password_hash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const token = await createToken(result.id, result.email, result.tier, c.env.JWT_SECRET);
  return c.json({
    token,
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
      tier: result.tier,
      kycStatus: result.kyc_status,
      avatarUrl: result.avatar_url,
      currency: result.currency
    }
  });
});
authRoutes.post("/auth/register", async (c) => {
  const tenantId = c.get("tenantId");
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const { email, password, name } = parsed.data;
  const passwordHash = await hash(password);
  try {
    const result = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, name, tier, kyc_status, currency)
         VALUES ($1, $2, $3, 'REGULAR', 'NONE', 'THB')
         RETURNING id, email, name, tier, kyc_status, avatar_url, currency`,
        [email, passwordHash, name]
      );
      return rows[0];
    });
    const token = await createToken(result.id, result.email, result.tier, c.env.JWT_SECRET);
    return c.json({
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        tier: result.tier,
        kycStatus: result.kyc_status,
        avatarUrl: result.avatar_url,
        currency: result.currency
      }
    }, 201);
  } catch (err) {
    if (err.code === "23505") {
      return c.json({ error: "Email already exists" }, 409);
    }
    console.error("Register error:", err);
    return c.json({ error: "Registration failed" }, 500);
  }
});
authRoutes.patch("/auth/preferences", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const updates = ["updated_at = NOW()"];
  const values = [];
  let paramIndex = 1;
  if (typeof body.currency === "string" && body.currency.length <= 8) {
    updates.push(`currency = $${paramIndex}`);
    values.push(body.currency);
    paramIndex++;
  }
  if (body.notifications && typeof body.notifications === "object") {
    const n = body.notifications;
    updates.push(`notifications = $${paramIndex}::jsonb`);
    values.push(JSON.stringify({
      push: !!n.push,
      email: !!n.email,
      line: !!n.line,
      sms: !!n.sms
    }));
    paramIndex++;
  }
  if (typeof body.preferredGrader === "string" || body.preferredGrader === null) {
    updates.push(`preferred_grader = $${paramIndex}`);
    values.push(body.preferredGrader);
    paramIndex++;
  }
  if (typeof body.preferredPreGrader === "string" || body.preferredPreGrader === null) {
    updates.push(`preferred_pre_grader = $${paramIndex}`);
    values.push(body.preferredPreGrader);
    paramIndex++;
  }
  if (values.length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }
  values.push(userId);
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, email, name, tier, kyc_status, avatar_url, currency, preferred_grader, preferred_pre_grader, notifications, created_at, updated_at`,
      values
    );
    return rows[0];
  });
  return c.json({
    id: result.id,
    email: result.email,
    name: result.name,
    tier: result.tier,
    kycStatus: result.kyc_status,
    avatarUrl: result.avatar_url,
    currency: result.currency,
    preferredGrader: result.preferred_grader,
    preferredPreGrader: result.preferred_pre_grader,
    notifications: result.notifications,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  });
});
authRoutes.post("/auth/change-password", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const parsed = external_exports.object({
    currentPassword: external_exports.string().min(1),
    newPassword: external_exports.string().min(6)
  }).safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: "User not found" }, 404);
  }
  const valid = await verify(parsed.data.currentPassword, result.password_hash);
  if (!valid) {
    return c.json({ error: "Current password is incorrect" }, 401);
  }
  const newHash = await hash(parsed.data.newPassword);
  await withTenant(c.env, tenantId, async (client) => {
    await client.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [newHash, userId]);
  });
  return c.json({ status: "password_changed" });
});
authRoutes.delete("/auth/account", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: "User not found" }, 404);
  }
  const valid = await verify(password, result.password_hash);
  if (!valid) {
    return c.json({ error: "Password is incorrect" }, 401);
  }
  await withTenant(c.env, tenantId, async (client) => {
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
  });
  return c.json({ status: "account_deleted" });
});
authRoutes.get("/auth/user", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "SELECT id, email, name, tier, kyc_status, avatar_url, currency, preferred_grader, preferred_pre_grader, notifications, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({
    id: result.id,
    email: result.email,
    name: result.name,
    tier: result.tier,
    kycStatus: result.kyc_status,
    avatarUrl: result.avatar_url,
    currency: result.currency,
    preferredGrader: result.preferred_grader,
    preferredPreGrader: result.preferred_pre_grader,
    notifications: result.notifications,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  });
});

// src/routes/vault.ts
var vaultItemSchema = external_exports.object({
  sku: external_exports.string().min(1),
  name: external_exports.string().min(1),
  status: external_exports.enum(["AVAILABLE", "VAULT_HELD", "LOCKED", "IN_TRANSIT", "REDEEMING", "SUSPENDED"]).default("AVAILABLE"),
  description: external_exports.string().optional(),
  category: external_exports.string().optional(),
  subCategory: external_exports.string().optional(),
  itemFormat: external_exports.string().optional(),
  condition: external_exports.string().optional(),
  imageUrl: external_exports.string().optional(),
  images: external_exports.array(external_exports.string()).max(10).optional(),
  paidPrice: external_exports.number().int().min(0).optional(),
  currentPrice: external_exports.number().int().min(0).optional(),
  dateAcquired: external_exports.string().optional(),
  source: external_exports.string().optional(),
  // Frontend sends pricing/acquisition info nested under metadata
  metadata: external_exports.object({
    paidPrice: external_exports.number().int().min(0).optional(),
    currentPrice: external_exports.number().int().min(0).optional(),
    dateAcquired: external_exports.string().optional(),
    source: external_exports.string().optional(),
    images: external_exports.array(external_exports.string()).max(10).optional()
  }).passthrough().optional()
});
var vaultRoutes = new Hono2();
vaultRoutes.use("*", authMiddleware);
vaultRoutes.get("/items", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const ownerId = c.req.query("ownerId") || userId;
  const status = c.req.query("status");
  if (!ownerId) {
    return c.json({ error: "ownerId required" }, 400);
  }
  const items = await withTenant(c.env, tenantId, async (client) => {
    const params = [ownerId];
    let sql = `
      SELECT v.*, v.card_id, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
             c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition,
             so.status as service_order_status, so.order_no as service_order_no
      FROM vault_items v
      LEFT JOIN cards c ON v.card_id = c.id
      LEFT JOIN service_orders so ON v.service_order_id = so.id
      WHERE v.owner_id = $1
    `;
    if (status) {
      sql += ` AND v.status = $2`;
      params.push(status);
    }
    sql += ` ORDER BY v.created_at DESC`;
    const { rows } = await client.query(sql, params);
    return rows;
  });
  return c.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      ownerId: item.owner_id,
      holderId: item.holder_id,
      status: item.status,
      description: item.description,
      category: item.category,
      subCategory: item.sub_category,
      itemFormat: item.item_format,
      condition: item.condition,
      imageUrl: item.image_url,
      metadata: {
        paidPrice: item.paid_price,
        dateAcquired: item.date_acquired,
        source: item.source,
        images: item.metadata?.images ?? []
      },
      serviceOrderId: item.service_order_id ?? void 0,
      serviceOrderStatus: item.service_order_status ?? void 0,
      serviceOrderNo: item.service_order_no ?? void 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      card: item.card_code ? {
        id: item.card_id,
        code: item.card_code,
        nameEn: item.card_name_en,
        nameJp: item.card_name_jp,
        rarity: item.rarity,
        type: item.type,
        language: item.language,
        game: item.game,
        imageUrl: item.card_image_url,
        condition: item.card_condition
      } : null
    }))
  });
});
vaultRoutes.get("/items/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const itemId = c.req.param("id");
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT v.*, v.card_id, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
              c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition,
              so.status as service_order_status, so.order_no as service_order_no
       FROM vault_items v
       LEFT JOIN cards c ON v.card_id = c.id
       LEFT JOIN service_orders so ON v.service_order_id = so.id
       WHERE v.id = $1`,
      [itemId]
    );
    return rows;
  });
  const item = items[0];
  if (!item) {
    return c.json({ error: "Item not found" }, 404);
  }
  return c.json({
    id: item.id,
    name: item.name,
    sku: item.sku,
    ownerId: item.owner_id,
    holderId: item.holder_id,
    status: item.status,
    description: item.description,
    category: item.category,
    subCategory: item.sub_category,
    itemFormat: item.item_format,
    condition: item.condition,
    imageUrl: item.image_url,
    metadata: {
      paidPrice: item.paid_price,
      dateAcquired: item.date_acquired,
      source: item.source,
      images: item.metadata?.images ?? []
    },
    serviceOrderId: item.service_order_id ?? void 0,
    serviceOrderStatus: item.service_order_status ?? void 0,
    serviceOrderNo: item.service_order_no ?? void 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    card: item.card_code ? {
      id: item.card_id,
      code: item.card_code,
      nameEn: item.card_name_en,
      nameJp: item.card_name_jp,
      rarity: item.rarity,
      type: item.type,
      language: item.language,
      game: item.game,
      imageUrl: item.card_image_url,
      condition: item.card_condition
    } : null
  });
});
vaultRoutes.post("/items", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const parsed = vaultItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const paidPrice = data.paidPrice ?? data.metadata?.paidPrice ?? 0;
  const currentPrice = data.currentPrice ?? data.metadata?.currentPrice ?? paidPrice;
  const dateAcquired = data.dateAcquired ?? data.metadata?.dateAcquired;
  const source = data.source ?? data.metadata?.source;
  const images = data.images ?? data.metadata?.images ?? [];
  const imageUrl = images[0] ?? data.imageUrl ?? null;
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows: cardRows } = await client.query("SELECT id FROM cards WHERE code = $1", [data.sku]);
    const cardId = cardRows[0]?.id || null;
    const { rows } = await client.query(
      `INSERT INTO vault_items (owner_id, holder_id, card_id, sku, name, status, description, category, sub_category, item_format, condition, image_url, paid_price, current_price, date_acquired, source, metadata)
       VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [userId, cardId, data.sku, data.name, data.status, data.description, data.category, data.subCategory, data.itemFormat, data.condition, imageUrl, paidPrice, currentPrice, dateAcquired, source, JSON.stringify({ images })]
    );
    return rows;
  });
  const item = items[0];
  return c.json({ id: item.id, message: "Item registered" }, 201);
});
vaultRoutes.patch("/items/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const itemId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const fieldMap = {
    name: "name",
    sku: "sku",
    status: "status",
    category: "category",
    subCategory: "sub_category",
    itemFormat: "item_format",
    condition: "condition",
    description: "description",
    imageUrl: "image_url",
    paidPrice: "paid_price",
    currentPrice: "current_price",
    dateAcquired: "date_acquired",
    source: "source"
  };
  const updates = [];
  const values = [];
  let paramIndex = 1;
  for (const [field, column] of Object.entries(fieldMap)) {
    if (body[field] !== void 0) {
      updates.push(`${column} = $${paramIndex}`);
      values.push(body[field]);
      paramIndex++;
    }
  }
  if (Array.isArray(body.images)) {
    const images = body.images.slice(0, 10);
    updates.push(`image_url = $${paramIndex}`);
    values.push(images[0] ?? null);
    paramIndex++;
    updates.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${paramIndex}::jsonb`);
    values.push(JSON.stringify({ images }));
    paramIndex++;
  }
  if (updates.length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }
  values.push(itemId);
  values.push(userId);
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE vault_items SET ${updates.join(", ")} WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return rows;
  });
  const result = items[0];
  if (!result) {
    return c.json({ error: "Item not found or not owned by user" }, 404);
  }
  return c.json({ id: result.id, message: "Item updated" });
});
vaultRoutes.delete("/items/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const itemId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "DELETE FROM vault_items WHERE id = $1 AND owner_id = $2 RETURNING id",
      [itemId, userId]
    );
    return rows;
  });
  if (!items.length) {
    return c.json({ error: "Item not found or not owned by user" }, 404);
  }
  return c.json({ message: "Item deleted" });
});
vaultRoutes.post("/items/:id/redemptions", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const itemId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const { shippingAddress } = body;
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      "SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2",
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error("Item not found or not owned by user");
    }
    const { rows } = await client.query(
      `INSERT INTO redemptions (item_id, user_id, shipping_address, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [itemId, userId, shippingAddress ? JSON.stringify(shippingAddress) : null]
    );
    await client.query("UPDATE vault_items SET status = 'REDEEMING' WHERE id = $1", [itemId]);
    return rows[0];
  });
  return c.json({
    redemptionId: result.id,
    itemId: result.item_id,
    userId: result.user_id,
    status: result.status,
    shippingAddress: result.shipping_address,
    createdAt: result.created_at
  }, 201);
});
vaultRoutes.post("/items/:id/vault-deliveries", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const itemId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const { shippingAddress } = body;
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      "SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2",
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error("Item not found or not owned by user");
    }
    const { rows } = await client.query(
      `INSERT INTO vault_deliveries (item_id, user_id, shipping_address, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [itemId, userId, shippingAddress ? JSON.stringify(shippingAddress) : null]
    );
    await client.query("UPDATE vault_items SET status = 'IN_TRANSIT' WHERE id = $1", [itemId]);
    return rows[0];
  });
  return c.json({
    deliveryId: result.id,
    itemId: result.item_id,
    userId: result.user_id,
    status: result.status,
    shippingAddress: result.shipping_address,
    createdAt: result.created_at
  }, 201);
});
vaultRoutes.post("/items/:id/consign", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const itemId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      "SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2",
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error("Item not found or not owned by user");
    }
    const { rows } = await client.query(
      "UPDATE vault_items SET status = 'VAULT_HELD' WHERE id = $1 AND owner_id = $2 RETURNING *",
      [itemId, userId]
    );
    return rows[0];
  });
  return c.json({
    itemId: result.id,
    status: result.status,
    message: "Item consigned to platform vault"
  });
});

// src/routes/market.ts
var listingSchema = external_exports.object({
  itemId: external_exports.string().uuid().optional(),
  title: external_exports.string().min(1),
  description: external_exports.string().optional(),
  price: external_exports.number().int().min(0),
  currency: external_exports.string().default("THB"),
  category: external_exports.string().optional(),
  itemFormat: external_exports.enum(["SALE", "TRADE"]).default("SALE"),
  condition: external_exports.string().optional(),
  imageUrl: external_exports.string().optional()
});
var marketRoutes = new Hono2();
marketRoutes.use("*", optionalAuth);
var LISTING_SELECT = `
  SELECT l.*, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
         c.rarity, c.type as card_type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition,
         COALESCE(l.image_url, v.image_url) as resolved_image_url,
         COALESCE(l.condition, v.condition) as resolved_condition
  FROM listings l
  LEFT JOIN vault_items v ON l.item_id = v.id
  LEFT JOIN cards c ON v.card_id = c.id`;
var mapListingRow = /* @__PURE__ */ __name((l) => ({
  listingId: l.listing_id,
  itemId: l.item_id,
  sellerId: l.seller_id,
  title: l.title,
  description: l.description,
  price: l.price,
  currency: l.currency,
  status: l.status,
  category: l.category,
  subCategory: l.sub_category,
  itemFormat: l.item_format,
  condition: l.resolved_condition ?? void 0,
  imageUrl: l.resolved_image_url ?? void 0,
  sellerDisplayName: l.seller_display_name,
  sellerAvatarUrl: l.seller_avatar_url,
  sellerBio: l.seller_bio,
  sellerTier: l.seller_tier,
  ownerId: l.owner_id,
  holderId: l.holder_id,
  views: l.views,
  watchers: l.watchers,
  isFeatured: l.is_featured,
  createdAt: l.created_at,
  cardCode: l.card_code ?? void 0,
  cardNameEn: l.card_name_en ?? void 0,
  cardNameJp: l.card_name_jp ?? void 0,
  rarity: l.rarity ?? void 0,
  cardType: l.card_type ?? void 0,
  language: l.language ?? void 0,
  game: l.game ?? void 0,
  cardImageUrl: l.card_image_url ?? void 0,
  cardCondition: l.card_condition ?? void 0
}), "mapListingRow");
marketRoutes.get("/listings", async (c) => {
  const tenantId = c.get("tenantId");
  const statusParam = c.req.query("status") || "ACTIVE";
  const statusFilter = statusParam.toUpperCase() === "ALL" ? null : statusParam;
  const category = c.req.query("category");
  const minPrice = c.req.query("minPrice") ?? c.req.query("min_price");
  const maxPrice = c.req.query("maxPrice") ?? c.req.query("max_price");
  const sellerId = c.req.query("sellerId");
  const q = c.req.query("q");
  const sort = c.req.query("sort");
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
  const page = parseInt(c.req.query("page") || "0");
  const offset = parseInt(c.req.query("offset") || "0") || (page > 0 ? (page - 1) * limit : 0);
  const orderBy = sort === "price_asc" || sort === "price-asc" ? "l.price ASC NULLS LAST" : sort === "price_desc" || sort === "price-desc" ? "l.price DESC NULLS LAST" : "l.created_at DESC";
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const params = [];
    let sql = `${LISTING_SELECT} WHERE 1=1`;
    let paramIndex = 1;
    if (statusFilter) {
      sql += ` AND l.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }
    if (category) {
      sql += ` AND l.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (minPrice) {
      sql += ` AND l.price >= $${paramIndex}`;
      params.push(parseInt(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      sql += ` AND l.price <= $${paramIndex}`;
      params.push(parseInt(maxPrice));
      paramIndex++;
    }
    if (sellerId) {
      sql += ` AND l.seller_id = $${paramIndex}`;
      params.push(sellerId);
      paramIndex++;
    }
    if (q) {
      sql += ` AND (l.title ILIKE $${paramIndex} OR c.code ILIKE $${paramIndex} OR c.name_en ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    sql += ` ORDER BY ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    const { rows } = await client.query(sql, params);
    return rows;
  });
  return c.json({
    listings: listings.map(mapListingRow)
  });
});
marketRoutes.get("/listings/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const listingId = c.req.param("id");
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${LISTING_SELECT} WHERE l.listing_id = $1`,
      [listingId]
    );
    return rows;
  });
  const listing = listings[0];
  if (!listing) {
    return c.json({ error: "Listing not found" }, 404);
  }
  return c.json(mapListingRow(listing));
});
marketRoutes.post("/listings", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  let itemImageUrl = null;
  let itemCondition = null;
  if (data.itemId) {
    const items = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        "SELECT id, status, image_url, condition FROM vault_items WHERE id = $1 AND owner_id = $2",
        [data.itemId, userId]
      );
      return rows;
    });
    if (!items.length) {
      return c.json({ error: "Vault item not found or not owned by user" }, 404);
    }
    itemImageUrl = items[0].image_url ?? null;
    itemCondition = items[0].condition ?? null;
    await withTenant(c.env, tenantId, async (client) => {
      await client.query("UPDATE vault_items SET status = 'LISTING' WHERE id = $1", [data.itemId]);
    });
  }
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows: userRows } = await client.query("SELECT name, tier FROM users WHERE id = $1", [userId]);
    const user = userRows[0];
    const { rows } = await client.query(
      `INSERT INTO listings (item_id, seller_id, title, description, price, currency, status, category, item_format, condition, image_url, seller_display_name, seller_tier, owner_id, holder_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [data.itemId || null, userId, data.title, data.description || null, data.price, data.currency, data.category || null, data.itemFormat || null, data.condition || itemCondition, data.imageUrl || itemImageUrl, user?.name || null, user?.tier || null, userId, userId]
    );
    return rows;
  });
  const listing = listings[0];
  return c.json({ listingId: listing.listing_id, message: "Listing created" }, 201);
});
marketRoutes.patch("/listings/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const listingId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const allowedUpdates = ["status", "price", "title", "description", "image_url", "is_featured"];
  const updates = [];
  const values = [];
  let paramIndex = 1;
  for (const key of allowedUpdates) {
    if (body[key] !== void 0) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(body[key]);
      paramIndex++;
    }
  }
  if (updates.length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }
  values.push(listingId);
  values.push(userId);
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE listings SET ${updates.join(", ")} WHERE listing_id = $${paramIndex} AND seller_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return rows;
  });
  const result = listings[0];
  if (!result) {
    return c.json({ error: "Listing not found or not owned by user" }, 404);
  }
  if (body.status === "INACTIVE" || body.status === "SOLD" || body.status === "DELISTED") {
    if (result.item_id) {
      await withTenant(c.env, tenantId, async (client) => {
        await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [result.item_id]);
      });
    }
  }
  return c.json({ listingId: result.listing_id, message: "Listing updated" });
});
marketRoutes.post("/listings/:id/activate", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const listingId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1 AND seller_id = $2 RETURNING *",
      [listingId, userId]
    );
    return rows;
  });
  const result = listings[0];
  if (!result) {
    return c.json({ error: "Listing not found or not owned by user" }, 404);
  }
  return c.json({ listingId: result.listing_id, status: "ACTIVE" });
});
marketRoutes.delete("/listings/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const listingId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "SELECT item_id FROM listings WHERE listing_id = $1 AND seller_id = $2",
      [listingId, userId]
    );
    const itemId = rows[0]?.item_id;
    const { rows: deleted } = await client.query(
      "DELETE FROM listings WHERE listing_id = $1 AND seller_id = $2 RETURNING listing_id",
      [listingId, userId]
    );
    if (itemId && deleted.length) {
      await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [itemId]);
    }
    return deleted;
  });
  if (!listings.length) {
    return c.json({ error: "Listing not found or not owned by user" }, 404);
  }
  return c.json({ message: "Listing deleted" });
});

// src/routes/orders.ts
var orderSchema = external_exports.object({
  listingId: external_exports.string().uuid(),
  itemId: external_exports.string().uuid().optional(),
  price: external_exports.number().int().min(0),
  deliveryPreference: external_exports.enum(["SHIP", "VAULT_STORE"]).default("SHIP"),
  shippingAddress: external_exports.object({
    name: external_exports.string(),
    address: external_exports.string(),
    province: external_exports.string(),
    postalCode: external_exports.string(),
    phone: external_exports.string(),
    district: external_exports.string().optional()
  }).optional()
});
var orderRoutes = new Hono2();
orderRoutes.use("*", authMiddleware);
orderRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const role = c.req.query("role");
  const status = c.req.query("status");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const orders = await withTenant(c.env, tenantId, async (client) => {
    let sql = `
      SELECT o.*, 
             l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
             l.image_url as listing_image_url, l.condition as listing_condition,
             l.seller_display_name, l.seller_id as listing_seller_id,
             c.code as card_code, c.name_en as card_name_en,
             v.name as item_name, v.image_url as item_image_url, v.sku as item_sku
      FROM orders o
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN vault_items v ON o.item_id = v.id
      LEFT JOIN cards c ON v.card_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (role === "buyer") {
      sql += ` AND o.buyer_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (role === "seller") {
      sql += ` AND o.seller_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ` AND (o.buyer_id = $${paramIndex} OR o.seller_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }
    if (status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    sql += ` ORDER BY o.created_at DESC`;
    const { rows } = await client.query(sql, params);
    return rows;
  });
  return c.json({
    orders: orders.map((o) => ({
      id: o.id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      listingId: o.listing_id,
      itemId: o.item_id,
      price: o.price,
      status: o.status,
      deliveryPreference: o.delivery_preference,
      shippingAddress: o.shipping_address,
      lockedAt: o.locked_at,
      paidAt: o.paid_at,
      completedAt: o.completed_at,
      cancelledAt: o.cancelled_at,
      cancelReason: o.cancel_reason,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      cardCode: o.card_code ?? void 0,
      cardNameEn: o.card_name_en ?? void 0,
      itemName: o.item_name ?? void 0,
      itemImageUrl: o.item_image_url ?? void 0,
      itemSku: o.item_sku ?? void 0,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        condition: o.listing_condition,
        sellerDisplayName: o.seller_display_name,
        sellerId: o.listing_seller_id
      } : null
    }))
  });
});
orderRoutes.get("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const orderId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.condition as listing_condition,
              l.seller_display_name, l.seller_id as listing_seller_id,
              c.code as card_code, c.name_en as card_name_en,
              v.name as item_name, v.image_url as item_image_url, v.sku as item_sku
       FROM orders o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN vault_items v ON o.item_id = v.id
       LEFT JOIN cards c ON v.card_id = c.id
       WHERE o.id = $1 AND (o.buyer_id = $2 OR o.seller_id = $2)`,
      [orderId, userId]
    );
    return rows;
  });
  const order = orders[0];
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  return c.json({
    id: order.id,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    listingId: order.listing_id,
    itemId: order.item_id,
    price: order.price,
    status: order.status,
    deliveryPreference: order.delivery_preference,
    shippingAddress: order.shipping_address,
    lockedAt: order.locked_at,
    paidAt: order.paid_at,
    completedAt: order.completed_at,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    cardCode: order.card_code ?? void 0,
    cardNameEn: order.card_name_en ?? void 0,
    itemName: order.item_name ?? void 0,
    itemImageUrl: order.item_image_url ?? void 0,
    itemSku: order.item_sku ?? void 0,
    listing: order.listing_title ? {
      listingId: order.listing_id,
      title: order.listing_title,
      price: order.listing_price,
      currency: order.listing_currency,
      imageUrl: order.listing_image_url,
      condition: order.listing_condition,
      sellerDisplayName: order.seller_display_name,
      sellerId: order.listing_seller_id
    } : null
  });
});
orderRoutes.post("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: listingRows } = await client.query(
      "SELECT * FROM listings WHERE listing_id = $1 AND status = $2",
      [data.listingId, "ACTIVE"]
    );
    const listing = listingRows[0];
    if (!listing) {
      throw new Error("Listing not found or not active");
    }
    if (listing.seller_id === userId) {
      throw new Error("Cannot buy your own listing");
    }
    if (listing.item_id) {
      await client.query("UPDATE vault_items SET status = 'LOCKED' WHERE id = $1", [listing.item_id]);
    }
    await client.query("UPDATE listings SET status = 'INACTIVE' WHERE listing_id = $1", [data.listingId]);
    const { rows } = await client.query(
      `INSERT INTO orders (buyer_id, seller_id, listing_id, item_id, price, status, delivery_preference, shipping_address, locked_at)
       VALUES ($1, $2, $3, $4, $5, 'CREATED', $6, $7, NOW())
       RETURNING *`,
      [userId, listing.seller_id, data.listingId, listing.item_id || data.itemId, data.price, data.deliveryPreference, data.shippingAddress ? JSON.stringify(data.shippingAddress) : null]
    );
    await notify(
      client,
      listing.seller_id,
      "New order",
      `"${listing.title}" sold for \u0E3F${data.price.toLocaleString()}`,
      "ORDER_CREATED"
    );
    return rows;
  });
  const order = orders[0];
  return c.json({
    id: order.id,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    listingId: order.listing_id,
    itemId: order.item_id,
    price: order.price,
    status: order.status,
    deliveryPreference: order.delivery_preference,
    createdAt: order.created_at
  }, 201);
});
orderRoutes.patch("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const orderId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const { status } = body;
  if (!status) {
    return c.json({ error: "Status is required" }, 400);
  }
  const validTransitions = {
    "CREATED": ["PAYMENT_PENDING", "CANCELLED"],
    "PAYMENT_PENDING": ["PAYMENT_CONFIRMED", "CANCELLED"],
    "PAYMENT_CONFIRMED": ["SHIPPING_ARRANGED", "CANCELLED"],
    "SHIPPING_ARRANGED": ["COMPLETED", "CANCELLED"]
  };
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      "SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
      [orderId, userId]
    );
    const current = currentRows[0];
    if (!current) {
      throw new Error("Order not found");
    }
    const allowed = validTransitions[current.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status transition from ${current.status} to ${status}`);
    }
    const updates = ["status = $1"];
    const values = [status];
    let paramIndex = 2;
    if (status === "PAYMENT_CONFIRMED") {
      updates.push(`paid_at = NOW()`);
    }
    if (status === "SHIPPING_ARRANGED") {
      updates.push(`paid_at = COALESCE(paid_at, NOW())`);
    }
    if (status === "COMPLETED") {
      updates.push(`completed_at = NOW()`);
      if (current.item_id) {
        await client.query(
          "UPDATE vault_items SET owner_id = $1, holder_id = $1, status = $2 WHERE id = $3",
          [current.buyer_id, "AVAILABLE", current.item_id]
        );
      }
      if (current.item_id) {
        const { rows: itemRows } = await client.query("SELECT sku FROM vault_items WHERE id = $1", [current.item_id]);
        if (itemRows[0]?.sku) {
          await client.query(
            "INSERT INTO price_history (sku, price, traded_at) VALUES ($1, $2, NOW())",
            [itemRows[0].sku, current.price]
          );
        }
      }
    }
    if (status === "CANCELLED") {
      updates.push(`cancelled_at = NOW()`);
      if (body.cancelReason) {
        updates.push(`cancel_reason = $${paramIndex}`);
        values.push(body.cancelReason);
        paramIndex++;
      }
      if (current.item_id) {
        await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [current.item_id]);
      }
      await client.query("UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1", [current.listing_id]);
    }
    values.push(orderId);
    const { rows } = await client.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    const statusLabels = {
      PAYMENT_PENDING: "pending payment",
      PAYMENT_CONFIRMED: "payment confirmed",
      SHIPPING_ARRANGED: "shipping arranged",
      COMPLETED: "completed \u2014 the card is now in your vault",
      CANCELLED: "cancelled"
    };
    await notify(
      client,
      current.buyer_id,
      "Order update",
      `Order ${orderId.slice(0, 8)}\u2026 is now ${statusLabels[status] ?? status.toLowerCase()}`,
      status === "COMPLETED" ? "ORDER_COMPLETED" : "ORDER_STATUS"
    );
    return rows;
  });
  const order = orders[0];
  return c.json({
    id: order.id,
    status: order.status,
    paidAt: order.paid_at,
    completedAt: order.completed_at,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason,
    updatedAt: order.updated_at
  });
});
orderRoutes.post("/:id/cancel", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const orderId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json().catch(() => ({}));
  const { reason } = body;
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      "SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
      [orderId, userId]
    );
    const current = currentRows[0];
    if (!current) {
      throw new Error("Order not found");
    }
    const allowed = ["CREATED", "PAYMENT_PENDING", "PAYMENT_CONFIRMED", "SHIPPING_ARRANGED"];
    if (!allowed.includes(current.status)) {
      throw new Error(`Cannot cancel order in status ${current.status}`);
    }
    const updates = ["status = $1", "cancelled_at = NOW()"];
    const values = ["CANCELLED"];
    let paramIndex = 2;
    if (reason) {
      updates.push(`cancel_reason = $${paramIndex}`);
      values.push(reason);
      paramIndex++;
    }
    values.push(orderId);
    const { rows } = await client.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (current.item_id) {
      await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [current.item_id]);
    }
    await client.query("UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1", [current.listing_id]);
    return rows;
  });
  const order = orders[0];
  return c.json({
    orderId: order.id,
    status: order.status,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason
  });
});

// src/routes/offers.ts
var offerSchema = external_exports.object({
  listingId: external_exports.string().uuid(),
  offerPrice: external_exports.number().int().min(0)
});
var offerRoutes = new Hono2();
offerRoutes.use("*", authMiddleware);
offerRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const direction = c.req.query("direction");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    let sql = `
      SELECT o.*, 
             l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
             l.image_url as listing_image_url, l.seller_id as listing_seller_id,
             b.name as buyer_name, s.name as seller_name
      FROM offers o
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN users b ON o.buyer_id = b.id
      LEFT JOIN users s ON o.seller_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (direction === "INCOMING") {
      sql += ` AND o.seller_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (direction === "OUTGOING") {
      sql += ` AND o.buyer_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ` AND (o.buyer_id = $${paramIndex} OR o.seller_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }
    sql += ` ORDER BY o.created_at DESC`;
    const { rows } = await client.query(sql, params);
    return rows;
  });
  return c.json({
    offers: offers.map((o) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id
      } : null,
      fromUser: o.buyer_id === userId ? { id: o.buyer_id, name: o.buyer_name } : { id: o.seller_id, name: o.seller_name },
      toUser: o.buyer_id === userId ? { id: o.seller_id, name: o.seller_name } : { id: o.buyer_id, name: o.buyer_name }
    }))
  });
});
offerRoutes.post("/", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: listingRows } = await client.query(
      "SELECT * FROM listings WHERE listing_id = $1 AND status = $2",
      [data.listingId, "ACTIVE"]
    );
    const listing = listingRows[0];
    if (!listing) {
      throw new Error("Listing not found or not active");
    }
    if (listing.seller_id === userId) {
      throw new Error("Cannot make offer on your own listing");
    }
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const { rows } = await client.query(
      `INSERT INTO offers (listing_id, buyer_id, seller_id, offer_price, status, expires_at)
       VALUES ($1, $2, $3, $4, 'PENDING', $5)
       RETURNING *`,
      [data.listingId, userId, listing.seller_id, data.offerPrice, expiresAt.toISOString()]
    );
    await notify(
      client,
      listing.seller_id,
      "New offer received",
      `\u0E3F${data.offerPrice.toLocaleString()} for "${listing.title}"`,
      "OFFER_RECEIVED"
    );
    return rows;
  });
  const offer = offers[0];
  return c.json({
    id: offer.id,
    listingId: offer.listing_id,
    buyerId: offer.buyer_id,
    sellerId: offer.seller_id,
    offerPrice: offer.offer_price,
    status: offer.status,
    expiresAt: offer.expires_at,
    createdAt: offer.created_at
  }, 201);
});
offerRoutes.patch("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const offerId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const { status } = body;
  if (!status || !["ACCEPTED", "DECLINED", "COUNTERED"].includes(status)) {
    return c.json({ error: "Invalid status. Must be ACCEPTED, DECLINED, or COUNTERED" }, 400);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      "SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3",
      [offerId, userId, "PENDING"]
    );
    const current = currentRows[0];
    if (!current) {
      throw new Error("Offer not found or not authorized");
    }
    if (new Date(current.expires_at) < /* @__PURE__ */ new Date()) {
      await client.query("UPDATE offers SET status = 'DECLINED' WHERE id = $1", [offerId]);
      throw new Error("Offer has expired");
    }
    const updates = ["status = $1"];
    const values = [status];
    let paramIndex = 2;
    if (status === "COUNTERED" && body.offerPrice) {
      updates.push(`offer_price = $${paramIndex}`);
      values.push(body.offerPrice);
      paramIndex++;
    }
    values.push(offerId);
    const { rows } = await client.query(
      `UPDATE offers SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows;
  });
  const offer = offers[0];
  if (status === "ACCEPTED") {
    await withTenant(c.env, tenantId, async (client) => {
      await client.query(
        "UPDATE listings SET price = $1, status = $2 WHERE listing_id = $3",
        [offer.offer_price, "INACTIVE", offer.listing_id]
      );
    });
  }
  return c.json({
    id: offer.id,
    status: offer.status,
    offerPrice: offer.offer_price,
    updatedAt: offer.updated_at
  });
});
offerRoutes.get("/received", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.seller_id as listing_seller_id,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN users b ON o.buyer_id = b.id
       LEFT JOIN users s ON o.seller_id = s.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  });
  return c.json({
    offers: offers.map((o) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      buyerName: o.buyer_name ?? void 0,
      sellerName: o.seller_name ?? void 0,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id
      } : null
    }))
  });
});
offerRoutes.get("/sent", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.seller_id as listing_seller_id,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN users b ON o.buyer_id = b.id
       LEFT JOIN users s ON o.seller_id = s.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  });
  return c.json({
    offers: offers.map((o) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      buyerName: o.buyer_name ?? void 0,
      sellerName: o.seller_name ?? void 0,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id
      } : null
    }))
  });
});
offerRoutes.post("/:id/accept", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const offerId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      "SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3",
      [offerId, userId, "PENDING"]
    );
    const current = currentRows[0];
    if (!current) {
      throw new Error("Offer not found or not authorized");
    }
    if (new Date(current.expires_at) < /* @__PURE__ */ new Date()) {
      await client.query("UPDATE offers SET status = 'DECLINED' WHERE id = $1", [offerId]);
      throw new Error("Offer has expired");
    }
    const { rows } = await client.query(
      "UPDATE offers SET status = 'ACCEPTED' WHERE id = $1 RETURNING *",
      [offerId]
    );
    await client.query(
      "UPDATE listings SET price = $1, status = $2 WHERE listing_id = $3",
      [current.offer_price, "INACTIVE", current.listing_id]
    );
    await notify(
      client,
      current.buyer_id,
      "Offer accepted",
      `Your offer of \u0E3F${current.offer_price.toLocaleString()} was accepted`,
      "OFFER_ACCEPTED"
    );
    return rows;
  });
  const offer = offers[0];
  return c.json({
    id: offer.id,
    status: offer.status,
    offerPrice: offer.offer_price,
    updatedAt: offer.updated_at
  });
});
offerRoutes.post("/:id/decline", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const offerId = c.req.param("id");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      "SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3",
      [offerId, userId, "PENDING"]
    );
    const current = currentRows[0];
    if (!current) {
      throw new Error("Offer not found or not authorized");
    }
    const { rows } = await client.query(
      "UPDATE offers SET status = 'DECLINED' WHERE id = $1 RETURNING *",
      [offerId]
    );
    await notify(
      client,
      current.buyer_id,
      "Offer declined",
      `Your offer of \u0E3F${current.offer_price.toLocaleString()} was declined`,
      "OFFER_DECLINED"
    );
    return rows;
  });
  const offer = offers[0];
  return c.json({
    id: offer.id,
    status: offer.status,
    updatedAt: offer.updated_at
  });
});

// src/routes/misc.ts
var miscRoutes = new Hono2();
miscRoutes.use("*", optionalAuth);
var mapWishlistItem = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  buyerId: r.buyer_id,
  listingId: r.listing_id,
  createdAt: r.created_at
}), "mapWishlistItem");
var mapNotification = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  body: r.body,
  channel: r.channel,
  eventType: r.event_type,
  readAt: r.read_at ?? void 0,
  createdAt: r.created_at
}), "mapNotification");
var mapFollow = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  followerId: r.follower_id,
  followingId: r.following_id,
  createdAt: r.created_at
}), "mapFollow");
var mapRedemption = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  itemId: r.item_id,
  userId: r.user_id,
  status: r.status,
  shippingAddress: r.shipping_address,
  trackingNumber: r.tracking_number ?? void 0,
  createdAt: r.created_at,
  completedAt: r.completed_at ?? void 0
}), "mapRedemption");
var mapVaultDelivery = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  itemId: r.item_id,
  userId: r.user_id,
  status: r.status,
  shippingAddress: r.shipping_address,
  trackingNumber: r.tracking_number ?? void 0,
  createdAt: r.created_at
}), "mapVaultDelivery");
var mapAuditEntry = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  itemId: r.item_id ?? void 0,
  userId: r.user_id ?? void 0,
  eventType: r.event_type,
  actorId: r.actor_id ?? "system",
  previousState: r.previous_state,
  newState: r.new_state,
  occurredAt: r.occurred_at ?? r.created_at
}), "mapAuditEntry");
miscRoutes.get("/wishlist", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT w.*, l.title as listing_title, l.price as listing_price, l.image_url as listing_image_url,
              v.sku as item_sku, v.image_url as item_image_url
       FROM wishlist w
       LEFT JOIN listings l ON w.listing_id = l.listing_id
       LEFT JOIN vault_items v ON l.item_id = v.id
       WHERE w.buyer_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      ...mapWishlistItem(r),
      listingTitle: r.listing_title ?? void 0,
      listingPrice: r.listing_price ?? void 0,
      listingImageUrl: r.listing_image_url ?? r.item_image_url ?? void 0,
      itemSku: r.item_sku ?? void 0
    }));
  });
  return c.json({ items });
});
miscRoutes.post("/wishlist/:listingId", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const listingId = c.req.param("listingId");
  const item = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO wishlist (listing_id, buyer_id) VALUES ($1, $2)
       ON CONFLICT (buyer_id, listing_id) DO NOTHING
       RETURNING *`,
      [listingId, userId]
    );
    if (rows[0]) return rows[0];
    const { rows: existing } = await client.query(
      "SELECT * FROM wishlist WHERE listing_id = $1 AND buyer_id = $2",
      [listingId, userId]
    );
    return existing[0];
  });
  return c.json(mapWishlistItem(item), 201);
});
miscRoutes.delete("/wishlist/:listingId", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const listingId = c.req.param("listingId");
  await withTenant(c.env, tenantId, async (client) => {
    await client.query("DELETE FROM wishlist WHERE listing_id = $1 AND buyer_id = $2", [listingId, userId]);
  });
  return c.json({ status: "removed" });
});
miscRoutes.get("/notifications", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const notifications = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map(mapNotification);
  });
  return c.json({ notifications });
});
miscRoutes.patch("/notifications/:id/read", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");
  await withTenant(c.env, tenantId, async (client) => {
    await client.query("UPDATE notifications SET read_at = NOW() WHERE id = $1", [id]);
  });
  return c.json({ status: "read" });
});
var COLLECTOR_SELECT = `
  SELECT u.id, u.name, u.tier, u.avatar_url, u.bio, u.banner_url, u.location, u.social_links, u.created_at,
    (SELECT COUNT(*)::int FROM listings l WHERE l.seller_id = u.id AND l.status = 'ACTIVE') as listed_items,
    (SELECT COUNT(*)::int FROM orders o WHERE o.seller_id = u.id) as sold_items,
    (SELECT COUNT(*)::int FROM follows f WHERE f.following_id = u.id) as followers
  FROM users u`;
var mapCollectorProfile = /* @__PURE__ */ __name((r) => ({
  userId: r.id,
  displayName: r.name,
  bio: r.bio ?? void 0,
  avatarUrl: r.avatar_url ?? void 0,
  bannerUrl: r.banner_url ?? void 0,
  address: r.location ? { street: r.location } : void 0,
  socialLinks: r.social_links ?? void 0,
  stats: {
    listedItems: r.listed_items ?? 0,
    soldItems: r.sold_items ?? 0,
    followers: r.followers ?? 0
  },
  memberSince: r.created_at
}), "mapCollectorProfile");
miscRoutes.get("/collectors", async (c) => {
  const tenantId = c.get("tenantId");
  const sellers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.tier IN ($1, $2)`, ["MEMBER", "SUBSCRIBER"]);
    return rows.map(mapCollectorProfile);
  });
  return c.json({ sellers });
});
miscRoutes.get("/collectors/:userId", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.req.param("userId");
  const profile3 = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.id = $1`, [userId]);
    return rows[0] ? mapCollectorProfile(rows[0]) : null;
  });
  if (!profile3) return c.json({ error: "Not found" }, 404);
  return c.json(profile3);
});
miscRoutes.put("/collectors/me", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const body = await c.req.json();
  const profile3 = await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         bio = COALESCE($2, bio),
         avatar_url = COALESCE($3, avatar_url),
         banner_url = COALESCE($4, banner_url),
         location = COALESCE($5, location),
         social_links = COALESCE($6::jsonb, social_links)
       WHERE id = $7`,
      [
        body.displayName ?? body.name ?? null,
        body.bio ?? null,
        body.avatarUrl ?? null,
        body.bannerUrl ?? null,
        body.location ?? null,
        body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        userId
      ]
    );
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.id = $1`, [userId]);
    return rows[0] ? mapCollectorProfile(rows[0]) : null;
  });
  return c.json(profile3);
});
miscRoutes.post("/follows", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const { followingId } = await c.req.json();
  await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT (follower_id, following_id) DO NOTHING",
      [userId, followingId]
    );
  });
  return c.json({ status: "followed" }, 201);
});
miscRoutes.delete("/follows/:followingId", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const followingId = c.req.param("followingId");
  await withTenant(c.env, tenantId, async (client) => {
    await client.query("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2", [userId, followingId]);
  });
  return c.json({ status: "unfollowed" });
});
miscRoutes.get("/follows", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const follows = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM follows WHERE follower_id = $1", [userId]);
    return rows.map(mapFollow);
  });
  return c.json({ follows });
});
miscRoutes.get("/redemptions", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const redemptions = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM redemptions WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map(mapRedemption);
  });
  return c.json({ redemptions });
});
miscRoutes.get("/vault-deliveries", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const deliveries = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM vault_deliveries WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map(mapVaultDelivery);
  });
  return c.json({ deliveries });
});
miscRoutes.get("/audit/items/:itemId", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const itemId = c.req.param("itemId");
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM audit_log WHERE item_id = $1 ORDER BY created_at DESC", [itemId]);
    return rows.map(mapAuditEntry);
  });
  return c.json({ itemId, history });
});
miscRoutes.get("/audit/users/:userId", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.req.param("userId");
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT * FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map(mapAuditEntry);
  });
  return c.json({ userId, history });
});
miscRoutes.get("/market/:sku/history", async (c) => {
  const tenantId = c.get("tenantId");
  const sku = c.req.param("sku");
  const period = c.req.query("period");
  const intervalMap = {
    "7d": "7 days",
    "30d": "30 days",
    "90d": "90 days",
    "1y": "1 year"
  };
  const interval = period ? intervalMap[period] ?? null : null;
  const trades = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "SELECT price, traded_at FROM price_history WHERE sku = $1 AND ($2::text IS NULL OR traded_at > NOW() - $2::interval) ORDER BY traded_at DESC",
      [sku, interval]
    );
    return rows.map((r) => ({ time: r.traded_at, price: r.price }));
  });
  return c.json({ sku, period: period || "30d", trades });
});
miscRoutes.get("/market/:sku/stats", async (c) => {
  const tenantId = c.get("tenantId");
  const sku = c.req.param("sku");
  const stats = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT MIN(price)::int as min_price, MAX(price)::int as max_price, AVG(price)::int as avg_price, COUNT(*)::int as count,
        (SELECT price FROM price_history WHERE sku = $1 ORDER BY traded_at DESC LIMIT 1) as last_sold
       FROM price_history WHERE sku = $1`,
      [sku]
    );
    return rows[0];
  });
  return c.json({
    sku,
    lastSold: stats?.last_sold ?? void 0,
    avgPrice: stats?.avg_price ?? void 0,
    minPrice: stats?.min_price ?? void 0,
    maxPrice: stats?.max_price ?? void 0,
    count: stats?.count ?? 0
  });
});
miscRoutes.get("/kyc/status/:userId", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.req.param("userId");
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query("SELECT id, kyc_status, created_at, updated_at FROM users WHERE id = $1", [userId]);
    return rows[0] || null;
  });
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json({ userId: result.id, status: result.kyc_status, submittedAt: result.created_at, reviewedAt: result.updated_at });
});
miscRoutes.post("/kyc/submit", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const body = await c.req.json();
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "UPDATE users SET kyc_status = 'PENDING' WHERE id = $1 RETURNING id, kyc_status",
      [userId]
    );
    return rows[0];
  });
  return c.json({ kycId: result.id, status: result.kyc_status, message: "KYC submitted" });
});
miscRoutes.get("/campaigns", async (c) => {
  return c.json({ campaigns: [] });
});
miscRoutes.get("/campaigns/:slug", async (c) => {
  return c.json({ campaign: null });
});
miscRoutes.post("/campaigns/:slug/claim", authMiddleware, async (c) => {
  return c.json({ success: false });
});
miscRoutes.get("/campaigns/my", authMiddleware, async (c) => {
  return c.json({ campaigns: [] });
});
miscRoutes.get("/achievements", async (c) => {
  return c.json({ achievements: [] });
});
miscRoutes.get("/achievements/:slug", async (c) => {
  return c.json({ achievement: null });
});
miscRoutes.get("/achievements/my", authMiddleware, async (c) => {
  return c.json({ achievements: [] });
});
miscRoutes.post("/achievements/:slug/progress", authMiddleware, async (c) => {
  return c.json({ achievement: null });
});
miscRoutes.get("/badges", async (c) => {
  return c.json({ badges: [] });
});
miscRoutes.get("/users/:userId/badges", async (c) => {
  return c.json({ badges: [] });
});
miscRoutes.get("/users/:userId/badges/equipped", async (c) => {
  return c.json({ badges: [] });
});
miscRoutes.post("/users/me/badges/equip", authMiddleware, async (c) => {
  return c.json({ status: "equipped" });
});
miscRoutes.get("/platform/stats", async (c) => {
  const tenantId = c.get("tenantId");
  const stats = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM users) as total_users,
         (SELECT COUNT(*)::int FROM listings) as total_listings,
         (SELECT COUNT(*)::int FROM orders) as total_orders,
         (SELECT COALESCE(SUM(price), 0)::bigint FROM orders) as total_volume`
    );
    return rows[0];
  });
  return c.json({
    totalUsers: stats.total_users,
    totalListings: stats.total_listings,
    totalOrders: stats.total_orders,
    totalVolume: Number(stats.total_volume)
  });
});
miscRoutes.get("/shipments/:orderId", authMiddleware, async (c) => {
  return c.json({});
});
miscRoutes.get("/shipments/:id/track", authMiddleware, async (c) => {
  return c.json({ timeline: [] });
});
miscRoutes.post("/collector-profiles/avatar", authMiddleware, async (c) => {
  return c.json({ avatarUrl: "" });
});
miscRoutes.post("/collector-profiles/banner", authMiddleware, async (c) => {
  return c.json({ bannerUrl: "" });
});

// src/routes/uploads.ts
var uploadRoutes = new Hono2();
var MAX_SIZE = 5 * 1024 * 1024;
var ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif"
};
uploadRoutes.post("/uploads", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || typeof file === "string") {
    return c.json({ error: 'No file provided (expected field "file")' }, 400);
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return c.json({ error: "Unsupported file type. Use JPEG, PNG, WebP or AVIF." }, 400);
  }
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large (max 5MB)" }, 400);
  }
  const key = `${tenantId}/${userId}/${crypto.randomUUID()}.${ext}`;
  await c.env.IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });
  const origin = new URL(c.req.url).origin;
  return c.json({ url: `${origin}/api/v1/images/${key}`, key }, 201);
});
uploadRoutes.get("/images/*", optionalAuth, async (c) => {
  const key = c.req.path.replace(/^\/api\/v1\/images\//, "");
  if (!key || key.includes("..")) {
    return c.json({ error: "Invalid key" }, 400);
  }
  const obj = await c.env.IMAGES.get(key);
  if (!obj) {
    return c.json({ error: "Not found" }, 404);
  }
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", obj.httpEtag);
  return new Response(obj.body, { headers });
});

// src/routes/stores.ts
var storeRoutes = new Hono2();
storeRoutes.use("*", optionalAuth);
var mapGroup = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  name: r.name,
  cardCodes: Array.isArray(r.card_codes) ? r.card_codes : []
}), "mapGroup");
var mapReview = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  storeId: r.store_id,
  reviewerName: r.reviewer_name || `User ${String(r.reviewer_id).slice(0, 6)}`,
  rating: r.rating,
  comment: r.comment ?? "",
  createdAt: r.created_at
}), "mapReview");
storeRoutes.get("/stores/:userId/groups", async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.req.param("userId");
  const groups = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "SELECT * FROM store_groups WHERE user_id = $1 ORDER BY sort_order, created_at",
      [userId]
    );
    return rows.map(mapGroup);
  });
  return c.json({ groups });
});
storeRoutes.put("/stores/me/groups", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const groups = Array.isArray(body.groups) ? body.groups : [];
  const saved = await withTenant(c.env, tenantId, async (client) => {
    await client.query("DELETE FROM store_groups WHERE user_id = $1", [userId]);
    const inserted = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g.name?.trim()) continue;
      const { rows } = await client.query(
        "INSERT INTO store_groups (user_id, name, card_codes, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, g.name.trim(), JSON.stringify(g.cardCodes ?? []), i]
      );
      inserted.push(rows[0]);
    }
    return inserted;
  });
  return c.json({ groups: saved.map(mapGroup) });
});
storeRoutes.get("/stores/:storeId/reviews", async (c) => {
  const tenantId = c.get("tenantId");
  const storeId = c.req.param("storeId");
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT r.*, u.name as reviewer_name
       FROM store_reviews r
       LEFT JOIN users u ON r.reviewer_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    return rows;
  });
  const reviews = result.map(mapReview);
  const count3 = reviews.length;
  const average = count3 > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count3 : null;
  return c.json({ reviews, count: count3, average });
});
storeRoutes.post("/stores/:storeId/reviews", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const storeId = c.req.param("storeId");
  if (storeId === userId) {
    return c.json({ error: "Cannot review your own store" }, 400);
  }
  const body = await c.req.json();
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: "Rating must be an integer between 1 and 5" }, 400);
  }
  const comment = typeof body.comment === "string" ? body.comment.slice(0, 1e3) : "";
  const review = await withTenant(c.env, tenantId, async (client) => {
    const { rows: orderRows } = await client.query(
      "SELECT 1 FROM orders WHERE buyer_id = $1 AND seller_id = $2 AND status = 'COMPLETED' LIMIT 1",
      [userId, storeId]
    );
    let eligible = orderRows.length > 0;
    if (!eligible) {
      const { rows: svcRows } = await client.query(
        `SELECT 1 FROM service_orders so
         JOIN service_providers p ON so.provider_id = p.id
         WHERE so.user_id = $1 AND p.user_id = $2 AND so.status = 'COMPLETED' LIMIT 1`,
        [userId, storeId]
      );
      eligible = svcRows.length > 0;
    }
    if (!eligible) {
      return { error: "You can review a store after completing an order with them" };
    }
    const { rows } = await client.query(
      `INSERT INTO store_reviews (store_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, reviewer_id)
       DO UPDATE SET rating = $3, comment = $4, updated_at = NOW()
       RETURNING *`,
      [storeId, userId, rating, comment]
    );
    return { row: rows[0] };
  });
  if ("error" in review) {
    return c.json({ error: review.error }, 403);
  }
  return c.json(mapReview(review.row), 201);
});

// src/routes/services.ts
var serviceRoutes = new Hono2();
serviceRoutes.use("*", optionalAuth);
var STAGE_TEMPLATES = {
  PREGRADE: [
    { key: "ordered", label: "Ordered" },
    { key: "received", label: "Materials received" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" }
  ],
  GRADE: [
    { key: "ordered", label: "Ordered" },
    { key: "shipped-to-store", label: "Shipped to store" },
    { key: "received-by-store", label: "Received by store" },
    { key: "sent-to-grader", label: "Sent to grader" },
    { key: "at-grader", label: "At grader / grading" },
    { key: "qa", label: "QA / grading complete" },
    { key: "returned-to-store", label: "Returned to store" },
    { key: "shipped-to-customer", label: "Shipped to customer" },
    { key: "delivered", label: "Delivered" }
  ]
};
function buildStages(category) {
  const template = STAGE_TEMPLATES[category] ?? STAGE_TEMPLATES.PREGRADE;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return template.map((s, i) => ({ ...s, completed: i === 0, timestamp: i === 0 ? now : void 0 }));
}
__name(buildStages, "buildStages");
var mapProvider = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  storeId: r.user_id,
  storeName: r.store_name || `Store ${String(r.user_id).slice(0, 6)}`,
  storeAvatarUrl: r.store_avatar ?? void 0,
  category: r.category,
  serviceTypes: r.service_types ?? [],
  acceptedGraders: r.accepted_graders ?? [],
  description: r.description ?? "",
  deliveryMode: r.delivery_mode,
  turnaround: r.turnaround ?? "",
  pricePerCard: r.price_per_card ?? 0,
  currency: r.currency ?? "THB",
  scoreLabel: r.category === "PREGRADE" ? "Pre-grade score" : "Grade",
  color: r.category === "PREGRADE" ? "periwinkle" : "cyan",
  enabled: r.enabled,
  contactLine: r.contact_line ?? void 0,
  contactPhone: r.contact_phone ?? void 0,
  contactEmail: r.contact_email ?? void 0,
  createdAt: r.created_at
}), "mapProvider");
var mapPackage = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  providerId: r.provider_id,
  grader: r.grader ?? void 0,
  name: r.name,
  description: r.description ?? "",
  deliveryMode: r.delivery_mode,
  turnaround: r.turnaround ?? "",
  pricePerCard: r.price_per_card ?? 0,
  currency: r.currency ?? "THB",
  includes: r.includes ?? [],
  enabled: r.enabled
}), "mapPackage");
var mapOrder = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  orderNo: r.order_no,
  userId: r.user_id,
  category: r.category,
  providerId: r.provider_id,
  providerName: r.provider_name || `Store ${String(r.provider_user_id ?? "").slice(0, 6)}`,
  storeId: r.provider_user_id,
  packageId: r.package_id ?? void 0,
  packageName: r.package_name ?? void 0,
  grader: r.grader ?? void 0,
  cardIds: r.card_ids ?? [],
  status: r.status,
  stages: r.stages ?? [],
  totalAmount: r.total_amount ?? 0,
  currency: r.currency ?? "THB",
  deliveryMode: r.delivery_mode,
  shippingAddress: r.shipping_address ?? void 0,
  trackingNumber: r.tracking_no ?? void 0,
  gradeResult: r.grade_result ?? void 0,
  customerName: r.customer_name ?? void 0,
  createdAt: r.created_at,
  updatedAt: r.updated_at
}), "mapOrder");
var PROVIDER_SELECT = `
  SELECT p.*, u.name as store_name, u.avatar_url as store_avatar
  FROM service_providers p
  LEFT JOIN users u ON p.user_id = u.id`;
var ORDER_SELECT = `
  SELECT o.*, p.user_id as provider_user_id, pu.name as provider_name, cu.name as customer_name,
         pkg.name as package_name
  FROM service_orders o
  LEFT JOIN service_providers p ON o.provider_id = p.id
  LEFT JOIN users pu ON p.user_id = pu.id
  LEFT JOIN users cu ON o.user_id = cu.id
  LEFT JOIN service_packages pkg ON o.package_id = pkg.id`;
serviceRoutes.get("/services/providers", async (c) => {
  const tenantId = c.get("tenantId");
  const category = c.req.query("category");
  const providers = await withTenant(c.env, tenantId, async (client) => {
    const params = [];
    let sql = `${PROVIDER_SELECT} WHERE p.enabled = TRUE`;
    if (category) {
      sql += " AND p.category = $1";
      params.push(category);
    }
    sql += " ORDER BY p.created_at DESC";
    const { rows } = await client.query(sql, params);
    return rows.map(mapProvider);
  });
  return c.json({ providers });
});
serviceRoutes.get("/services/providers/me", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const provider = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${PROVIDER_SELECT} WHERE p.user_id = $1`, [userId]);
    return rows[0] ? mapProvider(rows[0]) : null;
  });
  return c.json({ provider });
});
serviceRoutes.get("/services/providers/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${PROVIDER_SELECT} WHERE p.id = $1`, [id]);
    if (!rows[0]) return null;
    const { rows: packages } = await client.query(
      "SELECT * FROM service_packages WHERE provider_id = $1 AND enabled = TRUE ORDER BY sort_order, price_per_card",
      [id]
    );
    return { provider: mapProvider(rows[0]), packages: packages.map(mapPackage) };
  });
  if (!result) return c.json({ error: "Provider not found" }, 404);
  return c.json(result);
});
var providerSchema = external_exports.object({
  category: external_exports.enum(["PREGRADE", "GRADE"]),
  serviceTypes: external_exports.array(external_exports.string()).optional(),
  acceptedGraders: external_exports.array(external_exports.string()).optional(),
  description: external_exports.string().max(2e3).optional(),
  deliveryMode: external_exports.enum(["PHYSICAL_SHIP", "PHYSICAL_DROP_OFF", "PHOTO_UPLOAD"]).optional(),
  turnaround: external_exports.string().max(120).optional(),
  pricePerCard: external_exports.number().int().min(0).optional(),
  contactLine: external_exports.string().max(120).optional(),
  contactPhone: external_exports.string().max(40).optional(),
  contactEmail: external_exports.string().email().optional().or(external_exports.literal(""))
});
serviceRoutes.post("/services/providers", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const parsed = providerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  try {
    const provider = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO service_providers (user_id, category, service_types, accepted_graders, description, delivery_mode, turnaround, price_per_card, contact_line, contact_phone, contact_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          userId,
          data.category,
          JSON.stringify(data.serviceTypes ?? []),
          JSON.stringify(data.acceptedGraders ?? []),
          data.description ?? "",
          data.deliveryMode ?? "PHYSICAL_SHIP",
          data.turnaround ?? "",
          data.pricePerCard ?? 0,
          data.contactLine ?? null,
          data.contactPhone ?? null,
          data.contactEmail ?? null
        ]
      );
      return rows[0];
    });
    return c.json(mapProvider(provider), 201);
  } catch (err) {
    if (err.code === "23505") {
      return c.json({ error: "You already have a provider profile" }, 409);
    }
    throw err;
  }
});
serviceRoutes.put("/services/providers/me", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const fieldMap = {
    category: "category",
    description: "description",
    deliveryMode: "delivery_mode",
    turnaround: "turnaround",
    pricePerCard: "price_per_card",
    contactLine: "contact_line",
    contactPhone: "contact_phone",
    contactEmail: "contact_email",
    enabled: "enabled"
  };
  const updates = ["updated_at = NOW()"];
  const values = [];
  let paramIndex = 1;
  for (const [field, column] of Object.entries(fieldMap)) {
    if (body[field] !== void 0) {
      updates.push(`${column} = $${paramIndex}`);
      values.push(body[field]);
      paramIndex++;
    }
  }
  if (Array.isArray(body.serviceTypes)) {
    updates.push(`service_types = $${paramIndex}`);
    values.push(JSON.stringify(body.serviceTypes));
    paramIndex++;
  }
  if (Array.isArray(body.acceptedGraders)) {
    updates.push(`accepted_graders = $${paramIndex}`);
    values.push(JSON.stringify(body.acceptedGraders));
    paramIndex++;
  }
  if (values.length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }
  values.push(userId);
  const provider = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE service_providers SET ${updates.join(", ")} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0] ? mapProvider({ ...rows[0], store_name: null, store_avatar: null }) : null;
  });
  if (!provider) return c.json({ error: "Provider profile not found" }, 404);
  return c.json(provider);
});
var packageSchema = external_exports.object({
  grader: external_exports.string().max(40).optional(),
  name: external_exports.string().min(1).max(120),
  description: external_exports.string().max(2e3).optional(),
  deliveryMode: external_exports.enum(["PHYSICAL_SHIP", "PHYSICAL_DROP_OFF", "PHOTO_UPLOAD"]).optional(),
  turnaround: external_exports.string().max(120).optional(),
  pricePerCard: external_exports.number().int().min(0),
  includes: external_exports.array(external_exports.string()).optional()
});
serviceRoutes.post("/services/providers/me/packages", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const pkg = await withTenant(c.env, tenantId, async (client) => {
    const { rows: prov } = await client.query("SELECT id FROM service_providers WHERE user_id = $1", [userId]);
    if (!prov[0]) return null;
    const { rows } = await client.query(
      `INSERT INTO service_packages (provider_id, grader, name, description, delivery_mode, turnaround, price_per_card, includes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [prov[0].id, data.grader ?? null, data.name, data.description ?? "", data.deliveryMode ?? "PHYSICAL_SHIP", data.turnaround ?? "", data.pricePerCard, JSON.stringify(data.includes ?? [])]
    );
    return rows[0];
  });
  if (!pkg) return c.json({ error: "Provider profile required first" }, 400);
  return c.json(mapPackage(pkg), 201);
});
serviceRoutes.get("/services/providers/me/packages", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const packages = await withTenant(c.env, tenantId, async (client) => {
    const { rows: prov } = await client.query("SELECT id FROM service_providers WHERE user_id = $1", [userId]);
    if (!prov[0]) return [];
    const { rows } = await client.query(
      "SELECT * FROM service_packages WHERE provider_id = $1 ORDER BY sort_order, created_at",
      [prov[0].id]
    );
    return rows.map(mapPackage);
  });
  return c.json({ packages });
});
serviceRoutes.put("/services/packages/:id", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const fieldMap = {
    grader: "grader",
    name: "name",
    description: "description",
    deliveryMode: "delivery_mode",
    turnaround: "turnaround",
    pricePerCard: "price_per_card",
    enabled: "enabled"
  };
  const updates = [];
  const values = [];
  let paramIndex = 1;
  for (const [field, column] of Object.entries(fieldMap)) {
    if (body[field] !== void 0) {
      updates.push(`${column} = $${paramIndex}`);
      values.push(body[field]);
      paramIndex++;
    }
  }
  if (Array.isArray(body.includes)) {
    updates.push(`includes = $${paramIndex}`);
    values.push(JSON.stringify(body.includes));
    paramIndex++;
  }
  if (updates.length === 0) return c.json({ error: "No valid fields to update" }, 400);
  values.push(c.req.param("id"), userId);
  const pkg = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE service_packages SET ${updates.join(", ")}
       WHERE id = $${paramIndex} AND provider_id IN (SELECT id FROM service_providers WHERE user_id = $${paramIndex + 1})
       RETURNING *`,
      values
    );
    return rows[0];
  });
  if (!pkg) return c.json({ error: "Package not found or not owned by user" }, 404);
  return c.json(mapPackage(pkg));
});
var orderSchema2 = external_exports.object({
  providerId: external_exports.string().uuid(),
  packageId: external_exports.string().uuid().optional(),
  cardIds: external_exports.array(external_exports.string().uuid()).min(1).max(50),
  deliveryMode: external_exports.enum(["PHYSICAL_SHIP", "PHYSICAL_DROP_OFF", "PHOTO_UPLOAD"]).optional(),
  shippingAddress: external_exports.object({
    name: external_exports.string(),
    phone: external_exports.string(),
    address: external_exports.string(),
    district: external_exports.string().optional(),
    province: external_exports.string(),
    postalCode: external_exports.string()
  }).optional()
});
serviceRoutes.post("/service-orders", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const parsed = orderSchema2.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: provRows } = await client.query("SELECT * FROM service_providers WHERE id = $1 AND enabled = TRUE", [data.providerId]);
    const provider = provRows[0];
    if (!provider) return { error: "Provider not found or not accepting orders" };
    if (provider.user_id === userId) return { error: "Cannot order from your own service" };
    let pkg = null;
    if (data.packageId) {
      const { rows: pkgRows } = await client.query(
        "SELECT * FROM service_packages WHERE id = $1 AND provider_id = $2 AND enabled = TRUE",
        [data.packageId, data.providerId]
      );
      pkg = pkgRows[0];
      if (!pkg) return { error: "Package not found" };
    }
    const { rows: cardRows } = await client.query(
      "SELECT id, status FROM vault_items WHERE id = ANY($1::uuid[]) AND owner_id = $2",
      [data.cardIds, userId]
    );
    if (cardRows.length !== data.cardIds.length) {
      return { error: "Some cards were not found in your vault" };
    }
    const notReady = cardRows.filter((r) => r.status !== "AVAILABLE");
    if (notReady.length > 0) {
      return { error: "Some cards are not available (listed, locked, or already in a service)" };
    }
    const pricePerCard = pkg?.price_per_card ?? provider.price_per_card ?? 0;
    const total = pricePerCard * data.cardIds.length;
    const orderNo = `SWS-${provider.category === "GRADE" ? "GR" : "PG"}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const { rows } = await client.query(
      `INSERT INTO service_orders (order_no, user_id, provider_id, package_id, category, grader, card_ids, status, stages, total_amount, delivery_mode, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9, $10, $11)
       RETURNING *`,
      [
        orderNo,
        userId,
        data.providerId,
        data.packageId ?? null,
        provider.category,
        pkg?.grader ?? null,
        JSON.stringify(data.cardIds),
        JSON.stringify(buildStages(provider.category)),
        total,
        data.deliveryMode ?? pkg?.delivery_mode ?? provider.delivery_mode,
        data.shippingAddress ? JSON.stringify(data.shippingAddress) : null
      ]
    );
    await client.query(
      "UPDATE vault_items SET status = 'LOCKED', service_order_id = $2 WHERE id = ANY($1::uuid[])",
      [data.cardIds, rows[0].id]
    );
    await notify(
      client,
      provider.user_id,
      "New service order",
      `${orderNo} \xB7 ${data.cardIds.length} card(s) \xB7 \u0E3F${total.toLocaleString()}`,
      "SERVICE_ORDER_CREATED"
    );
    return { row: rows[0] };
  });
  if ("error" in result) return c.json({ error: result.error }, 400);
  return c.json(mapOrder(result.row), 201);
});
serviceRoutes.get("/service-orders", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows.map(mapOrder);
  });
  return c.json({ orders });
});
serviceRoutes.get("/service-orders/received", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE p.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows.map(mapOrder);
  });
  return c.json({ orders });
});
serviceRoutes.get("/service-orders/:id", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  const id = c.req.param("id");
  const order = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.id = $1 AND (o.user_id = $2 OR p.user_id = $2)`,
      [id, userId]
    );
    return rows[0] ? mapOrder(rows[0]) : null;
  });
  if (!order) return c.json({ error: "Order not found" }, 404);
  return c.json(order);
});
serviceRoutes.patch("/service-orders/:id", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const body = await c.req.json();
  const action = body.action;
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.id = $1`,
      [id]
    );
    const order = rows[0];
    if (!order) return { error: "Order not found", status: 404 };
    const isOwner = order.provider_user_id === userId;
    const isBuyer = order.user_id === userId;
    if (action === "cancel") {
      if (!isBuyer) return { error: "Only the customer can cancel", status: 403 };
      if (order.status !== "PENDING") return { error: "Order can no longer be cancelled", status: 400 };
      await client.query("UPDATE service_orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1", [id]);
      await client.query("UPDATE vault_items SET status = 'AVAILABLE', service_order_id = NULL WHERE id = ANY($1::uuid[])", [order.card_ids]);
      await notify(
        client,
        order.provider_user_id,
        "Service order cancelled",
        `${order.order_no} was cancelled by the customer`,
        "SERVICE_ORDER_CANCELLED"
      );
      const { rows: updated } = await client.query(`${ORDER_SELECT} WHERE o.id = $1`, [id]);
      return { row: updated[0] };
    }
    if (action === "advance") {
      if (!isOwner) return { error: "Only the service provider can advance stages", status: 403 };
      if (order.status === "COMPLETED" || order.status === "CANCELLED") {
        return { error: "Order is already closed", status: 400 };
      }
      const stages = Array.isArray(order.stages) ? [...order.stages] : [];
      const nextIdx = stages.findIndex((s) => !s.completed);
      if (nextIdx === -1) return { error: "All stages already completed", status: 400 };
      const now = (/* @__PURE__ */ new Date()).toISOString();
      stages[nextIdx] = { ...stages[nextIdx], completed: true, timestamp: now };
      const isLast = stages.every((s) => s.completed);
      const newStatus = isLast ? "COMPLETED" : "IN_PROGRESS";
      const gradeResult = typeof body.gradeResult === "string" ? body.gradeResult.slice(0, 60) : null;
      const trackingNo = typeof body.trackingNumber === "string" ? body.trackingNumber.slice(0, 80) : null;
      await client.query(
        `UPDATE service_orders SET stages = $1, status = $2, updated_at = NOW(),
           grade_result = COALESCE($3, grade_result), tracking_no = COALESCE($4, tracking_no)
         WHERE id = $5`,
        [JSON.stringify(stages), newStatus, gradeResult, trackingNo, id]
      );
      if (newStatus === "IN_PROGRESS" && order.status === "PENDING") {
        await client.query("UPDATE service_orders SET status = 'IN_PROGRESS' WHERE id = $1", [id]);
      }
      if (isLast) {
        if (gradeResult) {
          await client.query(
            "UPDATE vault_items SET status = 'AVAILABLE', condition = $2, service_order_id = NULL WHERE id = ANY($1::uuid[])",
            [order.card_ids, gradeResult]
          );
        } else {
          await client.query("UPDATE vault_items SET status = 'AVAILABLE', service_order_id = NULL WHERE id = ANY($1::uuid[])", [order.card_ids]);
        }
      }
      await notify(
        client,
        order.user_id,
        isLast ? "Service order completed" : "Service order update",
        isLast ? `${order.order_no} is complete${gradeResult ? ` \u2014 result: ${gradeResult}` : ""}. Cards are back in your vault.` : `${order.order_no} \u2192 ${stages[nextIdx].label}`,
        isLast ? "SERVICE_ORDER_COMPLETED" : "SERVICE_ORDER_STAGE"
      );
      const { rows: updated } = await client.query(`${ORDER_SELECT} WHERE o.id = $1`, [id]);
      return { row: updated[0] };
    }
    return { error: "Unknown action (use advance or cancel)", status: 400 };
  });
  if ("error" in result) return c.json({ error: result.error }, result.status ?? 400);
  return c.json(mapOrder(result.row));
});

// src/routes/scan.ts
var scanRoutes = new Hono2();
var CACHE_VERSION = "v5-centering";
var ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
var ANTHROPIC_VERSION = "2023-06-01";
var VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";
var MODEL = "claude-haiku-4-5-20251001";
var MAX_IMAGE_B64 = 7 * 1024 * 1024;
var TRUSTED_HOSTS = [
  "cardpiece",
  "optcgapi",
  "apitcg",
  "bandai",
  "takaratomy",
  "pokemon.com",
  "pokemontcg.io",
  "yugioh-card.com",
  "konami",
  "pricecharting",
  "tcgplayer",
  "cardmarket",
  "ebay"
];
var TCG_META = {
  "one-piece": {
    game: "One Piece TCG",
    prompt: `You are a One Piece TCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Card code formats: OPXX-XXX, STXX-XXX, EBXX-XXX, PRB-XX, or P-XXX for promos.
Rarities: C, UC, R, SR, SEC, L, TR, SP, MR, P, DON!!.
Types: Leader, Character, Event, Stage, DON!!.
Detect parallel/star rarity if the rarity symbol has a star above it. If unsure between similar cards, put alternatives in candidates with lower confidence.`,
    codeRegex: /^(OP|ST|EB)\d{2}-\d{3}$|^PRB-\d{2}$|^P-\d{3}$/i,
    ocrRegex: /\b((?:OP|ST|EB)\d{2}-\d{3}|PRB-\d{2}|P-\d{3})\b/i
  },
  "yu-gi-oh": {
    game: "Yu-Gi-Oh! OCG",
    prompt: `You are a Yu-Gi-Oh! OCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Card code format: SETCODE-LANG### (e.g., LEDE-JP001, MAMA-EN001).
Rarities: N, R, SR, UR, UL, SE, HR, PSE, 20TH, QCSE, QCUR, CR, PGR, C.
Frame colors map to types: yellow Normal, orange Effect, green Spell, pink Trap, blue Ritual, purple Fusion, white Synchro, black Xyz, half-color Pendulum, dark blue Link.`,
    codeRegex: /^[A-Z0-9]{3,5}-[A-Z]{2}\d{3}$/i,
    ocrRegex: /\b([A-Z0-9]{3,5}-[A-Z]{2}\d{3})\b/i
  },
  pokemon: {
    game: "Pok\xE9mon TCG",
    prompt: `You are a Pok\xE9mon TCG card identifier. Output valid JSON only with these fields: code (set-number/total like 025/198 or promo code), nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Rarities: C, U, R, RR, SR, UR, HR, AR, SAR, ACE, PR.`,
    codeRegex: /^\d{1,3}\/\d{1,3}$|^[A-Z]{2,}\d{1,3}$|^S-P\d+$|^SM-P\d+$/i,
    ocrRegex: /\b(\d{1,3}\/\d{1,3}|S-P\d+|SM-P\d+)\b/i
  },
  lorcana: {
    game: "Disney Lorcana TCG",
    prompt: `You are a Disney Lorcana card identifier. Output valid JSON only with these fields: code (e.g., 1/204, P1, or set format), nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Rarities: Common, Uncommon, Rare, Super Rare, Legendary, Enchanted.
Types: Character, Action, Item, Location, Song.`,
    codeRegex: /^\d{1,3}\/\d{1,3}$|^P\d+$/i,
    ocrRegex: /\b(\d{1,3}\/\d{1,3})\b/i
  },
  conan: {
    game: "Detective Conan TCG",
    prompt: `You are a Detective Conan TCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).`,
    codeRegex: /^[A-Z0-9-]{3,}$/i,
    ocrRegex: /\b([A-Z0-9]{3,}-\d+)\b/i
  },
  others: {
    game: "trading card",
    prompt: `You are a trading card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence). Identify the game if recognizable and include it in reasoning.`,
    codeRegex: /.+/,
    ocrRegex: /\b([A-Z]{2,5}-?\d{2,4})\b/i
  }
};
var scanSchema = external_exports.object({
  image: external_exports.string().min(100),
  tcg: external_exports.string().default("one-piece"),
  lang: external_exports.string().default("JP"),
  force: external_exports.boolean().optional()
});
function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in model response");
  return JSON.parse(text.slice(start, end + 1));
}
__name(extractJson, "extractJson");
async function identifyWithHaiku(apiKey, imageB64, mediaType, prompt) {
  const resp = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageB64 } },
          { type: "text", text: prompt }
        ]
      }]
    })
  });
  const json = await resp.json();
  if (json.error) throw new Error(`anthropic: ${json.error.message}`);
  const text = json.content?.[0]?.text;
  if (!text) throw new Error("empty model response");
  return extractJson(text);
}
__name(identifyWithHaiku, "identifyWithHaiku");
async function visionAnnotate(apiKey, imageB64) {
  try {
    const resp = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: imageB64 },
          features: [
            { type: "WEB_DETECTION", maxResults: 50 },
            { type: "DOCUMENT_TEXT_DETECTION" }
          ]
        }]
      })
    });
    const json = await resp.json();
    return json.responses?.[0] ?? null;
  } catch {
    return null;
  }
}
__name(visionAnnotate, "visionAnnotate");
function extractCodeFromVision(vision, ocrRegex) {
  const text = vision?.fullTextAnnotation?.text ?? "";
  const m2 = text.match(ocrRegex);
  return m2 ? m2[1].toUpperCase() : null;
}
__name(extractCodeFromVision, "extractCodeFromVision");
function extractCodeFromWeb(vision, ocrRegex) {
  const web = vision?.webDetection;
  const candidates = [
    ...(web?.pagesWithMatchingImages ?? []).map((p2) => p2.url ?? ""),
    ...(web?.bestGuessLabels ?? []).map((l) => l.label ?? "")
  ];
  for (const raw2 of candidates) {
    if (!raw2) continue;
    const lower = raw2.toLowerCase();
    if (!TRUSTED_HOSTS.some((h) => lower.includes(h))) continue;
    const m2 = raw2.match(ocrRegex);
    if (m2) return m2[1].toUpperCase();
  }
  return null;
}
__name(extractCodeFromWeb, "extractCodeFromWeb");
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
scanRoutes.post("/scan", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const { image, tcg, lang, force } = parsed.data;
  const meta = TCG_META[tcg] ?? TCG_META["one-piece"];
  const match2 = image.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  const mediaType = match2?.[1] ?? "image/jpeg";
  const imageB64 = match2?.[2] ?? image;
  if (imageB64.length > MAX_IMAGE_B64) {
    return c.json({ error: "Image too large (max ~5MB)" }, 400);
  }
  const hash2 = await sha256Hex(imageB64);
  if (!force) {
    const cached = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query("SELECT card, image_url, identified_by FROM scans WHERE hash = $1 AND cache_version = $2", [hash2, CACHE_VERSION]);
      return rows[0];
    });
    if (cached) {
      const stored = cached.card ?? {};
      const { _extras, ...cardOnly } = stored;
      return c.json({
        ok: true,
        cached: true,
        card: cardOnly,
        hash: hash2,
        imageUrl: cached.image_url,
        identifiedBy: cached.identified_by,
        catalog: _extras?.catalog ?? null,
        nearMatches: _extras?.nearMatches ?? [],
        candidates: _extras?.candidates ?? [],
        imageOptions: _extras?.imageOptions ?? [{ url: cached.image_url, label: "your-photo" }]
      });
    }
  }
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: "Scan service not configured (ANTHROPIC_API_KEY missing)" }, 503);
  }
  const [haikuRes, visionRes] = await Promise.allSettled([
    identifyWithHaiku(c.env.ANTHROPIC_API_KEY, imageB64, mediaType, meta.prompt),
    c.env.GOOGLE_VISION_API_KEY ? visionAnnotate(c.env.GOOGLE_VISION_API_KEY, imageB64) : Promise.resolve(null)
  ]);
  if (haikuRes.status === "rejected") {
    return c.json({ ok: false, error: "Identification failed", message: haikuRes.reason?.message }, 502);
  }
  const card = haikuRes.value;
  const vision = visionRes.status === "fulfilled" ? visionRes.value : null;
  card.code = String(card.code ?? "").replace(/\s+/g, "").toUpperCase();
  let confidence = Math.max(0, Math.min(100, Number(card.confidence) || 0));
  const ocrCode = vision ? extractCodeFromVision(vision, meta.ocrRegex) : null;
  let identifiedBy = "haiku";
  if (ocrCode && meta.codeRegex.test(ocrCode)) {
    card.code = ocrCode;
    confidence = Math.max(confidence, 92);
    identifiedBy = "ocr-extract";
  }
  const visionWebCode = vision ? extractCodeFromWeb(vision, meta.ocrRegex) : null;
  const codeValid = meta.codeRegex.test(card.code);
  const crossCheck = { agreed: false, haikuCode: card.code || null, visionCode: visionWebCode };
  if (codeValid && visionWebCode && card.code === visionWebCode) {
    crossCheck.agreed = true;
    crossCheck.adopted = card.code;
    confidence = Math.max(confidence, 95);
    identifiedBy = "vision-cross-check";
  } else if (codeValid && confidence >= 90) {
    identifiedBy = identifiedBy === "ocr-extract" ? identifiedBy : "haiku-confident";
  }
  if (!codeValid && confidence < 90) {
    return c.json({ ok: false, error: "unable to identify card", card, hash: hash2, crossCheck }, 422);
  }
  let catalog = null;
  let nearMatches = [];
  if (codeValid || card.nameEn) {
    const enriched = await withTenant(c.env, tenantId, async (client) => {
      let exact = null;
      if (codeValid) {
        const { rows } = await client.query(
          "SELECT code, name_en, name_jp, rarity, type, language, game, image_url, condition FROM public.cards WHERE UPPER(code) = $1 LIMIT 1",
          [card.code]
        );
        const r = rows[0];
        if (r) exact = { code: r.code, nameEn: r.name_en, nameJp: r.name_jp, rarity: r.rarity, type: r.type, language: r.language, game: r.game, imageUrl: r.image_url, condition: r.condition };
      }
      const terms = [];
      const params = [];
      if (card.nameEn && String(card.nameEn).length >= 3) {
        params.push(`%${String(card.nameEn).trim()}%`);
        terms.push(`name_en ILIKE $${params.length}`);
      }
      const prefix = String(card.code ?? "").match(/^([A-Z]{2,})/i)?.[1];
      if (prefix && prefix.length >= 2) {
        params.push(`${prefix.toUpperCase()}%`);
        terms.push(`UPPER(code) LIKE $${params.length}`);
      }
      let near = [];
      if (terms.length) {
        const { rows } = await client.query(
          `SELECT code, name_en, name_jp, rarity, type, game, image_url FROM public.cards WHERE (${terms.join(" OR ")}) AND UPPER(code) <> $${params.length + 1} LIMIT 6`,
          [...params, String(card.code ?? "").toUpperCase()]
        );
        near = rows.map((r) => ({ code: r.code, nameEn: r.name_en, nameJp: r.name_jp, rarity: r.rarity, type: r.type, game: r.game, imageUrl: r.image_url, source: "catalog" }));
      }
      return { exact, near };
    });
    catalog = enriched.exact;
    nearMatches = enriched.near;
  }
  const seenCodes = /* @__PURE__ */ new Set([String(card.code ?? "").toUpperCase(), ...nearMatches.map((m2) => String(m2.code).toUpperCase())]);
  const candidates = [];
  for (const cand of Array.isArray(card.candidates) ? card.candidates : []) {
    if (candidates.length >= 3) break;
    const code = String(cand?.code ?? "").replace(/\s+/g, "").toUpperCase();
    if (!code || seenCodes.has(code)) continue;
    seenCodes.add(code);
    candidates.push({
      code,
      nameEn: String(cand?.nameEn ?? ""),
      rarity: String(cand?.rarity ?? ""),
      confidence: Math.max(0, Math.min(100, Number(cand?.confidence) || 0)),
      source: "ai"
    });
  }
  if (candidates.length) {
    const codes = candidates.map((cd) => cd.code);
    const catalogRows = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        "SELECT code, name_en, name_jp, rarity, type, game, image_url FROM public.cards WHERE UPPER(code) = ANY($1)",
        [codes]
      );
      return rows;
    });
    for (const cd of candidates) {
      const r = catalogRows.find((row) => String(row.code).toUpperCase() === cd.code);
      if (r) {
        cd.nameEn = cd.nameEn || r.name_en;
        cd.nameJp = r.name_jp;
        cd.rarity = cd.rarity || r.rarity;
        cd.type = r.type;
        cd.game = r.game;
        cd.imageUrl = r.image_url;
      }
    }
  }
  const allCodes = [card.code, ...nearMatches.map((m2) => m2.code), ...candidates.map((cd) => cd.code)].map((cd) => String(cd ?? "").toUpperCase()).filter(Boolean);
  let mainSampleUrl = null;
  if (allCodes.length) {
    const sampleRows = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        `SELECT DISTINCT ON (UPPER(code)) code, image_url FROM public.community_samples
         WHERE UPPER(code) = ANY($1) AND status = 'APPROVED'`,
        [allCodes]
      );
      return rows;
    });
    const fillImage = /* @__PURE__ */ __name((src) => {
      if (!src || src.imageUrl) return;
      const s = sampleRows.find((row) => String(row.code).toUpperCase() === String(src.code ?? "").toUpperCase());
      if (s) src.imageUrl = s.image_url;
    }, "fillImage");
    fillImage(catalog);
    nearMatches.forEach(fillImage);
    candidates.forEach(fillImage);
    mainSampleUrl = sampleRows.find((row) => String(row.code).toUpperCase() === String(card.code ?? "").toUpperCase())?.image_url ?? null;
  }
  const origin = new URL(c.req.url).origin;
  const imageKey = `scans/${tenantId}/${hash2}.jpg`;
  await c.env.IMAGES.put(imageKey, Uint8Array.from(atob(imageB64), (ch) => ch.charCodeAt(0)), {
    httpMetadata: { contentType: mediaType }
  });
  const imageUrl = `${origin}/api/v1/images/${imageKey}`;
  const cardOut = {
    code: card.code,
    nameEn: card.nameEn ?? "",
    nameJp: card.nameJp ?? "",
    rarity: card.rarity ?? "",
    type: card.type ?? "",
    promo: !!card.promo,
    confidence,
    lang,
    reasoning: card.reasoning ?? "",
    // AI-estimated border distribution (centering) — honest label on the UI side
    centering: (() => {
      const ct2 = card.centering;
      if (!ct2 || typeof ct2 !== "object") return null;
      const nums = [ct2.left, ct2.right, ct2.top, ct2.bottom].map((n) => Number(n));
      if (nums.some((n) => !Number.isFinite(n) || n <= 0 || n >= 100)) return null;
      return { left: nums[0], right: nums[1], top: nums[2], bottom: nums[3] };
    })()
  };
  const imageOptions = [{ url: imageUrl, label: "your-photo" }];
  const seenImages = /* @__PURE__ */ new Set([imageUrl]);
  if (mainSampleUrl && !seenImages.has(mainSampleUrl)) {
    seenImages.add(mainSampleUrl);
    imageOptions.push({ url: mainSampleUrl, label: "community" });
  }
  for (const src of [catalog, ...nearMatches, ...candidates]) {
    const u = src?.imageUrl;
    if (u && !seenImages.has(u) && imageOptions.length < 6) {
      seenImages.add(u);
      imageOptions.push({ url: u, label: src?.code ?? "catalog" });
    }
  }
  await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      `INSERT INTO scans (hash, user_id, card, image_url, identified_by, cache_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (hash) DO NOTHING`,
      [hash2, userId, JSON.stringify({ ...cardOut, _extras: { catalog, nearMatches, candidates, imageOptions } }), imageUrl, identifiedBy, CACHE_VERSION]
    );
  });
  return c.json({ ok: true, cached: false, card: cardOut, hash: hash2, imageUrl, identifiedBy, crossCheck, catalog, nearMatches, candidates, imageOptions });
});
var contributeSchema = external_exports.object({
  code: external_exports.string().min(2).max(40),
  game: external_exports.string().default("one-piece"),
  lang: external_exports.string().default("JP"),
  rarity: external_exports.string().max(40).optional(),
  nameEn: external_exports.string().max(200).optional(),
  imageUrl: external_exports.string().url()
});
scanRoutes.post("/scan/contribute", authMiddleware, async (c) => {
  const tenantId = c.get("tenantId");
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json();
  const parsed = contributeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const { code, game, lang, rarity, nameEn, imageUrl } = parsed.data;
  const origin = new URL(c.req.url).origin;
  if (!imageUrl.startsWith(`${origin}/api/v1/images/`)) {
    return c.json({ error: "Only scanned/uploaded images hosted by this app can be contributed" }, 400);
  }
  const normalized = code.replace(/\s+/g, "").toUpperCase();
  const sample = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO public.community_samples (code, game, lang, rarity, name_en, image_url, contributed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code, lang, rarity) DO UPDATE SET
         image_url = EXCLUDED.image_url,
         name_en = EXCLUDED.name_en,
         contributed_by = EXCLUDED.contributed_by,
         created_at = NOW()
       RETURNING id, code, lang, rarity, image_url`,
      [normalized, game, lang.toUpperCase(), rarity || "", nameEn || null, imageUrl, userId]
    );
    return rows[0];
  });
  return c.json({ ok: true, sample });
});

// src/routes/prices.ts
var priceRoutes = new Hono2();
priceRoutes.use("*", optionalAuth);
var EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
var EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
var TCG_CATEGORY = "183454";
var cachedToken = null;
async function getEbayToken(env2) {
  if (cachedToken && Date.now() + 6e4 < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  if (!env2.EBAY_APP_ID || !env2.EBAY_CERT_ID) return null;
  const resp = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env2.EBAY_APP_ID}:${env2.EBAY_CERT_ID}`)}`
    },
    body: "grant_type=client_credentials&scope=" + encodeURIComponent("https://api.ebay.com/oauth/api_scope")
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 7200) * 1e3
  };
  return cachedToken.token;
}
__name(getEbayToken, "getEbayToken");
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a2, b2) => a2 - b2);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 100) / 100;
}
__name(median, "median");
function quartile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== void 0 ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}
__name(quartile, "quartile");
async function fetchUsdToThb() {
  try {
    const resp = await fetch("https://api.frankfurter.app/latest?from=USD&to=THB");
    const json = await resp.json();
    return json.rates?.THB ?? 35;
  } catch {
    return 35;
  }
}
__name(fetchUsdToThb, "fetchUsdToThb");
async function ebaySearch(token, q, fx) {
  const empty = { count: 0, currency: "USD", median: 0, min: 0, max: 0, thb: null, items: [] };
  try {
    const resp = await fetch(
      `${EBAY_SEARCH_URL}?q=${encodeURIComponent(q)}&category_ids=${TCG_CATEGORY}&limit=20`,
      { headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" } }
    );
    if (!resp.ok) return empty;
    const json = await resp.json();
    const summaries = json.itemSummaries ?? [];
    let prices = summaries.map((it2) => parseFloat(it2.price?.value ?? "0")).filter((p2) => p2 > 0);
    if (prices.length >= 6) {
      const sorted = [...prices].sort((a2, b2) => a2 - b2);
      const q1 = quartile(sorted, 0.25);
      const q3 = quartile(sorted, 0.75);
      const iqr = q3 - q1;
      const lo2 = Math.max(1, q1 - 1.5 * iqr);
      const hi = q3 + 1.5 * iqr;
      const filtered = prices.filter((p2) => p2 >= lo2 && p2 <= hi);
      if (filtered.length >= 3) prices = filtered;
    }
    if (!prices.length) return { ...empty, items: summaries.slice(0, 3).map((it2) => ({ title: it2.title, price: parseFloat(it2.price?.value ?? "0"), url: it2.itemWebUrl, thumbnail: it2.thumbnailImages?.[0]?.imageUrl })) };
    const med = median(prices);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      count: prices.length,
      currency: "USD",
      median: med,
      min,
      max,
      thb: { median: Math.round(med * fx), min: Math.round(min * fx), max: Math.round(max * fx), rate: fx },
      items: summaries.slice(0, 3).map((it2) => ({
        title: it2.title,
        price: parseFloat(it2.price?.value ?? "0"),
        url: it2.itemWebUrl,
        thumbnail: it2.thumbnailImages?.[0]?.imageUrl
      }))
    };
  } catch {
    return empty;
  }
}
__name(ebaySearch, "ebaySearch");
priceRoutes.get("/prices", async (c) => {
  const tenantId = c.get("tenantId");
  const code = (c.req.query("code") ?? "").trim();
  const name = (c.req.query("name") ?? "").trim();
  if (!code && !name) {
    return c.json({ error: "code or name required" }, 400);
  }
  const baseQ = [code, name].filter(Boolean).join(" ").slice(0, 100);
  const token = await getEbayToken(c.env);
  const fx = await fetchUsdToThb();
  const [sws, rawSearch, psa10Search, psa9Search] = await Promise.all([
    withTenant(c.env, tenantId, async (client) => {
      if (!code) return { count: 0, floor: null, listings: [] };
      const { rows } = await client.query(
        `SELECT l.listing_id, l.price, l.condition, l.title
         FROM listings l
         LEFT JOIN vault_items v ON l.item_id = v.id
         WHERE l.status = 'ACTIVE' AND (UPPER(v.sku) = UPPER($1) OR UPPER(l.title) ILIKE '%' || UPPER($1) || '%')
         ORDER BY l.price ASC
         LIMIT 10`,
        [code]
      );
      return {
        count: rows.length,
        floor: rows[0]?.price ?? null,
        listings: rows.map((r) => ({ listingId: r.listing_id, price: r.price, condition: r.condition, title: r.title }))
      };
    }),
    token ? ebaySearch(token, `${baseQ} -psa -bgs -cgc -graded`, fx) : Promise.resolve(null),
    token ? ebaySearch(token, `${baseQ} PSA 10`, fx) : Promise.resolve(null),
    token ? ebaySearch(token, `${baseQ} PSA 9`, fx) : Promise.resolve(null)
  ]);
  const ebay = rawSearch ?? { count: 0, currency: "USD", items: [] };
  const tiers = {
    raw: rawSearch && rawSearch.count ? { count: rawSearch.count, usd: { median: rawSearch.median, min: rawSearch.min, max: rawSearch.max }, thb: rawSearch.thb } : null,
    psa10: psa10Search && psa10Search.count ? { count: psa10Search.count, usd: { median: psa10Search.median, min: psa10Search.min, max: psa10Search.max }, thb: psa10Search.thb } : null,
    psa9: psa9Search && psa9Search.count ? { count: psa9Search.count, usd: { median: psa9Search.median, min: psa9Search.min, max: psa9Search.max }, thb: psa9Search.thb } : null
  };
  return c.json({ ok: true, query: { code, name }, sws, ebay, tiers });
});
priceRoutes.get("/cards/variants", async (c) => {
  const code = (c.req.query("code") ?? "").trim();
  if (!code) return c.json({ error: "code required" }, 400);
  const variants = await withTenant(c.env, c.get("tenantId"), async (client) => {
    const { rows } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, language, game, image_url, condition
       FROM public.cards WHERE UPPER(code) = UPPER($1) LIMIT 20`,
      [code]
    );
    return rows.map((r) => ({
      code: r.code,
      nameEn: r.name_en,
      nameJp: r.name_jp,
      rarity: r.rarity,
      type: r.type,
      language: r.language,
      game: r.game,
      imageUrl: r.image_url,
      condition: r.condition
    }));
  });
  return c.json({ ok: true, variants });
});

// src/routes/scanner.ts
var scannerRoutes = new Hono2();
scannerRoutes.use("*", authMiddleware);
var HEALTH_TIMEOUT_MS = 3e3;
var PROXY_TIMEOUT_MS = 5e3;
function scannerBase(env2) {
  const raw2 = env2.SCANNER_SERVICE_URL?.trim();
  if (!raw2) return null;
  return raw2.replace(/\/+$/, "");
}
__name(scannerBase, "scannerBase");
async function fetchJson(url, timeoutMs) {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}
__name(fetchJson, "fetchJson");
function absolutize(imageUrl, origin) {
  if (typeof imageUrl !== "string" || !imageUrl) return void 0;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${origin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}
__name(absolutize, "absolutize");
scannerRoutes.get("/scanner/health", async (c) => {
  const base = scannerBase(c.env);
  if (!base) {
    return c.json({ ok: true, scanner: { configured: false, ready: false } });
  }
  try {
    const resp = await fetch(`${base}/readyz`, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    return c.json({ ok: true, scanner: { configured: true, ready: resp.ok } });
  } catch {
    return c.json({ ok: true, scanner: { configured: true, ready: false } });
  }
});
scannerRoutes.get("/scanner/op-details", async (c) => {
  const code = (c.req.query("code") ?? "").trim();
  if (!code) return c.json({ error: "code required" }, 400);
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, details: null });
  const json = await fetchJson(`${base}/v1/op-details?code=${encodeURIComponent(code)}`, PROXY_TIMEOUT_MS);
  if (!json) return c.json({ ok: true, configured: true, details: null });
  const d2 = json?.details ?? json;
  const details = {
    officialImageUrl: d2?.officialImageUrl,
    officialName: d2?.officialName,
    officialSetName: d2?.officialSetName,
    officialReleaseDate: d2?.officialReleaseDate,
    sampleImageUrl: d2?.sampleImageUrl,
    watermarkedSampleUrl: d2?.watermarkedSampleUrl
  };
  const hasAny = Object.values(details).some((v2) => typeof v2 === "string" && v2.length > 0);
  return c.json({ ok: true, configured: true, details: hasAny ? details : null });
});
scannerRoutes.get("/scanner/op-variants", async (c) => {
  const code = (c.req.query("code") ?? "").trim();
  if (!code) return c.json({ error: "code required" }, 400);
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, variants: [] });
  const json = await fetchJson(`${base}/v1/op-variants?code=${encodeURIComponent(code)}`, PROXY_TIMEOUT_MS);
  const arr = Array.isArray(json?.variants) ? json.variants : [];
  const variants = arr.map((v2) => ({
    code: String(v2?.code ?? v2?.variantCode ?? ""),
    name: String(v2?.name ?? v2?.variantName ?? ""),
    rarity: String(v2?.rarity ?? ""),
    imageUrl: typeof v2?.imageUrl === "string" ? v2.imageUrl : null,
    source: "scanner"
  }));
  return c.json({ ok: true, configured: true, variants });
});
scannerRoutes.get("/scanner/sample-catalogs", async (c) => {
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, catalogs: [] });
  const [don, cn] = await Promise.all([
    fetchJson(`${base}/v1/don-cards`, PROXY_TIMEOUT_MS),
    fetchJson(`${base}/v1/cn-anniv-cards`, PROXY_TIMEOUT_MS)
  ]);
  const catalogs = [];
  const donItems = normalizeItems(don?.items, base);
  if (donItems) {
    catalogs.push({ id: "don", title: "DON!! Official Samples", count: don?.count ?? donItems.length, items: donItems });
  }
  const cnItems = normalizeItems(cn?.items, base);
  if (cnItems) {
    catalogs.push({ id: "cn-anniv", title: "CN 1st Anniversary Samples", count: cn?.count ?? cnItems.length, items: cnItems });
  }
  return c.json({ ok: true, configured: true, catalogs });
});
function normalizeItems(items, origin) {
  if (!Array.isArray(items)) return null;
  return items.map((it2) => ({
    id: String(it2?.id ?? ""),
    imageUrl: absolutize(it2?.imageUrl, origin) ?? "",
    name: typeof it2?.name === "string" && it2.name ? it2.name : void 0,
    rarity: typeof it2?.rarity === "string" && it2.rarity ? it2.rarity : void 0,
    variant: typeof it2?.variant === "string" && it2.variant ? it2.variant : void 0,
    setCode: it2?.setCode ?? void 0
  }));
}
__name(normalizeItems, "normalizeItems");
scannerRoutes.post("/scanner/visual-match", async (c) => {
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, result: null });
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid json" }, 400);
  }
  if (!body?.image || !Array.isArray(body?.candidates) || body.candidates.length === 0) {
    return c.json({ error: "image and candidates required" }, 400);
  }
  let json;
  try {
    const resp = await fetch(`${base}/v1/visual-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25e3)
    });
    if (!resp.ok) return c.json({ ok: true, configured: true, result: null });
    json = await resp.json();
  } catch {
    return c.json({ ok: true, configured: true, result: null });
  }
  if (!json) return c.json({ ok: true, configured: true, result: null });
  const normalizeCandidate = /* @__PURE__ */ __name((cand) => ({
    id: String(cand?.id ?? ""),
    imageUrl: typeof cand?.imageUrl === "string" ? cand.imageUrl : void 0,
    matchScore: typeof cand?.matchScore === "number" ? cand.matchScore : 0,
    matched: !!cand?.matched
  }), "normalizeCandidate");
  const result = {
    ok: !!json.ok,
    degraded: !!json.degraded,
    mode: String(json.mode ?? ""),
    confident: !!json.confident,
    bestMatchUrl: typeof json.bestMatchUrl === "string" ? json.bestMatchUrl : void 0,
    candidates: Array.isArray(json.candidates) ? json.candidates.map(normalizeCandidate) : void 0,
    bestMatch: json.bestMatch ? normalizeCandidate(json.bestMatch) : void 0,
    haikuConfirmation: json.haikuConfirmation ? {
      matchId: String(json.haikuConfirmation.matchId ?? ""),
      confidence: typeof json.haikuConfirmation.confidence === "number" ? json.haikuConfirmation.confidence : 0
    } : void 0,
    labels: Array.isArray(json.labels) ? json.labels : void 0,
    webEntities: Array.isArray(json.webEntities) ? json.webEntities : void 0,
    counts: json.counts ?? void 0,
    reason: typeof json.reason === "string" ? json.reason : void 0
  };
  return c.json({ ok: true, configured: true, result });
});

// src/routes/catalog.ts
var catalogRoutes = new Hono2();
var MAX_PAGE_SIZE = 60;
var cardsQuerySchema = external_exports.object({
  game: external_exports.string().trim().max(50).optional(),
  q: external_exports.string().trim().max(100).optional(),
  rarity: external_exports.string().trim().max(40).optional(),
  page: external_exports.coerce.number().int().min(1).default(1),
  pageSize: external_exports.coerce.number().int().min(1).default(24)
});
function mapCard(r) {
  return {
    code: r.code,
    nameEn: r.name_en,
    nameJp: r.name_jp,
    rarity: r.rarity,
    type: r.type,
    game: r.game,
    imageUrl: r.image_url
  };
}
__name(mapCard, "mapCard");
catalogRoutes.get("/catalog/games", async (c) => {
  const games = await withTenant(c.env, c.get("tenantId"), async (client) => {
    const { rows } = await client.query(
      `SELECT game, COUNT(*)::int AS count FROM public.cards GROUP BY game ORDER BY count DESC, game ASC`
    );
    return rows.map((r) => ({ game: r.game, count: r.count }));
  });
  return c.json({ ok: true, games });
});
catalogRoutes.get("/catalog/cards", async (c) => {
  const parsed = cardsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "Invalid query", details: parsed.error.flatten() }, 400);
  }
  const { game, q, rarity, page } = parsed.data;
  const pageSize = Math.min(parsed.data.pageSize, MAX_PAGE_SIZE);
  const conditions = [];
  const params = [];
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(code ILIKE $${params.length} OR name_en ILIKE $${params.length})`);
  }
  if (game) {
    params.push(game);
    conditions.push(`game ILIKE $${params.length}`);
  }
  if (rarity) {
    params.push(rarity);
    conditions.push(`rarity ILIKE $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await withTenant(c.env, c.get("tenantId"), async (client) => {
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*)::int AS total FROM public.cards ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;
    const { rows } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, game, image_url
       FROM public.cards ${where}
       ORDER BY code ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize]
    );
    return { total, cards: rows.map(mapCard) };
  });
  return c.json({ ok: true, total: result.total, page, pageSize, cards: result.cards });
});
catalogRoutes.get("/catalog/cards/:code", async (c) => {
  const code = (c.req.param("code") ?? "").trim();
  if (!code) return c.json({ error: "code required" }, 400);
  const rows = await withTenant(c.env, c.get("tenantId"), async (client) => {
    const { rows: rows2 } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, game, image_url
       FROM public.cards WHERE UPPER(code) = UPPER($1)
       ORDER BY rarity ASC, language ASC
       LIMIT 20`,
      [code]
    );
    return rows2;
  });
  const card = rows.length ? mapCard(rows[0]) : null;
  const variants = rows.map((r) => ({
    code: r.code,
    nameEn: r.name_en,
    rarity: r.rarity,
    type: r.type,
    imageUrl: r.image_url
  }));
  return c.json({ ok: true, card, variants });
});

// src/index.ts
var app = new Hono2();
function getCorsOrigins(env2) {
  const envVar = env2.CORS_ALLOWED_ORIGINS;
  const defaultOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "https://swibswap.app", "https://www.swibswap.app", "https://*.vercel.app", "https://sws-demo-nine.vercel.app"];
  if (!envVar || envVar.trim() === "") {
    if (env2.ENVIRONMENT !== "production") {
      return "*";
    }
    return defaultOrigins;
  }
  return envVar.split(",").map((o) => o.trim()).filter((o) => o.length > 0);
}
__name(getCorsOrigins, "getCorsOrigins");
app.use("*", logger());
app.use("*", (c, next) => {
  const origins = getCorsOrigins(c.env);
  return cors({
    origin: origins,
    allowHeaders: ["Content-Type", "Authorization", "X-Tenant-ID"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  })(c, next);
});
app.use("*", tenantMiddleware);
app.get("/health", (c) => c.json({ status: "ok", env: c.env.ENVIRONMENT }));
app.route("/api/v1", authRoutes);
app.route("/api/v1/vault", vaultRoutes);
app.route("/api/v1/market", marketRoutes);
app.route("/api/v1/orders", orderRoutes);
app.route("/api/v1/offers", offerRoutes);
app.route("/api/v1", miscRoutes);
app.route("/api/v1", uploadRoutes);
app.route("/api/v1", storeRoutes);
app.route("/api/v1", scanRoutes);
app.route("/api/v1", priceRoutes);
app.route("/api/v1", scannerRoutes);
app.route("/api/v1", catalogRoutes);
app.route("/api/v1", serviceRoutes);
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error", message: err.message }, 500);
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-CnK1Dv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-CnK1Dv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
//# sourceMappingURL=index.js.map
