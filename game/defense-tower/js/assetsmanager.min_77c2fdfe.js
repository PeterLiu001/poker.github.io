var __reflect = this && this.__reflect || function(e, r, t) {
        e.__class__ = r, t ? t.push(r) : t = [r], e.__types__ = e.__types__ ? t.concat(e.__types__) : t
    },
    __extends = this && this.__extends || function(e, r) {
        function t() {
            this.constructor = e
        }
        for (var o in r) r.hasOwnProperty(o) && (e[o] = r[o]);
        t.prototype = r.prototype, e.prototype = new t
    },
    __decorate = this && this.__decorate || function(e, r, t, o) {
        var n, i = arguments.length,
            s = 3 > i ? r : null === o ? o = Object.getOwnPropertyDescriptor(r, t) : o;
        if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, r, t, o);
        else
            for (var a = e.length - 1; a >= 0; a--)(n = e[a]) && (s = (3 > i ? n(s) : i > 3 ? n(r, t, s) : n(r, t)) || s);
        return i > 3 && s && Object.defineProperty(r, t, s), s
    },
    RES;
! function(e) {}(RES || (RES = {}));
var RES;
! function(e) {
    var r = function() {
        function r() {
            this.groupTotalDic = {}, this.numLoadedDic = {}, this.groupErrorDic = {}, this.retryTimesDic = {}, this.maxRetryTimes = 3, this.reporterDic = {}, this.dispatcherDic = {}, this.failedList = new Array, this.loadItemErrorDic = {}, this.errorDic = {}, this.itemListPriorityDic = {}, this.itemLoadDic = {}, this.promiseHash = {}, this.lazyLoadList = new Array, this.loadingCount = 0, this.thread = 4
        }
        return r.prototype.pushResItem = function(e) {
            if (this.promiseHash[e.root + e.name]) return this.promiseHash[e.root + e.name];
            this.lazyLoadList.push(e), this.itemListPriorityDic[Number.NEGATIVE_INFINITY] = this.lazyLoadList, this.updatelistPriority(this.lazyLoadList, Number.NEGATIVE_INFINITY);
            var r = new egret.EventDispatcher;
            this.dispatcherDic[e.root + e.name] = r;
            var t = new Promise(function(e, t) {
                r.addEventListener("complete", function(r) {
                    e(r.data)
                }, null), r.addEventListener("error", function(e) {
                    t(e.data)
                }, null)
            });
            return this.promiseHash[e.root + e.name] = t, this.loadNextResource(), t
        }, r.prototype.pushResGroup = function(e, r, t, o) {
            if (this.promiseHash[r]) return this.promiseHash[r];
            for (var n = e.length, i = 0; n > i; i++) {
                var s = e[i];
                s.groupNames || (s.groupNames = []), s.groupNames.push(r)
            }
            this.groupTotalDic[r] = e.length, this.numLoadedDic[r] = 0, this.updatelistPriority(e, t), this.reporterDic[r] = o;
            var a = new egret.EventDispatcher;
            this.dispatcherDic[r] = a;
            var u = new Promise(function(e, r) {
                a.addEventListener("complete", e, null), a.addEventListener("error", function(e) {
                    r(e.data)
                }, null)
            });
            return this.promiseHash[r] = u, this.loadNextResource(), u
        }, r.prototype.updatelistPriority = function(e, r) {
            void 0 == this.itemListPriorityDic[r] && (this.itemListPriorityDic[r] = []);
            for (var t = 0, o = e; t < o.length; t++) {
                var n = o[t];
                if (1 != this.itemLoadDic[n.root + n.name]) {
                    var i = this.findPriorityInDic(n);
                    if (void 0 == i) this.itemListPriorityDic[r].push(n);
                    else if (r > i) {
                        this.itemListPriorityDic[r].push(n);
                        var s = this.itemListPriorityDic[i].indexOf(n);
                        this.itemListPriorityDic[i].splice(s, 1)
                    }
                }
            }
        }, r.prototype.findPriorityInDic = function(e) {
            for (var r in this.itemListPriorityDic)
                if (this.itemListPriorityDic[r].indexOf(e) > -1) return parseInt(r)
        }, r.prototype.loadNextResource = function() {
            for (; this.loadingCount < this.thread;) {
                var e = this.loadSingleResource();
                if (!e) break
            }
        }, r.prototype.loadSingleResource = function() {
            var r = this,
                t = this.getOneResourceInfoInGroup();
            return t ? (this.itemLoadDic[t.root + t.name] = 1, this.loadingCount++, this.loadResource(t).then(function(o) {
                if (r.loadingCount--, delete r.itemLoadDic[t.root + t.name], e.host.save(t, o), r.promiseHash[t.root + t.name]) {
                    var n = r.deleteDispatcher(t.root + t.name);
                    n.dispatchEventWith("complete", !1, o)
                }
                var i = t.groupNames;
                if (i) {
                    delete t.groupNames;
                    for (var s = 0, a = i; s < a.length; s++) {
                        var u = a[s];
                        r.setGroupProgress(u, t) && r.loadGroupEnd(u)
                    }
                }
                r.loadNextResource()
            })["catch"](function(o) {
                if (!o) throw t.name + " load fail";
                if (!o.__resource_manager_error__) throw o;
                delete r.itemLoadDic[t.root + t.name], r.loadingCount--, delete e.host.state[t.root + t.name];
                var n = r.retryTimesDic[t.name] || 1;
                if (!(n > r.maxRetryTimes)) return r.retryTimesDic[t.name] = n + 1, r.failedList.push(t), void r.loadNextResource();
                if (delete r.retryTimesDic[t.name], r.promiseHash[t.root + t.name]) {
                    var i = r.deleteDispatcher(t.root + t.name);
                    i.dispatchEventWith("error", !1, {
                        r: t,
                        error: o
                    })
                }
                var s = t.groupNames;
                if (s) {
                    delete t.groupNames;
                    for (var a = 0, u = s; a < u.length; a++) {
                        var c = u[a];
                        r.loadItemErrorDic[c] || (r.loadItemErrorDic[c] = []), -1 == r.loadItemErrorDic[c].indexOf(t) && r.loadItemErrorDic[c].push(t), r.groupErrorDic[c] = !0, r.setGroupProgress(c, t) ? r.loadGroupEnd(c, o) : r.errorDic[c] = o
                    }
                }
                r.loadNextResource()
            }), !0) : !1
        }, r.prototype.getOneResourceInfoInGroup = function() {
            if (this.failedList.length > 0) return this.failedList.shift();
            var e = Number.NEGATIVE_INFINITY;
            for (var r in this.itemListPriorityDic) e = Math.max(e, r);
            var t = this.itemListPriorityDic[e];
            if (t) return 0 == t.length ? (delete this.itemListPriorityDic[e], this.getOneResourceInfoInGroup()) : t.shift()
        }, r.prototype.setGroupProgress = function(e, r) {
            var t = this.reporterDic[e];
            this.numLoadedDic[e]++;
            var o = this.numLoadedDic[e],
                n = this.groupTotalDic[e];
            return t && t.onProgress && t.onProgress(o, n, r), o == n
        }, r.prototype.loadGroupEnd = function(e, r) {
            delete this.groupTotalDic[e], delete this.numLoadedDic[e], delete this.reporterDic[e];
            var t = this.deleteDispatcher(e);
            if (r) {
                delete this.groupErrorDic[e];
                var o = this.loadItemErrorDic[e];
                delete this.loadItemErrorDic[e], t.dispatchEventWith("error", !1, {
                    itemList: o,
                    lastError: r
                })
            } else {
                var n = this.groupErrorDic[e];
                if (delete this.groupErrorDic[e], n) {
                    var o = this.loadItemErrorDic[e];
                    delete this.loadItemErrorDic[e];
                    var i = this.errorDic[e];
                    delete this.errorDic[e], t.dispatchEventWith("error", !1, {
                        itemList: o,
                        error: i
                    })
                } else t.dispatchEventWith("complete")
            }
        }, r.prototype.deleteDispatcher = function(e) {
            delete this.promiseHash[e];
            var r = this.dispatcherDic[e];
            return delete this.dispatcherDic[e], r
        }, r.prototype.loadResource = function(r, t) {
            if (!t) {
                if (1 == e.FEATURE_FLAG.FIX_DUPLICATE_LOAD) {
                    var o = e.host.state[r.root + r.name];
                    if (2 == o) return Promise.resolve(e.host.get(r));
                    if (1 == o) return r.promise
                }
                t = e.processor.isSupport(r)
            }
            if (!t) throw new e.ResourceManagerError(2001, r.name, r.type);
            e.host.state[r.root + r.name] = 1;
            var n = t.onLoadStart(e.host, r);
            return r.promise = n, n
        }, r.prototype.unloadResource = function(r) {
            var t = e.host.get(r);
            if (!t) return console.warn("尝试释放不存在的资源:", r.name), !1;
            var o = e.processor.isSupport(r);
            return o ? (o.onRemoveStart(e.host, r), e.host.remove(r), 1 == r.extra && e.config.removeResourceData(r), !0) : !0
        }, r
    }();
    e.ResourceLoader = r, __reflect(r.prototype, "RES.ResourceLoader")
}(RES || (RES = {}));
var RES;
! function(e) {
    e.checkNull = function(e, r, t) {
        var o = t.value;
        t.value = function() {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            return e[0] ? o.apply(this, e) : (console.warn("方法" + r + "的参数不能为null"), null)
        }
    }, e.FEATURE_FLAG = {
        FIX_DUPLICATE_LOAD: 1
    };
    var r;
    ! function(e) {
        function r(e) {
            t = e
        }
        var t = "warning";
        e.setUpgradeGuideLevel = r
    }(r = e.upgrade || (e.upgrade = {}))
}(RES || (RES = {}));
var RES;
! function(e) {
    function r(r) {
        var t = e.config.config.fileSystem.getFile(r);
        return t || (r = e.resourceNameSelector(r), t = e.config.config.fileSystem.getFile(r)), t
    }

    function t(e, r) {
        var t;
        t = e.indexOf(".json") >= 0 ? "legacyResourceConfig" : "resourceConfig", o = {
            type: t,
            root: r,
            url: e,
            name: e
        }
    }
    e.resourceNameSelector = function(e) {
        return e
    }, e.getResourceInfo = r;
    var o;
    e.setConfigURL = t;
    var n = function() {
        function t() {}
        return t.prototype.init = function() {
            return this.config || (this.config = {
                alias: {},
                groups: {},
                resourceRoot: o.root,
                mergeSelector: null,
                fileSystem: null,
                loadGroup: []
            }), e.queue.pushResItem(o)["catch"](function(r) {
                return e.isCompatible || r.__resource_manager_error__ || (r.error ? console.error(r.error.stack) : console.error(r.stack), r = new e.ResourceManagerError(1002)), e.host.remove(o), Promise.reject(r)
            })
        }, t.prototype.getGroupByName = function(r) {
            var t = this.config.groups[r],
                o = [];
            if (!t) return o;
            for (var n = 0, i = t; n < i.length; n++) {
                var s = i[n],
                    a = void 0;
                if (a = e.config.getResourceWithSubkey(s), null != a) {
                    var u = a.r,
                        c = a.key;
                    if (null == u) throw new e.ResourceManagerError(2005, c); - 1 == o.indexOf(u) && o.push(u)
                }
            }
            return o
        }, t.prototype.__temp__get__type__via__url = function(r) {
            var t = this.config.alias[r];
            if (t || (t = r), e.typeSelector) {
                var o = e.typeSelector(t);
                if (!o) throw new e.ResourceManagerError(2004, t);
                return o
            }
            return console.warn("RES.mapConfig 并未设置 typeSelector"), "unknown"
        }, t.prototype.getResourceWithSubkey = function(e) {
            e = this.getKeyByAlias(e);
            var r = e.indexOf("#"),
                t = "";
            r >= 0 && (t = e.substr(r + 1), e = e.substr(0, r));
            var o = this.getResource(e);
            return o ? {
                r: o,
                key: e,
                subkey: t
            } : null
        }, t.prototype.getKeyByAlias = function(e) {
            return this.config.alias[e] ? this.config.alias[e] : e
        }, t.prototype.getResource = function(e) {
            var t = this.config.alias[e];
            t || (t = e);
            var o = r(t);
            return o ? o : null
        }, t.prototype.createGroup = function(e, r, t) {
            if (void 0 === t && (t = !1), !t && this.config.groups[e] || !r || 0 == r.length) return !1;
            for (var o = [], n = 0, i = r; n < i.length; n++) {
                var s = i[n];
                if (this.config.groups[s]) {
                    var a = this.config.groups[s];
                    o = o.concat(a)
                } else o.push(s)
            }
            return this.config.groups[e] = o, !0
        }, t.prototype.addSubkey = function(e, r) {
            this.addAlias(e, r + "#" + e)
        }, t.prototype.addAlias = function(e, r) {
            this.config.alias[r] && (r = this.config.alias[r]), this.config.alias[e] = r
        }, t.prototype.addResourceData = function(r) {
            e.hasRes(r.name) || (r.type || (r.type = this.__temp__get__type__via__url(r.url)), e.config.config.fileSystem.addFile(r))
        }, t.prototype.removeResourceData = function(r) {
            e.hasRes(r.name) && (e.config.config.fileSystem.removeFile(r.url), this.config.alias[r.name] && delete this.config.alias[r.name])
        }, t
    }();
    e.ResourceConfig = n, __reflect(n.prototype, "RES.ResourceConfig")
}(RES || (RES = {}));
var RES;
! function(e) {
    function r(r) {
        return e.path.basename(r).split(".").join("_")
    }

    function t(r) {
        var t, o = r.substr(r.lastIndexOf(".") + 1);
        switch (o) {
            case e.ResourceItem.TYPE_XML:
            case e.ResourceItem.TYPE_JSON:
            case e.ResourceItem.TYPE_SHEET:
                t = o;
                break;
            case "png":
            case "jpg":
            case "gif":
            case "jpeg":
            case "bmp":
                t = e.ResourceItem.TYPE_IMAGE;
                break;
            case "fnt":
                t = e.ResourceItem.TYPE_FONT;
                break;
            case "txt":
                t = e.ResourceItem.TYPE_TEXT;
                break;
            case "mp3":
            case "ogg":
            case "mpeg":
            case "wav":
            case "m4a":
            case "mp4":
            case "aiff":
            case "wma":
            case "mid":
                t = e.ResourceItem.TYPE_SOUND;
                break;
            case "mergeJson":
            case "zip":
            case "pvr":
                t = o;
                break;
            default:
                t = e.ResourceItem.TYPE_BIN
        }
        return t
    }

    function o(r, t) {
        throw new e.ResourceManagerError(2002)
    }

    function n(r) {
        e.isCompatible = r
    }

    function i(r, t) {
        if (t.indexOf("://") >= 0) {
            var o = t.split("://");
            t = o[0] + "://" + e.path.normalize(o[1] + "/"), r = r.replace(t, "")
        } else t = e.path.normalize(t + "/"), r = r.replace(t, "");
        return e.setConfigURL(r, t), P || (P = new D), s(P.loadConfig())
    }

    function s(r) {
        return e.isCompatible ? void r["catch"](function(e) {}).then() : r
    }

    function a(e, r, t) {
        return void 0 === r && (r = 0), s(P.loadGroup(e, r, t))
    }

    function u(e) {
        return P.isGroupLoaded(e)
    }

    function c(r) {
        return P.getGroupByName(r).map(function(r) {
            return e.ResourceItem.convertToResItem(r)
        })
    }

    function l(e, r, t) {
        return void 0 === t && (t = !1), P.createGroup(e, r, t)
    }

    function f(e) {
        return P.hasRes(e)
    }

    function p(e) {
        return P.getRes(e)
    }

    function g(e, r, t) {
        return s(P.getResAsync.apply(P, arguments))
    }

    function d(e, r, t, o) {
        if (void 0 === o && (o = ""), !P) {
            var n = egret.sys.tr(3200);
            return egret.warn(n), Promise.reject(n)
        }
        return s(P.getResByUrl(e, r, t, o))
    }

    function h(e, r) {
        return P.destroyRes(e, r)
    }

    function v(e) {
        P || (P = new D), P.setMaxLoadingThread(e)
    }

    function m(e) {
        P.setMaxRetryTimes(e)
    }

    function R(e, r, t, o, n) {
        void 0 === o && (o = !1), void 0 === n && (n = 0), P || (P = new D), P.addEventListener(e, r, t, o, n)
    }

    function y(e, r, t, o) {
        void 0 === o && (o = !1), P.removeEventListener(e, r, t, o)
    }

    function E(e) {
        P.addResourceData(e)
    }

    function _() {
        return P || (P = new D), P.vcs
    }

    function S(e) {
        P || (P = new D), P.registerVersionController(e)
    }

    function L(e) {
        return P.vcs ? P.vcs.getVirtualUrl(e) : e
    }
    e.nameSelector = r, e.typeSelector = t, e.registerAnalyzer = o, e.setIsCompatible = n, e.isCompatible = !1, e.loadConfig = i, e.loadGroup = a, e.isGroupLoaded = u, e.getGroupByName = c, e.createGroup = l, e.hasRes = f, e.getRes = p, e.getResAsync = g, e.getResByUrl = d, e.destroyRes = h, e.setMaxLoadingThread = v, e.setMaxRetryTimes = m, e.addEventListener = R, e.removeEventListener = y, e.$addResourceData = E, e.getVersionController = _, e.registerVersionController = S, e.getVirtualUrl = L;
    var D = function(r) {
        function t() {
            var t = r.call(this) || this;
            return t.isVcsInit = !1, t.normalLoadConfig = function() {
                return e.config.init().then(function(r) {
                    e.ResourceEvent.dispatchResourceEvent(t, e.ResourceEvent.CONFIG_COMPLETE)
                }, function(r) {
                    return e.ResourceEvent.dispatchResourceEvent(t, e.ResourceEvent.CONFIG_LOAD_ERROR), Promise.reject(r)
                })
            }, e.VersionController && (t.vcs = new e.VersionController), t
        }
        return __extends(t, r), t.prototype.registerVersionController = function(e) {
            this.vcs = e, this.isVcsInit = !1
        }, t.prototype.loadConfig = function() {
            var e = this;
            return !this.isVcsInit && this.vcs ? (this.isVcsInit = !0, this.vcs.init().then(function() {
                return e.normalLoadConfig()
            })) : this.normalLoadConfig()
        }, t.prototype.isGroupLoaded = function(r) {
            var t = e.config.getGroupByName(r);
            return t.every(function(r) {
                return null != e.host.get(r)
            })
        }, t.prototype.getGroupByName = function(r) {
            return e.config.getGroupByName(r)
        }, t.prototype.loadGroup = function(r, t, o) {
            var n = this;
            void 0 === t && (t = 0);
            var i = {
                onProgress: function(t, i, s) {
                    o && o.onProgress && o.onProgress(t, i, s), e.ResourceEvent.dispatchResourceEvent(n, e.ResourceEvent.GROUP_PROGRESS, r, s, t, i)
                }
            };
            return this._loadGroup(r, t, i).then(function(t) {
                -1 == e.config.config.loadGroup.indexOf(r) && e.config.config.loadGroup.push(r), e.ResourceEvent.dispatchResourceEvent(n, e.ResourceEvent.GROUP_COMPLETE, r)
            }, function(t) {
                if (-1 == e.config.config.loadGroup.indexOf(r) && e.config.config.loadGroup.push(r), t.itemList)
                    for (var o = t.itemList, i = o.length, s = 0; i > s; s++) {
                        var a = o[s];
                        delete a.promise, e.ResourceEvent.dispatchResourceEvent(n, e.ResourceEvent.ITEM_LOAD_ERROR, r, a)
                    }
                return e.isCompatible && console.warn(t.error.message), e.ResourceEvent.dispatchResourceEvent(n, e.ResourceEvent.GROUP_LOAD_ERROR, r), Promise.reject(t.error)
            })
        }, t.prototype._loadGroup = function(r, t, o) {
            void 0 === t && (t = 0);
            var n = e.config.getGroupByName(r);
            return 0 == n.length ? new Promise(function(t, o) {
                o({
                    error: new e.ResourceManagerError(2005, r)
                })
            }) : e.queue.pushResGroup(n, r, t, o)
        }, t.prototype.createGroup = function(r, t, o) {
            return void 0 === o && (o = !1), e.config.createGroup(r, t, o)
        }, t.prototype.hasRes = function(r) {
            return null != e.config.getResourceWithSubkey(r)
        }, t.prototype.getRes = function(r) {
            var t = e.config.getResourceWithSubkey(r);
            if (t) {
                var o = t.r,
                    n = t.key,
                    i = t.subkey,
                    s = e.processor.isSupport(o);
                return s && s.getData && i ? s.getData(e.host, o, n, i) : e.host.get(o)
            }
            return null
        }, t.prototype.getResAsync = function(r, t, o) {
            var n = this,
                i = r,
                s = e.config.getResourceWithSubkey(r);
            if (null == s) return t && t.call(o, null, i), Promise.reject(new e.ResourceManagerError(2006, r));
            var a = s.r,
                u = s.subkey;
            return e.queue.pushResItem(a).then(function(n) {
                e.host.save(a, n);
                var s = e.processor.isSupport(a);
                return s && s.getData && u && (n = s.getData(e.host, a, r, u)), t && t.call(o, n, i), n
            }, function(r) {
                return e.host.remove(a), e.ResourceEvent.dispatchResourceEvent(n, e.ResourceEvent.ITEM_LOAD_ERROR, "", a), t ? (t.call(o, null, i), Promise.reject(null)) : Promise.reject(r)
            })
        }, t.prototype.getResByUrl = function(r, t, o, n) {
            var i = this;
            void 0 === n && (n = "");
            var s = e.config.getResource(r);
            if (!s && (n || (n = e.config.__temp__get__type__via__url(r)), s = {
                    name: r,
                    url: r,
                    type: n,
                    root: "",
                    extra: 1
                }, e.config.addResourceData(s), s = e.config.getResource(r), !s)) throw "never";
            return e.queue.pushResItem(s).then(function(r) {
                return e.host.save(s, r), t && s && t.call(o, r, s.url), r
            }, function(n) {
                return e.host.remove(s), e.ResourceEvent.dispatchResourceEvent(i, e.ResourceEvent.ITEM_LOAD_ERROR, "", s), t ? (t.call(o, null, r), Promise.reject(null)) : Promise.reject(n)
            })
        }, t.prototype.destroyRes = function(r, t) {
            void 0 === t && (t = !0);
            var o = e.config.getGroupByName(r);
            if (o && o.length > 0) {
                var n = e.config.config.loadGroup.indexOf(r);
                if (-1 == n) return !1;
                if (t || 1 == e.config.config.loadGroup.length && e.config.config.loadGroup[0] == r) {
                    for (var i = 0, s = o; i < s.length; i++) {
                        var a = s[i];
                        e.queue.unloadResource(a)
                    }
                    e.config.config.loadGroup.splice(n, 1)
                } else {
                    for (var u = {}, c = 0, l = e.config.config.loadGroup; c < l.length; c++) {
                        var f = l[c];
                        for (var p in e.config.config.groups[f]) {
                            var g = e.config.config.groups[f][p];
                            u[g] ? u[g]++ : u[g] = 1
                        }
                    }
                    for (var d = 0, h = o; d < h.length; d++) {
                        var a = h[d];
                        u[a.name] && 1 == u[a.name] && e.queue.unloadResource(a)
                    }
                    e.config.config.loadGroup.splice(n, 1)
                }
                return !0
            }
            var a = e.config.getResource(r);
            return a ? e.queue.unloadResource(a) : (console.warn("在内存" + r + "资源不存在"), !1)
        }, t.prototype.setMaxLoadingThread = function(r) {
            1 > r && (r = 1), e.queue.thread = r
        }, t.prototype.setMaxRetryTimes = function(r) {
            r = Math.max(r, 0), e.queue.maxRetryTimes = r
        }, t.prototype.addResourceData = function(r) {
            r.root = "", e.config.addResourceData(r)
        }, __decorate([e.checkNull], t.prototype, "hasRes", null), __decorate([e.checkNull], t.prototype, "getRes", null), __decorate([e.checkNull], t.prototype, "getResAsync", null), __decorate([e.checkNull], t.prototype, "getResByUrl", null), t
    }(egret.EventDispatcher);
    e.Resource = D, __reflect(D.prototype, "RES.Resource");
    var P
}(RES || (RES = {}));
var RES;
! function(e) {
    var r;
    ! function(e) {
        function r(e) {
            var r = e.split("/");
            return r.filter(function(e, t) {
                return !!e || t == r.length - 1
            }).join("/")
        }

        function t(e) {
            return e.substr(e.lastIndexOf("/") + 1)
        }

        function o(e) {
            return e.substr(0, e.lastIndexOf("/"))
        }
        e.normalize = r, e.basename = t, e.dirname = o
    }(r = e.path || (e.path = {}))
}(RES || (RES = {}));
var RES;
! function(e) {
    function r() {
        e.config.config.fileSystem.profile(), console.log(t);
        var r = 0;
        for (var o in t) {
            var n = t[o];
            n instanceof egret.Texture && (r += n.$bitmapWidth * n.$bitmapHeight * 4)
        }
        console.log("gpu size : " + (r / 1024).toFixed(3) + "kb")
    }
    var t = {};
    e.profile = r, e.host = {
        state: {},
        get resourceConfig() {
            return e.config
        },
        load: function(r, t) {
            var o = "string" == typeof t ? e.processor._map[t] : t;
            return e.queue.loadResource(r, o)
        },
        unload: function(r) {
            return e.queue.unloadResource(r)
        },
        save: function(r, o) {
            e.host.state[r.root + r.name] = 2, delete r.promise, t[r.root + r.name] = o
        },
        get: function(e) {
            return t[e.root + e.name]
        },
        remove: function(r) {
            delete e.host.state[r.root + r.name], delete t[r.root + r.name]
        }
    }, e.config = new e.ResourceConfig, e.queue = new e.ResourceLoader;
    var o = function(e) {
        function r(t, o, n) {
            var i = e.call(this) || this;
            return i.__resource_manager_error__ = !0, i.name = t.toString(), i.message = r.errorMessage[t].replace("{0}", o).replace("{1}", n), i
        }
        return __extends(r, e), r.errorMessage = {
            1001: "文件加载失败:{0}",
            1002: "ResourceManager 初始化失败：配置文件加载失败",
            2001: "{0}解析失败,不支持指定解析类型:'{1}'，请编写自定义 Processor ，更多内容请参见 https://github.com/egret-labs/resourcemanager/blob/master/docs/README.md#processor",
            2002: "Analyzer 相关API 在 ResourceManager 中不再支持，请编写自定义 Processor ，更多内容请参见 https://github.com/egret-labs/resourcemanager/blob/master/docs/README.md#processor",
            2003: "{0}解析失败,错误原因:{1}",
            2004: "无法找到文件类型:{0}",
            2005: 'RES加载了不存在或空的资源组:"{0}"',
            2006: "资源配置文件中无法找到特定的资源:{0}"
        }, r
    }(Error);
    e.ResourceManagerError = o, __reflect(o.prototype, "RES.ResourceManagerError")
}(RES || (RES = {}));
var RES;
! function(e) {
    var r;
    ! function(r) {
        function t(e) {
            return r._map[e.type]
        }

        function o(e, t) {
            r._map[e] = t
        }

        function n(r, t) {
            var o = this;
            return new Promise(function(n, i) {
                var s = function() {
                        var e = r.data ? r.data : r.response;
                        n(e)
                    },
                    a = function() {
                        var r = new e.ResourceManagerError(1001, t.url);
                        i(r)
                    };
                r.addEventListener(egret.Event.COMPLETE, s, o), r.addEventListener(egret.IOErrorEvent.IO_ERROR, a, o)
            })
        }

        function i(e, r) {
            if (-1 != r.indexOf("://")) return r;
            e = e.split("\\").join("/");
            var t = e.match(/#.*|\?.*/),
                o = "";
            t && (o = t[0]);
            var n = e.lastIndexOf("/");
            return e = -1 != n ? e.substring(0, n + 1) + r : r, e + o
        }
        r.isSupport = t, r.map = o, r.getRelativePath = i, r.ImageProcessor = {
            onLoadStart: function(r, t) {
                var o = new egret.ImageLoader;
                return o.load(e.getVirtualUrl(t.root + t.url)), n(o, t).then(function(e) {
                    var o = new egret.Texture;
                    o._setBitmapData(e);
                    var n = r.resourceConfig.getResource(t.name);
                    if (n && n.scale9grid) {
                        var i = n.scale9grid.split(",");
                        o.scale9Grid = new egret.Rectangle(parseInt(i[0]), parseInt(i[1]), parseInt(i[2]), parseInt(i[3]))
                    }
                    return o
                })
            },
            onRemoveStart: function(e, r) {
                var t = e.get(r);
                t.dispose()
            }
        }, r.BinaryProcessor = {
            onLoadStart: function(r, t) {
                var o = new egret.HttpRequest;
                return o.responseType = egret.HttpResponseType.ARRAY_BUFFER, o.open(e.getVirtualUrl(t.root + t.url), "get"), o.send(), n(o, t)
            },
            onRemoveStart: function(e, r) {}
        }, r.TextProcessor = {
            onLoadStart: function(r, t) {
                var o = new egret.HttpRequest;
                return o.responseType = egret.HttpResponseType.TEXT, o.open(e.getVirtualUrl(t.root + t.url), "get"), o.send(), n(o, t)
            },
            onRemoveStart: function(e, r) {
                return !0
            }
        }, r.JsonProcessor = {
            onLoadStart: function(e, r) {
                return e.load(r, "text").then(function(e) {
                    var r = JSON.parse(e);
                    return r
                })
            },
            onRemoveStart: function(e, r) {}
        }, r.XMLProcessor = {
            onLoadStart: function(e, r) {
                return e.load(r, "text").then(function(e) {
                    var r = egret.XML.parse(e);
                    return r
                })
            },
            onRemoveStart: function(e, r) {
                return !0
            }
        }, r.CommonJSProcessor = {
            onLoadStart: function(r, t) {
                return r.load(t, "text").then(function(r) {
                    var o = new Function("require", "exports", r),
                        n = function() {},
                        i = {};
                    try {
                        o(n, i)
                    } catch (s) {
                        throw new e.ResourceManagerError(2003, t.name, s.message)
                    }
                    return i
                })
            },
            onRemoveStart: function(e, r) {}
        }, r.SheetProcessor = {
            onLoadStart: function(r, t) {
                return r.load(t, "json").then(function(o) {
                    var n = r.resourceConfig.getResource(e.nameSelector(o.file));
                    if (!n) {
                        var s = i(t.url, o.file);
                        n = {
                            name: s,
                            url: s,
                            type: "image",
                            root: t.root
                        }
                    }
                    return r.load(n).then(function(e) {
                        var t = o.frames,
                            i = new egret.SpriteSheet(e);
                        i.$resourceInfo = n;
                        for (var s in t) {
                            var a = t[s],
                                u = i.createTexture(s, a.x, a.y, a.w, a.h, a.offX, a.offY, a.sourceW, a.sourceH);
                            if (a.scale9grid) {
                                var c = a.scale9grid,
                                    l = c.split(",");
                                u.scale9Grid = new egret.Rectangle(parseInt(l[0]), parseInt(l[1]), parseInt(l[2]), parseInt(l[3]))
                            }
                        }
                        return r.save(n, e), i
                    }, function(e) {
                        throw r.remove(n), e
                    })
                })
            },
            getData: function(e, r, t, o) {
                var n = e.get(r);
                return n ? n.getTexture(o) : null
            },
            onRemoveStart: function(e, r) {
                var t = e.get(r),
                    o = t.$resourceInfo;
                t.dispose(), e.unload(o)
            }
        };
        var s = function(e, r) {
            var t = "",
                o = r.split("\n"),
                n = o[2],
                i = n.indexOf('file="'); - 1 != i && (n = n.substring(i + 6), i = n.indexOf('"'), t = n.substring(0, i)), e = e.split("\\").join("/");
            var i = e.lastIndexOf("/");
            return e = -1 != i ? e.substring(0, i + 1) + t : t
        };
        r.FontProcessor = {
            onLoadStart: function(r, t) {
                return r.load(t, "text").then(function(o) {
                    var n;
                    try {
                        n = JSON.parse(o)
                    } catch (a) {
                        n = o
                    }
                    var u;
                    u = "string" == typeof n ? s(t.url, n) : i(t.url, n.file);
                    var c = r.resourceConfig.getResource(e.nameSelector(u));
                    return c || (c = {
                        name: u,
                        url: u,
                        type: "image",
                        root: t.root
                    }), r.load(c).then(function(e) {
                        var t = new egret.BitmapFont(e, n);
                        return t.$resourceInfo = c, r.save(c, e), t
                    }, function(e) {
                        throw r.remove(c), e
                    })
                })
            },
            onRemoveStart: function(e, r) {
                var t = e.get(r),
                    o = t.$resourceInfo;
                e.unload(o)
            }
        }, r.SoundProcessor = {
            onLoadStart: function(r, t) {
                var o = new egret.Sound;
                return o.load(e.getVirtualUrl(t.root + t.url)), n(o, t).then(function() {
                    return o
                })
            },
            onRemoveStart: function(e, r) {}
        }, r.MovieClipProcessor = {
            onLoadStart: function(r, t) {
                var o, n;
                return r.load(t, "json").then(function(i) {
                    o = i;
                    var s = t.name,
                        a = s.substring(0, s.lastIndexOf(".")) + ".png";
                    if (n = r.resourceConfig.getResource(a), !n) throw new e.ResourceManagerError(1001, a);
                    return r.load(n)
                }).then(function(e) {
                    r.save(n, e);
                    var t = e,
                        i = new egret.MovieClipDataFactory(o, t);
                    return i
                })
            },
            onRemoveStart: function(e, r) {
                var t = e.get(r);
                t.clearCache(), t.$spriteSheet.dispose();
                var o = r.name,
                    n = o.substring(0, o.lastIndexOf(".")) + ".png",
                    i = e.resourceConfig.getResource(n);
                i && e.unload(i)
            }
        }, r.MergeJSONProcessor = {
            onLoadStart: function(r, t) {
                return r.load(t, "json").then(function(r) {
                    for (var o in r) e.config.addSubkey(o, t.name);
                    return r
                })
            },
            getData: function(e, r, t, o) {
                var n = e.get(r);
                return n ? n[o] : (console.error("missing resource :" + r.name), null)
            },
            onRemoveStart: function(e, r) {}
        }, r.LegacyResourceConfigProcessor = {
            onLoadStart: function(r, t) {
                return r.load(t, "json").then(function(o) {
                    var n = e.config.config,
                        i = t.root,
                        s = n.fileSystem;
                    s || (s = {
                        fsData: {},
                        getFile: function(e) {
                            return p[e]
                        },
                        addFile: function(e) {
                            e.type || (e.type = ""), void 0 == i && (e.root = ""), p[e.name] = e
                        },
                        profile: function() {
                            console.log(p)
                        },
                        removeFile: function(e) {
                            delete p[e]
                        }
                    }, n.fileSystem = s);
                    for (var a = n.groups, u = 0, c = o.groups; u < c.length; u++) {
                        var l = c[u];
                        "" == l.keys ? a[l.name] = [] : a[l.name] = l.keys.split(",")
                    }
                    for (var f = n.alias, p = s.fsData, g = function(e) {
                            p[e.name] = e, p[e.name].root = i, e.subkeys && e.subkeys.split(",").forEach(function(r) {
                                f[r] = e.name + "#" + r, f[e.name + "." + r] = e.name + "#" + r
                            })
                        }, d = 0, h = o.resources; d < h.length; d++) {
                        var v = h[d];
                        g(v)
                    }
                    return r.save(t, o), o
                })
            },
            onRemoveStart: function() {}
        }, r._map = {
            image: r.ImageProcessor,
            json: r.JsonProcessor,
            text: r.TextProcessor,
            xml: r.XMLProcessor,
            sheet: r.SheetProcessor,
            font: r.FontProcessor,
            bin: r.BinaryProcessor,
            commonjs: r.CommonJSProcessor,
            sound: r.SoundProcessor,
            movieclip: r.MovieClipProcessor,
            mergeJson: r.MergeJSONProcessor,
            legacyResourceConfig: r.LegacyResourceConfigProcessor
        }
    }(r = e.processor || (e.processor = {}))
}(RES || (RES = {}));
var RES;
! function(e) {
    var r = function(r) {
        function t(e, t, o) {
            void 0 === t && (t = !1), void 0 === o && (o = !1);
            var n = r.call(this, e, t, o) || this;
            return n.itemsLoaded = 0, n.itemsTotal = 0, n.groupName = "", n
        }
        return __extends(t, r), t.dispatchResourceEvent = function(r, o, n, i, s, a) {
            void 0 === n && (n = ""), void 0 === i && (i = void 0), void 0 === s && (s = 0), void 0 === a && (a = 0);
            var u = egret.Event.create(t, o);
            u.groupName = n, i && (u.resItem = e.ResourceItem.convertToResItem(i)), u.itemsLoaded = s, u.itemsTotal = a;
            var c = r.dispatchEvent(u);
            return egret.Event.release(u), c
        }, t.ITEM_LOAD_ERROR = "itemLoadError", t.CONFIG_COMPLETE = "configComplete", t.CONFIG_LOAD_ERROR = "configLoadError", t.GROUP_PROGRESS = "groupProgress", t.GROUP_COMPLETE = "groupComplete", t.GROUP_LOAD_ERROR = "groupLoadError", t
    }(egret.Event);
    e.ResourceEvent = r, __reflect(r.prototype, "RES.ResourceEvent")
}(RES || (RES = {}));
var RES;
! function(e) {
    var r;
    ! function(r) {
        function t(r) {
            var t = r.name;
            if (e.config.config)
                for (var o in e.config.config.alias) e.config.config.alias[o] == r.url && (t = o);
            else t = r.url;
            var n = {
                name: t,
                url: r.url,
                type: r.type,
                data: r,
                root: r.root
            };
            return n
        }
        r.TYPE_XML = "xml", r.TYPE_IMAGE = "image", r.TYPE_BIN = "bin", r.TYPE_TEXT = "text", r.TYPE_JSON = "json", r.TYPE_SHEET = "sheet", r.TYPE_FONT = "font", r.TYPE_SOUND = "sound", r.convertToResItem = t
    }(r = e.ResourceItem || (e.ResourceItem = {}))
}(RES || (RES = {}));
var RES;
! function(e) {
    var r = function() {
        function r(e) {
            this.data = e
        }
        return r.prototype.profile = function() {
            console.log(this.data)
        }, r.prototype.addFile = function(r, t) {
            t || (t = ""), r = e.path.normalize(r);
            var o = e.path.basename(r),
                n = e.path.dirname(r);
            this.exists(n) || this.mkdir(n);
            var i = this.resolve(n);
            i[o] = {
                url: r,
                type: t
            }
        }, r.prototype.getFile = function(e) {
            var r = this.resolve(e);
            return r && (r.name = e), r
        }, r.prototype.resolve = function(r) {
            if ("" == r) return this.data;
            r = e.path.normalize(r);
            for (var t = r.split("/"), o = this.data, n = 0, i = t; n < i.length; n++) {
                var s = i[n];
                if (!o) return o;
                o = o[s]
            }
            return o
        }, r.prototype.mkdir = function(r) {
            r = e.path.normalize(r);
            for (var t = r.split("/"), o = this.data, n = 0, i = t; n < i.length; n++) {
                var s = i[n];
                o[s] || (o[s] = {}), o = o[s]
            }
        }, r.prototype.exists = function(r) {
            if ("" == r) return !0;
            r = e.path.normalize(r);
            for (var t = r.split("/"), o = this.data, n = 0, i = t; n < i.length; n++) {
                var s = i[n];
                if (!o[s]) return !1;
                o = o[s]
            }
            return !0
        }, r
    }();
    e.NewFileSystem = r, __reflect(r.prototype, "RES.NewFileSystem")
}(RES || (RES = {}));
var RES;
! function(e) {
    var r = function() {
        function e() {}
        return e.prototype.init = function() {
            return this.versionInfo = this.getLocalData("all.manifest"), Promise.resolve()
        }, e.prototype.getVirtualUrl = function(e) {
            return e
        }, e.prototype.getLocalData = function(e) {
            if (egret_native.readUpdateFileSync && egret_native.readResourceFileSync) {
                var r = egret_native.readUpdateFileSync(e);
                if (null != r) return JSON.parse(r);
                if (r = egret_native.readResourceFileSync(e), null != r) return JSON.parse(r)
            }
            return null
        }, e
    }();
    e.NativeVersionController = r, __reflect(r.prototype, "RES.NativeVersionController", ["RES.IVersionController"]), egret.Capabilities.runtimeType == egret.RuntimeType.NATIVE && (e.VersionController = r)
}(RES || (RES = {}));