var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * This decorator will mark given property as bindable, it will define
 * getter and setter, and in the setter, it will refresh the property.
 *
 *      class Customer{
 *
 *          @bindableProperty
 *          firstName:string;
 *
 *      }
 *
 * @param {*} target
 * @param {string} key
 */
function bindableProperty(target, key) {
    var Atom = window["Atom"];
    // property value
    var _val = this[key];
    var keyName = "_" + key;
    this[keyName] = _val;
    //debugger;
    // property getter
    var getter = function () {
        //console.log(`Get: ${key} => ${_val}`);
        return this[keyName];
    };
    // property setter
    var setter = function (newVal) {
        //console.log(`Set: ${key} => ${newVal}`);
        //debugger;
        this[keyName] = newVal;
        Atom.refresh(this, key);
        if (this.onPropertyChanged) {
            this.onPropertyChanged(key);
        }
    };
    // Delete property.
    if (delete this[key]) {
        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
}
var WebAtoms;
(function (WebAtoms) {
    var Atom = window["Atom"];
    /**
     *
     *
     * @export
     * @class CancelToken
     */
    var CancelToken = /** @class */ (function () {
        function CancelToken() {
            this.listeners = [];
        }
        Object.defineProperty(CancelToken.prototype, "cancelled", {
            get: function () {
                return this._cancelled;
            },
            enumerable: true,
            configurable: true
        });
        CancelToken.prototype.cancel = function () {
            this._cancelled = true;
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var fx = _a[_i];
                fx();
            }
        };
        CancelToken.prototype.reset = function () {
            this._cancelled = false;
            this.listeners.length = 0;
        };
        CancelToken.prototype.registerForCancel = function (f) {
            if (this._cancelled) {
                f();
                this.cancel();
                return;
            }
            this.listeners.push(f);
        };
        return CancelToken;
    }());
    WebAtoms.CancelToken = CancelToken;
    var AtomModel = /** @class */ (function () {
        function AtomModel() {
        }
        AtomModel.prototype.refresh = function (name) {
            Atom.refresh(this, name);
        };
        return AtomModel;
    }());
    WebAtoms.AtomModel = AtomModel;
    /**
     * Though you can directly call methods of view model in binding expression,
     * but we recommend using AtomCommand for two reasons.
     *
     * First one, it has enabled bindable property, which can be used to enable/disable UI.
     * AtomButton already has `command` and `commandParameter` property which automatically
     * binds execution and disabling the UI.
     *
     * Second one, it has busy bindable property, which can be used to display a busy indicator
     * when corresponding action is a promise and it is yet not resolved.
     *
     * @export
     * @class AtomCommand
     * @extends {AtomModel}
     * @template T
     */
    var AtomCommand = /** @class */ (function (_super) {
        __extends(AtomCommand, _super);
        function AtomCommand(action) {
            var _this = _super.call(this) || this;
            _this.isMVVMAtomCommand = true;
            _this._enabled = true;
            _this._busy = false;
            _this.action = action;
            var self = _this;
            _this.execute = function (p) {
                if (_this.enabled) {
                    _this.executeAction(p);
                }
            };
            return _this;
        }
        Object.defineProperty(AtomCommand.prototype, "enabled", {
            /**
             *
             *
             * @type {boolean}
             * @memberof AtomCommand
             */
            get: function () {
                return this._enabled;
            },
            set: function (v) {
                this._enabled = v;
                this.refresh("enabled");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AtomCommand.prototype, "busy", {
            /**
             *
             *
             * @type {boolean}
             * @memberof AtomCommand
             */
            get: function () {
                return this._busy;
            },
            set: function (v) {
                this._busy = v;
                this.refresh("busy");
            },
            enumerable: true,
            configurable: true
        });
        AtomCommand.prototype.executeAction = function (p) {
            var _this = this;
            if (this._busy)
                return;
            this.busy = true;
            var result = this.action(p);
            if (result) {
                if (result.catch) {
                    result.catch(function (error) {
                        _this.busy = false;
                        if (error !== 'cancelled') {
                            console.error(error);
                            Atom.showError(error);
                        }
                    });
                    return;
                }
                if (result.then) {
                    result.then(function () {
                        _this.busy = false;
                    });
                    return;
                }
            }
            this.busy = false;
        };
        return AtomCommand;
    }(AtomModel));
    WebAtoms.AtomCommand = AtomCommand;
})(WebAtoms || (WebAtoms = {}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var WebAtoms;
(function (WebAtoms) {
    var Atom = window["Atom"];
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];
    /**
     * DisposableAction holds an action that
     * will be executed when dispose will be called.
     *
     *      subscribe(m,f):AtomDisposable{
     *          //...
     *          //subscribe to something...
     *          //...
     *          return new AtomDisposable(()=>{
     *
     *              //...
     *              //unsubscribe from something
     *              //
     *
     *          });
     *      }
     *
     * User can simply call dispose to make sure subscription was unsubscribed.
     *
     * @export
     * @class DisposableAction
     * @implements {AtomDisposable}
     */
    var DisposableAction = /** @class */ (function () {
        function DisposableAction(f) {
            this.f = f;
        }
        DisposableAction.prototype.dispose = function () {
            this.f();
        };
        return DisposableAction;
    }());
    WebAtoms.DisposableAction = DisposableAction;
    var AtomUI = window["AtomUI"];
    var oldCreateControl = AtomUI.createControl;
    AtomUI.createControl = function (element, type, data, newScope) {
        if (type) {
            if (type.constructor === String || (typeof type) === 'string') {
                var t = WebAtoms[type] || Atom.get(window, type);
                if (t) {
                    type = t;
                }
            }
        }
        return oldCreateControl.call(Atom, element, type, data, newScope);
    };
    Atom.using = function (d, f) {
        try {
            f();
        }
        finally {
            d.dispose();
        }
    };
    Atom.usingAsync = function (d, f) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, f()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        d.dispose();
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Atom.watch = function (item, property, f) {
        AtomBinder.add_WatchHandler(item, property, f);
        return new DisposableAction(function () {
            AtomBinder.remove_WatchHandler(item, property, f);
        });
    };
    Atom.delay = function (n, ct) {
        return new Promise(function (resolve, reject) {
            var t = setTimeout(function () {
                resolve();
            }, (n));
            if (ct) {
                ct.registerForCancel(function () {
                    clearTimeout(t);
                    reject("cancelled");
                });
            }
        });
    };
    var AtomHandler = /** @class */ (function () {
        function AtomHandler(message) {
            this.message = message;
            this.list = new Array();
        }
        return AtomHandler;
    }());
    var AtomMessageAction = /** @class */ (function () {
        function AtomMessageAction(msg, a) {
            this.message = msg;
            this.action = a;
        }
        return AtomMessageAction;
    }());
    WebAtoms.AtomMessageAction = AtomMessageAction;
    /**
     * Device (usually browser), instance of which supports
     * singleton instance to provide broadcast/messaging
     *
     * @export
     * @class AtomDevice
     */
    var AtomDevice = /** @class */ (function () {
        function AtomDevice() {
            this.bag = {};
        }
        /**
         * This method will run any asynchronous method
         * and it will display an error if it will fail
         * asynchronously
         *
         * @template T
         * @param {() => Promise<T>} tf
         * @memberof AtomDevice
         */
        AtomDevice.prototype.runAsync = function (tf) {
            var task = tf();
            task.catch(function (error) {
                console.error(error);
                Atom.showError(error);
            });
            task.then(function () { });
        };
        /**
         * Broadcast given data to channel, only within the current window.
         *
         * @param {string} channel
         * @param {*} data
         * @returns
         * @memberof AtomDevice
         */
        AtomDevice.prototype.broadcast = function (channel, data) {
            var ary = this.bag[channel];
            if (!ary)
                return;
            for (var _i = 0, _a = ary.list; _i < _a.length; _i++) {
                var entry = _a[_i];
                entry.call(this, channel, data);
            }
        };
        /**
         * Subscribe for given channel with action that will be
         * executed when anyone will broadcast (this only works within the
         * current browser window)
         *
         * This method returns a disposable, when you call `.dispose()` it will
         * unsubscribe for current subscription
         *
         * @param {string} channel
         * @param {AtomAction} action
         * @returns {AtomDisposable} Disposable that supports removal of subscription
         * @memberof AtomDevice
         */
        AtomDevice.prototype.subscribe = function (channel, action) {
            var _this = this;
            var ary = this.bag[channel];
            if (!ary) {
                ary = new AtomHandler(channel);
                this.bag[channel] = ary;
            }
            ary.list.push(action);
            return new DisposableAction(function () {
                ary.list = ary.list.filter(function (a) { return a !== action; });
                if (!ary.list.length) {
                    _this.bag[channel] = null;
                }
            });
        };
        /**
         *
         *
         * @static
         * @type {AtomDevice}
         * @memberof AtomDevice
         */
        AtomDevice.instance = new AtomDevice();
        return AtomDevice;
    }());
    WebAtoms.AtomDevice = AtomDevice;
})(WebAtoms || (WebAtoms = {}));
var WebAtoms;
(function (WebAtoms) {
    var AtomBinder = window["AtomBinder"];
    var AtomPromise = window["AtomPromise"];
    /**
     *
     *
     * @export
     * @class AtomList
     * @extends {Array<T>}
     * @template T
     */
    var AtomList = /** @class */ (function (_super) {
        __extends(AtomList, _super);
        function AtomList() {
            var _this = _super.call(this) || this;
            _this["__proto__"] = AtomList.prototype;
            return _this;
        }
        AtomList.prototype.add = function (item) {
            var i = this.length;
            var n = this.push(item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
            return n;
        };
        AtomList.prototype.addAll = function (items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                var i = this.length;
                this.push(item);
                AtomBinder.invokeItemsEvent(this, "add", i, item);
                Atom.refresh(this, "length");
            }
        };
        AtomList.prototype.insert = function (i, item) {
            var n = this.splice(i, 0, item);
            AtomBinder.invokeItemsEvent(this, "add", i, item);
            Atom.refresh(this, "length");
        };
        AtomList.prototype.removeAt = function (i) {
            var item = this[i];
            this.splice(i, 1);
            AtomBinder.invokeItemsEvent(this, "remove", i, item);
            Atom.refresh(this, "length");
        };
        AtomList.prototype.remove = function (item) {
            var n = this.indexOf(item);
            if (n != -1) {
                this.removeAt(n);
            }
        };
        AtomList.prototype.clear = function () {
            this.length = 0;
            this.refresh();
        };
        AtomList.prototype.refresh = function () {
            AtomBinder.invokeItemsEvent(this, "refresh", -1, null);
            Atom.refresh(this, "length");
        };
        AtomList.prototype.watch = function (f) {
            var _this = this;
            AtomBinder.add_CollectionChanged(this, f);
            return new WebAtoms.DisposableAction(function () {
                AtomBinder.remove_CollectionChanged(_this, f);
            });
        };
        return AtomList;
    }(Array));
    WebAtoms.AtomList = AtomList;
})(WebAtoms || (WebAtoms = {}));
/// <reference path="atom-device.ts"/>
/// <reference path="atom-command.ts"/>
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class AtomViewModel
     * @extends {AtomModel}
     */
    var AtomViewModel = /** @class */ (function (_super) {
        __extends(AtomViewModel, _super);
        function AtomViewModel() {
            var _this = _super.call(this) || this;
            _this._isReady = false;
            _this.validations = [];
            WebAtoms.AtomDevice.instance.runAsync(function () { return _this.privateInit(); });
            return _this;
        }
        Object.defineProperty(AtomViewModel.prototype, "isReady", {
            get: function () {
                return this._isReady;
            },
            enumerable: true,
            configurable: true
        });
        AtomViewModel.prototype.privateInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // this is necessary for derived class initialization
                        return [4 /*yield*/, Atom.delay(1)];
                        case 1:
                            // this is necessary for derived class initialization
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, , 4, 5]);
                            return [4 /*yield*/, this.init()];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            this.registerWatchers();
                            return [7 /*endfinally*/];
                        case 5:
                            this.onReady();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AtomViewModel.prototype.onReady = function () {
        };
        AtomViewModel.prototype.registerWatchers = function () {
            try {
                var v = this.constructor.prototype;
                if (v && v._$_autoWatchers) {
                    var aw = v._$_autoWatchers;
                    for (var key in aw) {
                        if (!aw.hasOwnProperty(key))
                            continue;
                        var vf = aw[key];
                        if (vf.validate) {
                            this.addValidation(vf.method);
                        }
                        else {
                            this.watch(vf.method);
                        }
                    }
                }
            }
            catch (e) {
                console.error("View Model watcher registration failed");
                console.error(e);
            }
            this._isReady = true;
        };
        /**
         * Internal method, do not use, instead use errors.hasErrors()
         *
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.validate = function () {
            for (var _i = 0, _a = this.validations; _i < _a.length; _i++) {
                var v = _a[_i];
                v.evaluate(true);
            }
        };
        /**
         * Adds validation expression to be executed when any bindable expression is updated.
         *
         * `target` must always be set to `this`.
         *
         *      this.addValidation(() => {
         *          this.errors.nameError = this.data.firstName ? "" : "Name cannot be empty";
         *      });
         *
         * Only difference here is, validation will not kick in first time, where else watch will
         * be invoked as soon as it is setup.
         *
         * Validation will be invoked when any bindable property in given expression is updated.
         *
         * Validation can be invoked explicitly only by calling `errors.hasErrors()`.
         *
         * @protected
         * @template T
         * @param {() => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.addValidation = function () {
            var _this = this;
            var fts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fts[_i] = arguments[_i];
            }
            var ds = [];
            for (var _a = 0, fts_1 = fts; _a < fts_1.length; _a++) {
                var ft = fts_1[_a];
                var d = new WebAtoms.AtomWatcher(this, ft, true);
                this.validations.push(d);
                this.registerDisposable(d);
                ds.push(d);
            }
            return new WebAtoms.DisposableAction(function () {
                _this.disposables = _this.disposables.filter(function (f) { return !ds.find(function (fd) { return f == fd; }); });
                for (var _i = 0, ds_1 = ds; _i < ds_1.length; _i++) {
                    var dispsoable = ds_1[_i];
                    dispsoable.dispose();
                }
            });
        };
        /**
         * Execute given expression whenever any bindable expression changes
         * in the expression.
         *
         * For correct generic type resolution, target must always be `this`.
         *
         *      this.watch(() => {
         *          if(!this.data.fullName){
         *              this.data.fullName = `${this.data.firstName} ${this.data.lastName}`;
         *          }
         *      });
         *
         * @protected
         * @template T
         * @param {() => any} ft
         * @returns {AtomDisposable}
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.watch = function () {
            var _this = this;
            var fts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                fts[_i] = arguments[_i];
            }
            var dfd = [];
            for (var _a = 0, fts_2 = fts; _a < fts_2.length; _a++) {
                var ft = fts_2[_a];
                var d = new WebAtoms.AtomWatcher(this, ft);
                this.registerDisposable(d);
                dfd.push(d);
            }
            return new WebAtoms.DisposableAction(function () {
                _this.disposables = _this.disposables.filter(function (f) { return !dfd.find(function (fd) { return f == fd; }); });
                for (var _i = 0, dfd_1 = dfd; _i < dfd_1.length; _i++) {
                    var disposable = dfd_1[_i];
                    disposable.dispose();
                }
            });
        };
        /**
         * Register a disposable to be disposed when view model will be disposed.
         *
         * @protected
         * @param {AtomDisposable} d
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.registerDisposable = function (d) {
            this.disposables = this.disposables || [];
            this.disposables.push(d);
        };
        AtomViewModel.prototype.onPropertyChanged = function (name) {
        };
        /**
         * Register listener for given message.
         *
         * @protected
         * @template T
         * @param {string} msg
         * @param {(data: T) => void} a
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.onMessage = function (msg, a) {
            var action = function (m, d) {
                a(d);
            };
            var sub = WebAtoms.AtomDevice.instance.subscribe(msg, action);
            this.registerDisposable(sub);
        };
        /**
         * Broadcast given data to channel (msg)
         *
         * @param {string} msg
         * @param {*} data
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.broadcast = function (msg, data) {
            WebAtoms.AtomDevice.instance.broadcast(msg, data);
        };
        /**
         * Put your asynchronous initializations here
         *
         * @returns {Promise<any>}
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        /**
         * dispose method will becalled when attached view will be disposed or
         * when a new view model will be assigned to view, old view model will be disposed.
         *
         * @memberof AtomViewModel
         */
        AtomViewModel.prototype.dispose = function () {
            if (this.disposables) {
                for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
                    var d = _a[_i];
                    d.dispose();
                }
            }
        };
        return AtomViewModel;
    }(WebAtoms.AtomModel));
    WebAtoms.AtomViewModel = AtomViewModel;
    /**
     * This view model should be used with WindowService to create and open window.
     *
     * This view model has `close` and `cancel` methods. `close` method will
     * close the window and will resolve the given result in promise. `cancel`
     * will reject the given promise.
     *
     * @example
     *
     *      var windowService = WebAtoms.DI.resolve(WindowService);
     *      var result = await
     *          windowService.openWindow(
     *              "Namespace.WindowName",
     *              new WindowNameViewModel());
     *
     *
     *
    *      class NewTaskWindowViewModel extends AtomWindowViewModel{
    *
    *          ....
    *          save(){
    *
    *              // close and send result
    *              this.close(task);
    *
    *          }
    *          ....
    *
    *      }
    *
    * @export
    * @class AtomWindowViewModel
    * @extends {AtomViewModel}
    */
    var AtomWindowViewModel = /** @class */ (function (_super) {
        __extends(AtomWindowViewModel, _super);
        function AtomWindowViewModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * This will broadcast `atom-window-close:windowName`.
         * WindowService will close the window on receipt of such message and
         * it will resolve the promise with given result.
         *
         *      this.close(someResult);
         *
         * @param {*} [result]
         * @memberof AtomWindowViewModel
         */
        AtomWindowViewModel.prototype.close = function (result) {
            this.broadcast("atom-window-close:" + this.windowName, result);
        };
        /**
         * This will broadcast `atom-window-cancel:windowName`
         * WindowService will cancel the window on receipt of such message and
         * it will reject the promise with "cancelled" message.
         *
         *      this.cancel();
         *
         * @memberof AtomWindowViewModel
         */
        AtomWindowViewModel.prototype.cancel = function () {
            this.broadcast("atom-window-cancel:" + this.windowName, null);
        };
        return AtomWindowViewModel;
    }(AtomViewModel));
    WebAtoms.AtomWindowViewModel = AtomWindowViewModel;
})(WebAtoms || (WebAtoms = {}));
function watch(target, key, descriptor) {
    var v = target;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = {
        method: descriptor.value
    };
}
function validate(target, key, descriptor) {
    var v = target;
    v._$_autoWatchers = v._$_autoWatchers || {};
    v._$_autoWatchers[key] = descriptor.value;
    v._$_autoWatchers[key] = {
        method: descriptor.value,
        validate: true
    };
}
var WebAtoms;
(function (WebAtoms) {
    function parsePath(f) {
        var str = f.toString().trim();
        // remove last }
        if (str.endsWith("}")) {
            str = str.substr(0, str.length - 1);
        }
        if (str.startsWith("function (")) {
            str = str.substr("function (".length);
        }
        if (str.startsWith("function(")) {
            str = str.substr("function(".length);
        }
        str = str.trim();
        var index = str.indexOf(")");
        var isThis = index == 0;
        var p = index == 0 ? "\_this|this" : str.substr(0, index);
        str = str.substr(index + 1);
        var regExp = "(?:(" + p + ")(?:.[a-zA-Z_][a-zA-Z_0-9.]*)+)";
        var re = new RegExp(regExp, "gi");
        var path = [];
        var ms = str.replace(re, function (m) {
            //console.log(`m: ${m}`);
            var px = m;
            if (px.startsWith("this.")) {
                px = px.substr(5);
            }
            else if (px.startsWith("_this.")) {
                px = px.substr(6);
            }
            else {
                px = px.substr(p.length + 1);
            }
            //console.log(px);
            if (!path.find(function (y) { return y == px; })) {
                path.push(px);
            }
            return m;
        });
        //debugger;
        return path;
    }
    /**
     * AtomErrors class holds all validation errors registered in view model.
     *
     * hasErrors() method will return true if there are any validation errors in this AtomErrors object.
     *
     * @export
     * @class AtomErrors
     */
    var AtomErrors = /** @class */ (function () {
        /**
         * Creates an instance of AtomErrors.
         * @param {AtomViewModel} target
         * @memberof AtomErrors
         */
        function AtomErrors(target) {
            this.__target = target;
        }
        /**
         *
         *
         * @returns {boolean}
         * @memberof AtomErrors
         */
        AtomErrors.prototype.hasErrors = function () {
            if (this.__target) {
                this.__target.validate();
            }
            for (var k in this) {
                if (AtomErrors.isInternal.test(k))
                    continue;
                if (this.hasOwnProperty(k)) {
                    if (this[k])
                        return true;
                }
            }
            return false;
        };
        /**
         *
         *
         * @memberof AtomErrors
         */
        AtomErrors.prototype.clear = function () {
            for (var k in this) {
                if (AtomErrors.isInternal.test(k))
                    continue;
                if (this.hasOwnProperty(k)) {
                    this[k] = null;
                    Atom.refresh(this, k);
                }
            }
        };
        AtomErrors.isInternal = /^\_(\_target|\$\_)/;
        return AtomErrors;
    }());
    WebAtoms.AtomErrors = AtomErrors;
    var ObjectProperty = /** @class */ (function () {
        function ObjectProperty(name) {
            this.name = name;
        }
        ObjectProperty.prototype.toString = function () {
            return this.name;
        };
        return ObjectProperty;
    }());
    WebAtoms.ObjectProperty = ObjectProperty;
    /**
     *
     *
     * @export
     * @class AtomWatcher
     * @implements {AtomDisposable}
     * @template T
     */
    var AtomWatcher = /** @class */ (function () {
        /**
         * Creates an instance of AtomWatcher.
         *
         *      var w = new AtomWatcher(this, x => x.data.fullName = `${x.data.firstName} ${x.data.lastName}`);
         *
         * You must dispose `w` in order to avoid memory leaks.
         * Above method will set fullName whenver, data or its firstName,lastName property is modified.
         *
         * AtomWatcher will assign null if any expression results in null in single property path.
         *
         * In order to avoid null, you can rewrite above expression as,
         *
         *      var w = new AtomWatcher(this,
         *                  x => {
         *                      if(x.data.firstName && x.data.lastName){
         *                        x.data.fullName = `${x.data.firstName} ${x.data.lastName}`
         *                      }
         *                  });
         *
         * @param {T} target - Target on which watch will be set to observe given set of properties
         * @param {(string[] | ((x:T) => any))} path - Path is either lambda expression or array of property path to watch, if path was lambda, it will be executed when any of members will modify
         * @param {boolean} [forValidation] forValidtion - Ignore, used for internal purpose
         * @memberof AtomWatcher
         */
        function AtomWatcher(target, path, forValidation) {
            this._isExecuting = false;
            this.target = target;
            var e = false;
            if (forValidation === true) {
                this.forValidation = true;
            }
            if (path instanceof Function) {
                var f = path;
                path = parsePath(path);
                e = true;
                this.func = f;
            }
            this.path = path.map(function (x) { return x.split(".").map(function (y) { return new ObjectProperty(y); }); });
            if (e) {
                this.evaluate();
            }
        }
        /**
         *
         *
         * @param {boolean} [force]
         * @returns {*}
         * @memberof AtomWatcher
         */
        AtomWatcher.prototype.evaluate = function (force) {
            var _this = this;
            if (this._isExecuting)
                return;
            this._isExecuting = true;
            try {
                var values = this.path.map(function (p) {
                    var t = _this.target;
                    return p.map(function (op) {
                        var tx = t;
                        t = Atom.get(t, op.name);
                        if (t !== op.target) {
                            if (op.watcher) {
                                op.watcher.dispose();
                                op.watcher = null;
                            }
                            op.target = t;
                        }
                        if (tx) {
                            if (!op.watcher) {
                                if (typeof tx == "object") {
                                    op.watcher = Atom.watch(tx, op.name, function () {
                                        //console.log(`${op.name} modified`);
                                        _this.evaluate();
                                    });
                                }
                            }
                        }
                        return t;
                    });
                });
                values = values.map(function (op) { return op[op.length - 1]; });
                if (force === true) {
                    this.forValidation = false;
                }
                if (this.forValidation) {
                    var x = true;
                    if (values.find(function (x) { return x ? true : false; })) {
                        this.forValidation = false;
                    }
                    else {
                        return;
                    }
                }
                try {
                    this.func.call(this.target, this.target);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            finally {
                this._isExecuting = false;
            }
        };
        /**
         * This will dispose and unregister all watchers
         *
         * @memberof AtomWatcher
         */
        AtomWatcher.prototype.dispose = function () {
            for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
                var p = _a[_i];
                for (var _b = 0, p_1 = p; _b < p_1.length; _b++) {
                    var op = p_1[_b];
                    if (op.watcher) {
                        op.watcher.dispose();
                        op.watcher = null;
                    }
                }
            }
            this.func = null;
            this.path.length = 0;
            this.path = null;
        };
        return AtomWatcher;
    }());
    WebAtoms.AtomWatcher = AtomWatcher;
})(WebAtoms || (WebAtoms = {}));
/**
 * Easy and Simple Dependency Injection
 */
var WebAtoms;
(function (WebAtoms) {
    var DIFactory = /** @class */ (function () {
        function DIFactory(key, factory, transient) {
            this.transient = transient;
            this.factory = factory;
            this.key = key;
        }
        DIFactory.prototype.resolve = function () {
            if (this.transient) {
                return this.factory();
            }
            return this.instance || (this.instance = this.factory());
        };
        DIFactory.prototype.push = function (factory, transient) {
            this.stack = this.stack || [];
            this.stack.push({
                factory: this.factory,
                instance: this.instance,
                transient: this.transient
            });
            this.transient = transient;
            this.instance = undefined;
            this.factory = factory;
        };
        DIFactory.prototype.pop = function () {
            if (!(this.stack && this.stack.length)) {
                throw new Error("Stack in DIFactory is empty");
            }
            var obj = this.stack.pop();
            this.factory = obj.factory;
            this.transient = obj.transient;
            this.instance = obj.instance;
        };
        return DIFactory;
    }());
    /**
     *
     *
     * @export
     * @class DI
     */
    var DI = /** @class */ (function () {
        function DI() {
        }
        /**
         *
         *
         * @static
         * @template T
         * @param {new () => T} key
         * @param {() => T} factory
         * @param {boolean} [transient=false] - If true, always new instance will be created
         * @memberof DI
         */
        DI.register = function (key, factory, transient) {
            if (transient === void 0) { transient = false; }
            var k = key;
            var existing = DI.factory[k];
            if (existing) {
                throw new Error("Factory for " + key.name + " is already registered");
            }
            DI.factory[k] = new DIFactory(key, factory, transient);
        };
        /**
         *
         *
         * @static
         * @template T
         * @param {new () => T} c
         * @returns {T}
         * @memberof DI
         */
        DI.resolve = function (c) {
            var f = DI.factory[c];
            if (!f) {
                throw new Error("No factory registered for " + c);
            }
            return f.resolve();
        };
        /**
         * Use this for unit testing, this will push existing
         * DI factory and all instances will be resolved with
         * given instance
         *
         * @static
         * @param {*} key
         * @param {*} instance
         * @memberof DI
         */
        DI.push = function (key, instance) {
            var f = DI.factory[key];
            if (!f) {
                DI.register(key, function () { return instance; });
            }
            else {
                f.push(function () { return instance; }, true);
            }
        };
        /**
         *
         *
         * @static
         * @param {*} key
         * @memberof DI
         */
        DI.pop = function (key) {
            var f = DI.factory[key];
            if (f) {
                f.pop();
            }
        };
        DI.factory = {};
        return DI;
    }());
    WebAtoms.DI = DI;
    /**
     * This decorator will register given class as singleton instance on DI.
     *
     *      @DIGlobal
     *      class BackendService{
     *      }
     *
     *
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIGlobal(c) {
        DI.register(c, function () { return new c(); });
        return c;
    }
    WebAtoms.DIGlobal = DIGlobal;
    ;
    /**
     * This decorator will register given class as transient instance on DI.
     *
     *      @DIAlwaysNew
     *      class StringHelper{
     *      }
     *
     * @export
     * @param {new () => any} c
     * @returns
     */
    function DIAlwaysNew(c) {
        DI.register(c, function () { return new c(); }, true);
        return c;
    }
    WebAtoms.DIAlwaysNew = DIAlwaysNew;
    ;
})(WebAtoms || (WebAtoms = {}));
var DIGlobal = WebAtoms.DIGlobal;
var DIAlwaysNew = WebAtoms.DIAlwaysNew;
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            target.methods = target.methods || {};
            var a = target.methods[propertyKey];
            var oldFunction = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.testMode || Atom.designMode) {
                    console.log("TestDesign Mode: " + url + " .. " + args.join(","));
                    var ro = oldFunction.apply(this, args);
                    if (ro) {
                        return ro;
                    }
                }
                var rn = null;
                if (target.methodReturns) {
                    rn = target.methodReturns[propertyKey];
                }
                var r = this.invoke(url, method, a, args, rn);
                return r;
            };
            //console.log("methodBuilder called");
            //console.log({ url: url, propertyKey: propertyKey,descriptor: descriptor });
        };
    };
}
function Return(type) {
    return function (target, propertyKey, descriptor) {
        if (!target.methodReturns) {
            target.methodReturns = {};
        }
        target.methodReturns[propertyKey] = type;
    };
}
function parameterBuilder(paramName) {
    return function (key) {
        //console.log("Declaration");
        //console.log({ key:key});
        return function (target, propertyKey, parameterIndex) {
            //console.log("Instance");
            //console.log({ key:key, propertyKey: propertyKey,parameterIndex: parameterIndex });
            target.methods = target.methods || {};
            var a = target.methods[propertyKey];
            if (!a) {
                a = [];
                target.methods[propertyKey] = a;
            }
            a[parameterIndex] = new WebAtoms.Rest.ServiceParameter(paramName, key);
        };
    };
}
/**
 * This will register Url path fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Path
 * @param {name} - Name of the parameter
 */
var Path = parameterBuilder("Path");
/**
 * This will register Url query fragment on parameter.
 *
 * @example
 *
 *      @Get("/api/products")
 *      async getProducts(
 *          @Query("category")  category: number
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Query
 * @param {name} - Name of the parameter
 */
var Query = parameterBuilder("Query");
/**
 * This will register data fragment on ajax.
 *
 * @example
 *
 *      @Post("/api/products")
 *      async getProducts(
 *          @Query("id")  id: number,
 *          @Body product: Product
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Body = parameterBuilder("Body")("");
/**
 * Http Post method
 * @example
 *
 *      @Post("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Post
 * @param {url} - Url for the operation
 */
var Post = methodBuilder("Post");
/**
 * Http Get Method
 *
 * @example
 *
 *      @Get("/api/products/{category}")
 *      async getProducts(
 *          @Path("category") category?:string
 *      ): Promise<Product[]> {
 *      }
 *
 * @export
 * @function Body
 */
var Get = methodBuilder("Get");
/**
 * Http Delete method
 * @example
 *
 *      @Delete("/api/products")
 *      async deleteProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Delete
 * @param {url} - Url for the operation
 */
var Delete = methodBuilder("Delete");
/**
 * Http Put method
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
var Put = methodBuilder("Put");
/**
 * Http Patch method
 * @example
 *
 *      @Patch("/api/products")
 *      async saveProduct(
 *          @Body product: any
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Patch
 * @param {url} - Url for the operation
 */
var Patch = methodBuilder("Patch");
/**
 * Cancellation token
 * @example
 *
 *      @Put("/api/products")
 *      async saveProduct(
 *          @Body product: Product
 *          @Cancel cancel: CancelToken
 *      ): Promise<Product> {
 *      }
 *
 * @export
 * @function Put
 * @param {url} - Url for the operation
 */
var Cancel = function (target, propertyKey, parameterIndex) {
    if (!target.methods) {
        target.methods = {};
    }
    var a = target.methods[propertyKey];
    if (!a) {
        a = [];
        target.methods[propertyKey] = a;
    }
    a[parameterIndex] = new WebAtoms.Rest.ServiceParameter("cancel", "");
};
if (!window["__atomSetLocalValue"]) {
    window["__atomSetLocalValue"] = function (bt) {
        return function (k, v, e, r) {
            var self = this;
            if (v) {
                if (v.then && v.catch) {
                    e._promisesQueue = e._promisesQueue || {};
                    var c = e._promisesQueue[k];
                    if (c) {
                        c.abort();
                    }
                    v.then(function (pr) {
                        if (c && c.cancelled)
                            return;
                        e._promisesQueue[k] = null;
                        bt.setLocalValue.call(self, k, pr, e, r);
                    });
                    v.catch(function (er) {
                        e._promisesQueue[k] = null;
                    });
                }
            }
            bt.setLocalValue.call(this, k, v, e, r);
        };
    };
}
var WebAtoms;
(function (WebAtoms) {
    var Rest;
    (function (Rest) {
        var ServiceParameter = /** @class */ (function () {
            function ServiceParameter(type, key) {
                this.type = type.toLowerCase();
                this.key = key;
            }
            return ServiceParameter;
        }());
        Rest.ServiceParameter = ServiceParameter;
        var AjaxOptions = /** @class */ (function () {
            function AjaxOptions() {
            }
            return AjaxOptions;
        }());
        Rest.AjaxOptions = AjaxOptions;
        var AtomPromise = window["AtomPromise"];
        /**
         *
         *
         * @export
         * @class CancellablePromise
         * @implements {Promise<T>}
         * @template T
         */
        var CancellablePromise = /** @class */ (function () {
            function CancellablePromise(p, onCancel) {
                this.p = p;
                this.onCancel = onCancel;
            }
            CancellablePromise.prototype.abort = function () {
                this.onCancel();
            };
            CancellablePromise.prototype.then = function (onfulfilled, onrejected) {
                return this.p.then(onfulfilled, onrejected);
            };
            CancellablePromise.prototype.catch = function (onrejected) {
                return this.p.catch(onrejected);
            };
            return CancellablePromise;
        }());
        Rest.CancellablePromise = CancellablePromise;
        /**
         *
         *
         * @export
         * @class BaseService
         */
        var BaseService = /** @class */ (function () {
            function BaseService() {
                this.testMode = false;
                this.showProgress = true;
                this.showError = true;
                //bs
                this.methods = {};
                this.methodReturns = {};
            }
            BaseService.prototype.encodeData = function (o) {
                o.type = "JSON";
                return o;
            };
            BaseService.prototype.sendResult = function (result, error) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                if (error) {
                                    setTimeout(function () {
                                        reject(error);
                                    }, 1);
                                    return;
                                }
                                setTimeout(function () {
                                    resolve(result);
                                }, 1);
                            })];
                    });
                });
            };
            BaseService.prototype.invoke = function (url, method, bag, values, returns) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    var options, i, p, v, pr, rp;
                    return __generator(this, function (_a) {
                        options = new AjaxOptions();
                        options.method = method;
                        if (bag) {
                            for (i = 0; i < bag.length; i++) {
                                p = bag[i];
                                v = values[i];
                                switch (p.type) {
                                    case 'path':
                                        url = url.replace("{" + p.key + "}", encodeURIComponent(v));
                                        break;
                                    case 'query':
                                        if (url.indexOf('?') === -1) {
                                            url += "?";
                                        }
                                        url += "&" + p.key + "=" + encodeURIComponent(v);
                                        break;
                                    case 'body':
                                        options.data = v;
                                        options = this.encodeData(options);
                                        break;
                                    case 'cancel':
                                        options.cancel = v;
                                        break;
                                }
                            }
                        }
                        options.url = url;
                        pr = AtomPromise.json(url, null, options);
                        if (options.cancel) {
                            options.cancel.registerForCancel(function () {
                                pr.abort();
                            });
                        }
                        rp = new Promise(function (resolve, reject) {
                            pr.then(function () {
                                var v = pr.value();
                                // deep clone...
                                //var rv = new returns();
                                //reject("Clone pending");
                                if (options.cancel) {
                                    if (options.cancel.cancelled) {
                                        reject("cancelled");
                                        return;
                                    }
                                }
                                resolve(v);
                            });
                            pr.failed(function () {
                                reject(pr.error.msg);
                            });
                            pr.showError(_this.showError);
                            pr.showProgress(_this.showProgress);
                            pr.invoke("Ok");
                        });
                        return [2 /*return*/, new CancellablePromise(rp, function () {
                                pr.abort();
                            })];
                    });
                });
            };
            return BaseService;
        }());
        Rest.BaseService = BaseService;
    })(Rest = WebAtoms.Rest || (WebAtoms.Rest = {}));
})(WebAtoms || (WebAtoms = {}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebAtoms;
(function (WebAtoms) {
    /**
     *
     *
     * @export
     * @class WindowService
     */
    var WindowService = /** @class */ (function () {
        function WindowService() {
            this.lastWindowID = 1;
        }
        /**
         * Display an alert, and method will continue after alert is closed.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<any>}
         * @memberof WindowService
         */
        WindowService.prototype.alert = function (msg, title) {
            return this.showAlert(msg, title || "Message", false);
        };
        /**
         * Display a confirm window with promise that will resolve when yes or no
         * is clicked.
         *
         * @param {string} msg
         * @param {string} [title]
         * @returns {Promise<boolean>}
         * @memberof WindowService
         */
        WindowService.prototype.confirm = function (msg, title) {
            return this.showAlert(msg, title || "Confirm", true);
        };
        WindowService.prototype.showAlert = function (msg, title, confirm) {
            return new Promise(function (resolve, reject) {
                var AtomUI = window["AtomUI"];
                var AtomWindow = window["WebAtoms"]["AtomWindow"];
                var d = { Message: msg, ConfirmValue: false, Confirm: confirm };
                var e = document.createElement("DIV");
                document.body.appendChild(e);
                var w = AtomUI.createControl(e, AtomWindow, d);
                w.set_windowWidth(380);
                w.set_windowHeight(120);
                w.set_windowTemplate(w.getTemplate("alertTemplate"));
                w.set_title(title);
                w.set_next(function () {
                    w.dispose();
                    //$(e).remove();
                    e.remove();
                    if (d.ConfirmValue) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
                w.set_cancelNext(function () {
                    w.dispose();
                    //$(e).remove();
                    e.remove();
                    resolve(false);
                });
                w.refresh();
            });
        };
        /**
         * This method will open a new window identified by name of the window or class of window.
         * Supplied view model has to be derived from AtomWindowViewModel.
         *
         * By default this window has a localScope, so it does not corrupt scope.
         *
         * @example
         *
         *     var result = await windowService.openWindow<Task>(NewTaskWindow, new NewTaskWindowViewModel() );
         *
         *      class NewTaskWindowViewModel extends AtomWindowViewModel{
         *
         *          ....
         *          save(){
         *
         *              // close and send result
         *              this.close(task);
         *
         *          }
         *          ....
         *
         *      }
         *
         * @template T
         * @param {(string | {new(e)})} windowType
         * @param {AtomWindowViewModel} [viewModel]
         * @returns {Promise<T>}
         * @memberof WindowService
         */
        WindowService.prototype.openWindow = function (windowType, viewModel) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var windowDiv = document.createElement("div");
                            windowDiv.id = "atom_window_" + _this.lastWindowID++;
                            var atomApplication = window["atomApplication"];
                            var AtomUI = window["AtomUI"];
                            atomApplication._element.appendChild(windowDiv);
                            if (windowType instanceof String) {
                                windowType = window[windowType];
                            }
                            var windowCtrl = AtomUI.createControl(windowDiv, windowType);
                            var closeSubscription = WebAtoms.AtomDevice.instance.subscribe("atom-window-close:" + windowDiv.id, function (g, i) {
                                if (i !== undefined) {
                                    Atom.set(windowCtrl, "value", i);
                                }
                                windowCtrl.closeCommand();
                            });
                            var cancelSubscription = WebAtoms.AtomDevice.instance.subscribe("atom-window-cancel:" + windowDiv.id, function (g, i) {
                                windowCtrl.cancelCommand();
                            });
                            windowDiv.setAttribute("atom-local-scope", "true");
                            windowCtrl.init();
                            var dispatcher = WebAtoms["dispatcher"];
                            if (viewModel !== undefined) {
                                Atom.set(windowCtrl, "viewModel", viewModel);
                            }
                            windowCtrl.set_next(function () {
                                cancelSubscription.dispose();
                                closeSubscription.dispose();
                                try {
                                    resolve(windowCtrl.get_value());
                                }
                                catch (e) {
                                    console.error(e);
                                }
                                dispatcher.callLater(function () {
                                    windowCtrl.dispose();
                                    windowDiv.remove();
                                });
                            });
                            windowCtrl.set_cancelNext(function () {
                                cancelSubscription.dispose();
                                closeSubscription.dispose();
                                try {
                                    reject("cancelled");
                                }
                                catch (e) {
                                    console.error(e);
                                }
                                dispatcher.callLater(function () {
                                    windowCtrl.dispose();
                                    windowDiv.remove();
                                });
                            });
                            dispatcher.callLater(function () {
                                var scope = windowCtrl.get_scope();
                                var vm = windowCtrl.get_viewModel();
                                if (vm) {
                                    vm.windowName = windowDiv.id;
                                }
                                windowCtrl.openWindow(scope, null);
                            });
                        })];
                });
            });
        };
        WindowService = __decorate([
            WebAtoms.DIGlobal
        ], WindowService);
        return WindowService;
    }());
    WebAtoms.WindowService = WindowService;
})(WebAtoms || (WebAtoms = {}));
var WindowService = WebAtoms.WindowService;
//# sourceMappingURL=web-atoms-mvvm.js.map