(function () {
  'use strict';

  function errMsg(errCode, msg) {
    return (msg || "") + " (SystemJS Error#" + errCode + " " + "https://git.io/JvFET#" + errCode + ")";
  }

  var hasSymbol = typeof Symbol !== 'undefined';
  var hasSelf = typeof self !== 'undefined';
  var hasDocument = typeof document !== 'undefined';

  var envGlobal = hasSelf ? self : global;

  var baseUrl$1;

  if (hasDocument) {
    var baseEl = document.querySelector('base[href]');
    if (baseEl)
      baseUrl$1 = baseEl.href;
  }

  if (!baseUrl$1 && typeof location !== 'undefined') {
    baseUrl$1 = location.href.split('#')[0].split('?')[0];
    var lastSepIndex = baseUrl$1.lastIndexOf('/');
    if (lastSepIndex !== -1)
      baseUrl$1 = baseUrl$1.slice(0, lastSepIndex + 1);
  }

  if (!baseUrl$1 && typeof process !== 'undefined') {
    var cwd = process.cwd();
    // TODO: encoding edge cases
    baseUrl$1 = 'file://' + (cwd[0] === '/' ? '' : '/') + cwd.replace(/\\/g, '/') + '/';
  }

  var backslashRegEx = /\\/g;
  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      var parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      var pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.slice(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/')
        return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      var segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

      var output = [];
      var segmentIndex = -1;
      for (var i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        }

        // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
          }
          else {
            // the start of a new segment as below
            segmentIndex = i;
          }
        }
        // it is the start of a new segment
        else {
          segmentIndex = i;
        }
      }
      // finish reading out the last segment
      if (segmentIndex !== -1)
        output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  /*
   * Import maps implementation
   *
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   *
   */

  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (relUrl.indexOf(':') !== -1 ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap, parentUrl) {
    for (var p in packages) {
      var resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      var rhs = packages[p];
      // package fallbacks not currently supported
      if (typeof rhs !== 'string')
        continue;
      var mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);
      if (!mapped) {
        targetWarning('W1', p, rhs, 'bare specifier did not resolve');
      }
      else
        outPackages[resolvedLhs] = mapped;
    }
  }

  function resolveAndComposeImportMap (json, baseUrl, outMap) {
    if (json.imports)
      resolveAndComposePackages(json.imports, outMap.imports, baseUrl, outMap, null);

    var u;
    for (u in json.scopes || {}) {
      var resolvedScope = resolveUrl(u, baseUrl);
      resolveAndComposePackages(json.scopes[u], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, outMap, resolvedScope);
    }

    for (u in json.depcache || {})
      outMap.depcache[resolveUrl(u, baseUrl)] = json.depcache[u];
    
    for (u in json.integrity || {})
      outMap.integrity[resolveUrl(u, baseUrl)] = json.integrity[u];
  }

  function getMatch (path, matchObj) {
    if (matchObj[path])
      return path;
    var sepIndex = path.length;
    do {
      var segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages) {
    var pkgName = getMatch(id, packages);
    if (pkgName) {
      var pkg = packages[pkgName];
      if (pkg === null) return;
      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') {
        targetWarning('W2', pkgName, pkg, "should have a trailing '/'");
      }
      else
        return pkg + id.slice(pkgName.length);
    }
  }

  function targetWarning (code, match, target, msg) {
    console.warn(errMsg(code, "Package target " + msg + ", resolving target '" + target + "' for " + match));
  }

  function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
    var scopes = importMap.scopes;
    var scopeUrl = parentUrl && getMatch(parentUrl, scopes);
    while (scopeUrl) {
      var packageResolution = applyPackages(resolvedOrPlain, scopes[scopeUrl]);
      if (packageResolution)
        return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), scopes);
    }
    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
  }

  /*
   * SystemJS Core
   * 
   * Provides
   * - System.import
   * - System.register support for
   *     live bindings, function hoisting through circular references,
   *     reexports, dynamic import, import.meta.url, top-level await
   * - System.getRegister to get the registration
   * - Symbol.toStringTag support in Module objects
   * - Hookable System.createContext to customize import.meta
   * - System.onload(err, id, deps) handler for tracing / hot-reloading
   * 
   * Core comes with no System.prototype.resolve or
   * System.prototype.instantiate implementations
   */

  var toStringTag$1 = hasSymbol && Symbol.toStringTag;
  var REGISTRY = hasSymbol ? Symbol() : '@';

  function SystemJS () {
    this[REGISTRY] = {};
  }

  var systemJSPrototype$1 = SystemJS.prototype;

  systemJSPrototype$1.import = function (id, parentUrl) {
    var loader = this;
    return Promise.resolve(loader.prepareImport())
    .then(function() {
      return loader.resolve(id, parentUrl);
    })
    .then(function (id) {
      var load = getOrCreateLoad(loader, id);
      return load.C || topLevelLoad(loader, load);
    });
  };

  // Hookable createContext function -> allowing eg custom import meta
  systemJSPrototype$1.createContext = function (parentId) {
    var loader = this;
    return {
      url: parentId,
      resolve: function (id, parentUrl) {
        return Promise.resolve(loader.resolve(id, parentUrl || parentId));
      }
    };
  };

  // onLoad(err, id, deps) provided for tracing / hot-reloading
  systemJSPrototype$1.onload = function () {};
  function loadToId (load) {
    return load.id;
  }
  function triggerOnload (loader, load, err, isErrSource) {
    loader.onload(err, load.id, load.d && load.d.map(loadToId), !!isErrSource);
    if (err)
      throw err;
  }

  var lastRegister;
  systemJSPrototype$1.register = function (deps, declare) {
    lastRegister = [deps, declare];
  };

  /*
   * getRegister provides the last anonymous System.register call
   */
  systemJSPrototype$1.getRegister = function () {
    var _lastRegister = lastRegister;
    lastRegister = undefined;
    return _lastRegister;
  };

  function getOrCreateLoad (loader, id, firstParentUrl) {
    var load = loader[REGISTRY][id];
    if (load)
      return load;

    var importerSetters = [];
    var ns = Object.create(null);
    if (toStringTag$1)
      Object.defineProperty(ns, toStringTag$1, { value: 'Module' });
    
    var instantiatePromise = Promise.resolve()
    .then(function () {
      return loader.instantiate(id, firstParentUrl);
    })
    .then(function (registration) {
      if (!registration)
        throw Error(errMsg(2, 'Module ' + id + ' did not instantiate'));
      function _export (name, value) {
        // note if we have hoisted exports (including reexports)
        load.h = true;
        var changed = false;
        if (typeof name === 'string') {
          if (!(name in ns) || ns[name] !== value) {
            ns[name] = value;
            changed = true;
          }
        }
        else {
          for (var p in name) {
            var value = name[p];
            if (!(p in ns) || ns[p] !== value) {
              ns[p] = value;
              changed = true;
            }
          }

          if (name.__esModule) {
            ns.__esModule = name.__esModule;
          }
        }
        if (changed)
          for (var i = 0; i < importerSetters.length; i++) {
            var setter = importerSetters[i];
            if (setter) setter(ns);
          }
        return value;
      }
      var declared = registration[1](_export, registration[1].length === 2 ? {
        import: function (importId) {
          return loader.import(importId, id);
        },
        meta: loader.createContext(id)
      } : undefined);
      load.e = declared.execute || function () {};
      return [registration[0], declared.setters || []];
    }, function (err) {
      load.e = null;
      load.er = err;
      triggerOnload(loader, load, err, true);
      throw err;
    });

    var linkPromise = instantiatePromise
    .then(function (instantiation) {
      return Promise.all(instantiation[0].map(function (dep, i) {
        var setter = instantiation[1][i];
        return Promise.resolve(loader.resolve(dep, id))
        .then(function (depId) {
          var depLoad = getOrCreateLoad(loader, depId, id);
          // depLoad.I may be undefined for already-evaluated
          return Promise.resolve(depLoad.I)
          .then(function () {
            if (setter) {
              depLoad.i.push(setter);
              // only run early setters when there are hoisted exports of that module
              // the timing works here as pending hoisted export calls will trigger through importerSetters
              if (depLoad.h || !depLoad.I)
                setter(depLoad.n);
            }
            return depLoad;
          });
        });
      }))
      .then(function (depLoads) {
        load.d = depLoads;
      });
    });
    linkPromise.catch(function () {});

    // Capital letter = a promise function
    return load = loader[REGISTRY][id] = {
      id: id,
      // importerSetters, the setters functions registered to this dependency
      // we retain this to add more later
      i: importerSetters,
      // module namespace object
      n: ns,

      // instantiate
      I: instantiatePromise,
      // link
      L: linkPromise,
      // whether it has hoisted exports
      h: false,

      // On instantiate completion we have populated:
      // dependency load records
      d: undefined,
      // execution function
      e: undefined,

      // On execution we have populated:
      // the execution error if any
      er: undefined,
      // in the case of TLA, the execution promise
      E: undefined,

      // On execution, L, I, E cleared

      // Promise for top-level completion
      C: undefined,

      // parent instantiator / executor
      p: undefined
    };
  }

  function instantiateAll (loader, load, parent, loaded) {
    if (!loaded[load.id]) {
      loaded[load.id] = true;
      // load.L may be undefined for already-instantiated
      return Promise.resolve(load.L)
      .then(function () {
        if (!load.p || load.p.e === null)
          load.p = parent;
        return Promise.all(load.d.map(function (dep) {
          return instantiateAll(loader, dep, parent, loaded);
        }));
      })
      .catch(function (err) {
        if (load.er)
          throw err;
        load.e = null;
        triggerOnload(loader, load, err, false);
        throw err;
      });
    }
  }

  function topLevelLoad (loader, load) {
    return load.C = instantiateAll(loader, load, load, {})
    .then(function () {
      return postOrderExec(loader, load, {});
    })
    .then(function () {
      return load.n;
    });
  }

  // the closest we can get to call(undefined)
  var nullContext = Object.freeze(Object.create(null));

  // Equivalent to `Promise.prototype.finally`
  // https://gist.github.com/developit/d970bac18430943e4b3392b029a2a96c
  var promisePrototypeFinally = Promise.prototype.finally || function (callback) {
      if (typeof callback !== 'function') {
          return this.then(callback, callback);
      }
      const P = this.constructor || Promise;
      return this.then(
          value => P.resolve(callback()).then(() => value),
          err => P.resolve(callback()).then(() => { throw err; }),
      );
  };

  // returns a promise if and only if a top-level await subgraph
  // throws on sync errors
  function postOrderExec (loader, load, seen) {
    if (seen[load.id]) {
      return load.E;
    }
    seen[load.id] = true;

    if (!load.e) {
      if (load.er)
        throw load.er;
      if (load.E)
        return load.E;
      return;
    }

    // From here we're about to execute the load.
    // Because the execution may be async, we pop the `load.e` first.
    // So `load.e === null` always means the load has been executed or is executing.
    // To inspect the state:
    // - If `load.er` is truthy, the execution has threw or has been rejected;
    // - otherwise, either the `load.E` is a promise, means it's under async execution, or
    // - the `load.E` is null, means the load has completed the execution or has been async resolved.
    const exec = load.e;
    load.e = null;

    // deps execute first, unless circular
    var depLoadPromises;
    load.d.forEach(function (depLoad) {
      try {
        var depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise) 
          (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
      }
      catch (err) {
        load.er = err;
        triggerOnload(loader, load, err, false);
        throw err;
      }
    });
    if (depLoadPromises)
      return load.E = promisePrototypeFinally.call(Promise.all(depLoadPromises).then(doExec), function() {
          load.E = null;
      });

    var execPromise = doExec();
    if (execPromise) {
      return load.E = promisePrototypeFinally.call(execPromise, function() {
          load.E = null;
      });
    }

    function doExec () {
      try {
        var execPromise = exec.call(nullContext);
        if (execPromise) {
          execPromise = execPromise.then(function () {
            load.C = load.n;
            if (!false) triggerOnload(loader, load, null, true);
          }, function (err) {
            load.er = err;
            if (!false) triggerOnload(loader, load, err, true);
            throw err;
          });
          return execPromise;
        }
        // (should be a promise, but a minify optimization to leave out Promise.resolve)
        load.C = load.n;
        load.L = load.I = undefined;
      }
      catch (err) {
        load.er = err;
        throw err;
      }
      finally {
        triggerOnload(loader, load, load.er, true);
      }
    }
  }

  envGlobal.System = new SystemJS();

  const globalObj = (function getGlobalObj() {
      if (typeof $global !== 'undefined') {
          return $global;
      }
      else if (typeof getApp === 'function') {
          return getApp().GameGlobal;
      }
  })();
  const systemGlobal = (typeof globalObj !== 'undefined' ? globalObj.System : System);
  const systemJSPrototype = systemGlobal.constructor.prototype;

  systemJSPrototype.instantiate = function (url, firstParentUrl) {
      throw new Error(`Unable to instantiate ${url} from ${firstParentUrl}`);
  };

  var toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;

  systemJSPrototype$1.get = function (id) {
    var load = this[REGISTRY][id];
    if (load && load.e === null && !load.E) {
      if (load.er)
        return null;
      return load.n;
    }
  };

  systemJSPrototype$1.set = function (id, module) {
    {
      try {
        // No page-relative URLs allowed
        new URL(id);
      } catch (err) {
        console.warn(Error(errMsg('W3', '"' + id + '" is not a valid URL to set in the module registry')));
      }
    }
    var ns;
    if (toStringTag && module[toStringTag] === 'Module') {
      ns = module;
    }
    else {
      ns = Object.assign(Object.create(null), module);
      if (toStringTag)
        Object.defineProperty(ns, toStringTag, { value: 'Module' });
    }

    var done = Promise.resolve(ns);

    var load = this[REGISTRY][id] || (this[REGISTRY][id] = {
      id: id,
      i: [],
      h: false,
      d: [],
      e: null,
      er: undefined,
      E: undefined
    });

    if (load.e || load.E)
      return false;
    
    Object.assign(load, {
      n: ns,
      I: undefined,
      L: undefined,
      C: done
    });
    return ns;
  };

  systemJSPrototype$1.has = function (id) {
    var load = this[REGISTRY][id];
    return !!load;
  };

  // Delete function provided for hot-reloading use cases
  systemJSPrototype$1.delete = function (id) {
    var registry = this[REGISTRY];
    var load = registry[id];
    // in future we can support load.E case by failing load first
    // but that will require TLA callbacks to be implemented
    if (!load || (load.p && load.p.e !== null) || load.E)
      return false;

    var importerSetters = load.i;
    // remove from importerSetters
    // (release for gc)
    if (load.d)
      load.d.forEach(function (depLoad) {
        var importerIndex = depLoad.i.indexOf(load);
        if (importerIndex !== -1)
          depLoad.i.splice(importerIndex, 1);
      });
    delete registry[id];
    return function () {
      var load = registry[id];
      if (!load || !importerSetters || load.e !== null || load.E)
        return false;
      // add back the old setters
      importerSetters.forEach(function (setter) {
        load.i.push(setter);
        setter(load.n);
      });
      importerSetters = null;
    };
  };

  var iterator = typeof Symbol !== 'undefined' && Symbol.iterator;

  systemJSPrototype$1.entries = function () {
    var loader = this, keys = Object.keys(loader[REGISTRY]);
    var index = 0, ns, key;
    var result = {
      next: function () {
        while (
          (key = keys[index++]) !== undefined && 
          (ns = loader.get(key)) === undefined
        );
        return {
          done: key === undefined,
          value: key !== undefined && [key, ns]
        };
      }
    };

    result[iterator] = function() { return this };

    return result;
  };

  // @ts-ignore
  let baseUrl = baseUrl$1;
  function setBaseUrl(url) {
      baseUrl = url;
  }

  // @ts-ignore
  const importMap = { imports: {}, scopes: {} };
  function setImportMap(json, location) {
      resolveAndComposeImportMap(json, location || baseUrl, importMap);
  }
  function extendsImportMap(json, location) {
      const importMapUrl = resolveIfNotPlainOrUrl(location, baseUrl);
      resolveAndComposeImportMap(json, importMapUrl || location, importMap);
  }
  function throwUnresolved(id, parentUrl) {
      throw new Error(`Unresolved id: ${id} from parentUrl: ${parentUrl}`);
  }
  systemJSPrototype.resolve = function (id, parentUrl) {
      parentUrl = parentUrl || baseUrl;
      return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  };

  function warmup ({ pathname = '/', importMap, importMapUrl, importMapList, defaultHandler, handlers, }) {
      const baseUrlSchema = 'no-schema:';
      setBaseUrl(`${baseUrlSchema}${pathname}`);
      if (importMapUrl && importMap) {
          setImportMap(importMap, `${baseUrlSchema}/${importMapUrl}`);
      }
      if (Array.isArray(importMapList)) {
          for (const e of importMapList) {
              extendsImportMap(e.map, e.location);
          }
      }
      if (defaultHandler) {
          hookInstantiationOverSchema(baseUrlSchema, wrapHandler(defaultHandler));
      }
      if (handlers) {
          for (const protocol of Object.keys(handlers)) {
              hookInstantiationOverSchema(protocol, wrapHandler(handlers[protocol]));
          }
      }
  }
  function isThenable(value) {
      // https://stackoverflow.com/a/53955664/10602525
      return Boolean(value && typeof value.then === 'function');
  }
  function foundKeyByValueInImportMap(value) {
      const imports = importMap.imports;
      for (const k in imports) {
          const v = imports[k];
          if (v && (value === v || `no-schema:/${value}` === v)) {
              return k;
          }
      }
      return null;
  }
  function tryGetRegister(context, urlNoSchema) {
      let ret;
      let registerKey = urlNoSchema;
      if (registerKey.startsWith('/')) {
          registerKey = registerKey.slice(1);
      }
      const key = foundKeyByValueInImportMap(registerKey);
      if (key) {
          registerKey = key;
      }
      if (context.registerRegistry && (ret = context.registerRegistry[registerKey])) {
          context.registerRegistry[registerKey] = null;
      }
      return ret;
  }
  /**
   * Returns a SystemJS instantiation hook which calls `handler` and get the register.
   */
  function wrapHandler(handler) {
      return function (urlNoSchema) {
          // @ts-ignore
          const context = this;
          const register = tryGetRegister(context, urlNoSchema);
          if (register) {
              return register;
          }
          let retVal;
          try {
              retVal = handler(urlNoSchema);
          }
          catch (err) {
              return Promise.reject(err);
          }
          if (!isThenable(retVal)) {
              return context.getRegister();
          }
          else {
              // We can not directly `return Promise.resolve(retVal)`
              // since once we get the returns, the `System.register()` should have been called.
              // If it's synchronized, `Promise.resolve()` defers the `this.getRegister()`
              // which means other `System.register()` may happen before we resolved the promise.
              return new Promise((resolve) => {
                  return retVal.then(() => {
                      resolve(context.getRegister());
                  });
              });
          }
      };
  }
  function hookInstantiationOverSchema(schema, hook) {
      const venderInstantiate = systemJSPrototype.instantiate;
      systemJSPrototype.instantiate = function (url, firstParentUrl) {
          const schemaErased = url.substr(0, schema.length) === schema ?
              url.substr(schema.length) : null;
          return schemaErased === null ?
              venderInstantiate.call(this, url, firstParentUrl) :
              hook.call(this, schemaErased, firstParentUrl);
      };
  }

  systemJSPrototype.prepareImport = function () { return Promise.resolve(); };
  // @ts-ignore this should be a private interface
  systemJSPrototype.warmup = warmup;

  /*
   * SystemJS named register extension
   * Supports System.register('name', [..deps..], function (_export, _context) { ... })
   * 
   * Names are written to the registry as-is
   * System.register('x', ...) can be imported as System.import('x')
   */
  (function (global) {
    var System = global.System;
    setRegisterRegistry(System);
    var systemJSPrototype = System.constructor.prototype;
    var constructor = System.constructor;
    var SystemJS = function () {
      constructor.call(this);
      setRegisterRegistry(this);
    };
    SystemJS.prototype = systemJSPrototype;
    System.constructor = SystemJS;

    var firstNamedDefine;

    function setRegisterRegistry(systemInstance) {
      systemInstance.registerRegistry = Object.create(null);
    }

    var register = systemJSPrototype.register;
    systemJSPrototype.register = function (name, deps, declare) {
      if (typeof name !== 'string')
        return register.apply(this, arguments);
      var define = [deps, declare];
      this.registerRegistry[name] = define;
      if (!firstNamedDefine) {
        firstNamedDefine = define;
        Promise.resolve().then(function () {
          firstNamedDefine = null;
        });
      }
      return register.apply(this, arguments);
    };

    var resolve = systemJSPrototype.resolve;
    systemJSPrototype.resolve = function (id, parentURL) {
      try {
        // Prefer import map (or other existing) resolution over the registerRegistry
        return resolve.call(this, id, parentURL);
      } catch (err) {
        if (id in this.registerRegistry) {
          return id;
        }
        throw err;
      }
    };

    var instantiate = systemJSPrototype.instantiate;
    systemJSPrototype.instantiate = function (url, firstParentUrl) {
      var result = this.registerRegistry[url];
      if (result) {
        this.registerRegistry[url] = null;
        return result;
      } else {
        return instantiate.call(this, url, firstParentUrl);
      }
    };

    var getRegister = systemJSPrototype.getRegister;
    systemJSPrototype.getRegister = function () {
      // Calling getRegister() because other extras need to know it was called so they can perform side effects
      var register = getRegister.call(this);

      var result = firstNamedDefine || register;
      firstNamedDefine = null;
      return result;
    };
  })(typeof self !== 'undefined' ? self : global);

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vVXNlcnMvQWRtaW5pc3RyYXRvci9BcHBEYXRhL1JvYW1pbmcvY29jb3MtZGVmYXVsdC9jb2Nvcy00LjAuMC1hbHBoYS4zL25vZGVfbW9kdWxlcy9AY29jb3MvbW9kdWxlLXN5c3RlbS9zeXN0ZW1qcy9zcmMvZXJyLW1zZy5qcyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vc3lzdGVtanMvc3JjL2NvbW1vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vc3lzdGVtanMvc3JjL3N5c3RlbS1jb3JlLmpzIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvQWRtaW5pc3RyYXRvci9BcHBEYXRhL1JvYW1pbmcvY29jb3MtZGVmYXVsdC9jb2Nvcy00LjAuMC1hbHBoYS4zL25vZGVfbW9kdWxlcy9AY29jb3MvbW9kdWxlLXN5c3RlbS9saWIvZ2xvYmFscy50cyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vbGliL3Rocm93LXVuaW5zdGFudGlhdGVkLnRzIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvQWRtaW5pc3RyYXRvci9BcHBEYXRhL1JvYW1pbmcvY29jb3MtZGVmYXVsdC9jb2Nvcy00LjAuMC1hbHBoYS4zL25vZGVfbW9kdWxlcy9AY29jb3MvbW9kdWxlLXN5c3RlbS9zeXN0ZW1qcy9zcmMvZmVhdHVyZXMvcmVnaXN0cnkuanMiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9BZG1pbmlzdHJhdG9yL0FwcERhdGEvUm9hbWluZy9jb2Nvcy1kZWZhdWx0L2NvY29zLTQuMC4wLWFscGhhLjMvbm9kZV9tb2R1bGVzL0Bjb2Nvcy9tb2R1bGUtc3lzdGVtL2xpYi93YXJtdXAvYmFzZS11cmwudHMiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9BZG1pbmlzdHJhdG9yL0FwcERhdGEvUm9hbWluZy9jb2Nvcy1kZWZhdWx0L2NvY29zLTQuMC4wLWFscGhhLjMvbm9kZV9tb2R1bGVzL0Bjb2Nvcy9tb2R1bGUtc3lzdGVtL2xpYi93YXJtdXAvaW1wb3J0LW1hcC50cyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vbGliL3dhcm11cC93YXJtdXAtY29tbW9uanMtbGlrZS50cyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vbGliL3dhcm11cC9pbmRleC50cyIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9ub2RlX21vZHVsZXMvQGNvY29zL21vZHVsZS1zeXN0ZW0vc3lzdGVtanMvc3JjL2V4dHJhcy9uYW1lZC1yZWdpc3Rlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZXJyTXNnKGVyckNvZGUsIG1zZykge1xuICBpZiAocHJvY2Vzcy5lbnYuU1lTVEVNX1BST0RVQ1RJT04pXG4gICAgcmV0dXJuIChtc2cgfHwgXCJcIikgKyBcIiAoU3lzdGVtSlMgaHR0cHM6Ly9naXQuaW8vSnZGRVQjXCIgKyBlcnJDb2RlICsgXCIpXCI7XG4gIGVsc2VcbiAgICByZXR1cm4gKG1zZyB8fCBcIlwiKSArIFwiIChTeXN0ZW1KUyBFcnJvciNcIiArIGVyckNvZGUgKyBcIiBcIiArIFwiaHR0cHM6Ly9naXQuaW8vSnZGRVQjXCIgKyBlcnJDb2RlICsgXCIpXCI7XG59IiwiaW1wb3J0IHsgZXJyTXNnIH0gZnJvbSAnLi9lcnItbXNnLmpzJztcblxuZXhwb3J0IHZhciBoYXNTeW1ib2wgPSB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJztcbmV4cG9ydCB2YXIgaGFzU2VsZiA9IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJztcbmV4cG9ydCB2YXIgaGFzRG9jdW1lbnQgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xuXG52YXIgZW52R2xvYmFsID0gaGFzU2VsZiA/IHNlbGYgOiBnbG9iYWw7XG5leHBvcnQgeyBlbnZHbG9iYWwgYXMgZ2xvYmFsIH07XG5cbi8vIExvYWRlci1zY29wZWQgYmFzZVVybCBhbmQgaW1wb3J0IG1hcCBzdXBwb3J0ZWQgaW4gTm9kZS5qcyBvbmx5XG5leHBvcnQgdmFyIEJBU0VfVVJMID0gaGFzU3ltYm9sID8gU3ltYm9sKCkgOiAnXyc7XG5leHBvcnQgdmFyIElNUE9SVF9NQVAgPSBoYXNTeW1ib2wgPyBTeW1ib2woKSA6ICcjJztcblxuZXhwb3J0IHZhciBiYXNlVXJsO1xuXG5pZiAoaGFzRG9jdW1lbnQpIHtcbiAgdmFyIGJhc2VFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Jhc2VbaHJlZl0nKTtcbiAgaWYgKGJhc2VFbClcbiAgICBiYXNlVXJsID0gYmFzZUVsLmhyZWY7XG59XG5cbmlmICghYmFzZVVybCAmJiB0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gIGJhc2VVcmwgPSBsb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXTtcbiAgdmFyIGxhc3RTZXBJbmRleCA9IGJhc2VVcmwubGFzdEluZGV4T2YoJy8nKTtcbiAgaWYgKGxhc3RTZXBJbmRleCAhPT0gLTEpXG4gICAgYmFzZVVybCA9IGJhc2VVcmwuc2xpY2UoMCwgbGFzdFNlcEluZGV4ICsgMSk7XG59XG5cbmlmICghcHJvY2Vzcy5lbnYuU1lTVEVNX0JST1dTRVIgJiYgIWJhc2VVcmwgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gIHZhciBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAvLyBUT0RPOiBlbmNvZGluZyBlZGdlIGNhc2VzXG4gIGJhc2VVcmwgPSAnZmlsZTovLycgKyAoY3dkWzBdID09PSAnLycgPyAnJyA6ICcvJykgKyBjd2QucmVwbGFjZSgvXFxcXC9nLCAnLycpICsgJy8nO1xufVxuXG52YXIgYmFja3NsYXNoUmVnRXggPSAvXFxcXC9nO1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVJZk5vdFBsYWluT3JVcmwgKHJlbFVybCwgcGFyZW50VXJsKSB7XG4gIGlmIChyZWxVcmwuaW5kZXhPZignXFxcXCcpICE9PSAtMSlcbiAgICByZWxVcmwgPSByZWxVcmwucmVwbGFjZShiYWNrc2xhc2hSZWdFeCwgJy8nKTtcbiAgLy8gcHJvdG9jb2wtcmVsYXRpdmVcbiAgaWYgKHJlbFVybFswXSA9PT0gJy8nICYmIHJlbFVybFsxXSA9PT0gJy8nKSB7XG4gICAgcmV0dXJuIHBhcmVudFVybC5zbGljZSgwLCBwYXJlbnRVcmwuaW5kZXhPZignOicpICsgMSkgKyByZWxVcmw7XG4gIH1cbiAgLy8gcmVsYXRpdmUtdXJsXG4gIGVsc2UgaWYgKHJlbFVybFswXSA9PT0gJy4nICYmIChyZWxVcmxbMV0gPT09ICcvJyB8fCByZWxVcmxbMV0gPT09ICcuJyAmJiAocmVsVXJsWzJdID09PSAnLycgfHwgcmVsVXJsLmxlbmd0aCA9PT0gMiAmJiAocmVsVXJsICs9ICcvJykpIHx8XG4gICAgICByZWxVcmwubGVuZ3RoID09PSAxICAmJiAocmVsVXJsICs9ICcvJykpIHx8XG4gICAgICByZWxVcmxbMF0gPT09ICcvJykge1xuICAgIHZhciBwYXJlbnRQcm90b2NvbCA9IHBhcmVudFVybC5zbGljZSgwLCBwYXJlbnRVcmwuaW5kZXhPZignOicpICsgMSk7XG4gICAgLy8gRGlzYWJsZWQsIGJ1dCB0aGVzZSBjYXNlcyB3aWxsIGdpdmUgaW5jb25zaXN0ZW50IHJlc3VsdHMgZm9yIGRlZXAgYmFja3RyYWNraW5nXG4gICAgLy9pZiAocGFyZW50VXJsW3BhcmVudFByb3RvY29sLmxlbmd0aF0gIT09ICcvJylcbiAgICAvLyAgdGhyb3cgRXJyb3IoJ0Nhbm5vdCByZXNvbHZlJyk7XG4gICAgLy8gcmVhZCBwYXRobmFtZSBmcm9tIHBhcmVudCBVUkxcbiAgICAvLyBwYXRobmFtZSB0YWtlbiB0byBiZSBwYXJ0IGFmdGVyIGxlYWRpbmcgXCIvXCJcbiAgICB2YXIgcGF0aG5hbWU7XG4gICAgaWYgKHBhcmVudFVybFtwYXJlbnRQcm90b2NvbC5sZW5ndGggKyAxXSA9PT0gJy8nKSB7XG4gICAgICAvLyByZXNvbHZpbmcgdG8gYSA6Ly8gc28gd2UgbmVlZCB0byByZWFkIG91dCB0aGUgYXV0aCBhbmQgaG9zdFxuICAgICAgaWYgKHBhcmVudFByb3RvY29sICE9PSAnZmlsZTonKSB7XG4gICAgICAgIHBhdGhuYW1lID0gcGFyZW50VXJsLnNsaWNlKHBhcmVudFByb3RvY29sLmxlbmd0aCArIDIpO1xuICAgICAgICBwYXRobmFtZSA9IHBhdGhuYW1lLnNsaWNlKHBhdGhuYW1lLmluZGV4T2YoJy8nKSArIDEpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHBhdGhuYW1lID0gcGFyZW50VXJsLnNsaWNlKDgpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHJlc29sdmluZyB0byA6LyBzbyBwYXRobmFtZSBpcyB0aGUgLy4uLiBwYXJ0XG4gICAgICBwYXRobmFtZSA9IHBhcmVudFVybC5zbGljZShwYXJlbnRQcm90b2NvbC5sZW5ndGggKyAocGFyZW50VXJsW3BhcmVudFByb3RvY29sLmxlbmd0aF0gPT09ICcvJykpO1xuICAgIH1cblxuICAgIGlmIChyZWxVcmxbMF0gPT09ICcvJylcbiAgICAgIHJldHVybiBwYXJlbnRVcmwuc2xpY2UoMCwgcGFyZW50VXJsLmxlbmd0aCAtIHBhdGhuYW1lLmxlbmd0aCAtIDEpICsgcmVsVXJsO1xuXG4gICAgLy8gam9pbiB0b2dldGhlciBhbmQgc3BsaXQgZm9yIHJlbW92YWwgb2YgLi4gYW5kIC4gc2VnbWVudHNcbiAgICAvLyBsb29waW5nIHRoZSBzdHJpbmcgaW5zdGVhZCBvZiBhbnl0aGluZyBmYW5jeSBmb3IgcGVyZiByZWFzb25zXG4gICAgLy8gJy4uLy4uLy4uLy4uLy4uL3onIHJlc29sdmVkIHRvICd4L3knIGlzIGp1c3QgJ3onXG4gICAgdmFyIHNlZ21lbnRlZCA9IHBhdGhuYW1lLnNsaWNlKDAsIHBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSArIHJlbFVybDtcblxuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWdtZW50ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIGJ1c3kgcmVhZGluZyBhIHNlZ21lbnQgLSBvbmx5IHRlcm1pbmF0ZSBvbiAnLydcbiAgICAgIGlmIChzZWdtZW50SW5kZXggIT09IC0xKSB7XG4gICAgICAgIGlmIChzZWdtZW50ZWRbaV0gPT09ICcvJykge1xuICAgICAgICAgIG91dHB1dC5wdXNoKHNlZ21lbnRlZC5zbGljZShzZWdtZW50SW5kZXgsIGkgKyAxKSk7XG4gICAgICAgICAgc2VnbWVudEluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbmV3IHNlZ21lbnQgLSBjaGVjayBpZiBpdCBpcyByZWxhdGl2ZVxuICAgICAgZWxzZSBpZiAoc2VnbWVudGVkW2ldID09PSAnLicpIHtcbiAgICAgICAgLy8gLi4vIHNlZ21lbnRcbiAgICAgICAgaWYgKHNlZ21lbnRlZFtpICsgMV0gPT09ICcuJyAmJiAoc2VnbWVudGVkW2kgKyAyXSA9PT0gJy8nIHx8IGkgKyAyID09PSBzZWdtZW50ZWQubGVuZ3RoKSkge1xuICAgICAgICAgIG91dHB1dC5wb3AoKTtcbiAgICAgICAgICBpICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gLi8gc2VnbWVudFxuICAgICAgICBlbHNlIGlmIChzZWdtZW50ZWRbaSArIDFdID09PSAnLycgfHwgaSArIDEgPT09IHNlZ21lbnRlZC5sZW5ndGgpIHtcbiAgICAgICAgICBpICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gdGhlIHN0YXJ0IG9mIGEgbmV3IHNlZ21lbnQgYXMgYmVsb3dcbiAgICAgICAgICBzZWdtZW50SW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpdCBpcyB0aGUgc3RhcnQgb2YgYSBuZXcgc2VnbWVudFxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlZ21lbnRJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGZpbmlzaCByZWFkaW5nIG91dCB0aGUgbGFzdCBzZWdtZW50XG4gICAgaWYgKHNlZ21lbnRJbmRleCAhPT0gLTEpXG4gICAgICBvdXRwdXQucHVzaChzZWdtZW50ZWQuc2xpY2Uoc2VnbWVudEluZGV4KSk7XG4gICAgcmV0dXJuIHBhcmVudFVybC5zbGljZSgwLCBwYXJlbnRVcmwubGVuZ3RoIC0gcGF0aG5hbWUubGVuZ3RoKSArIG91dHB1dC5qb2luKCcnKTtcbiAgfVxufVxuXG4vKlxuICogSW1wb3J0IG1hcHMgaW1wbGVtZW50YXRpb25cbiAqXG4gKiBUbyBtYWtlIGxvb2t1cHMgZmFzdCB3ZSBwcmUtcmVzb2x2ZSB0aGUgZW50aXJlIGltcG9ydCBtYXBcbiAqIGFuZCB0aGVuIG1hdGNoIGJhc2VkIG9uIGJhY2t0cmFja2VkIGhhc2ggbG9va3Vwc1xuICpcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVVybCAocmVsVXJsLCBwYXJlbnRVcmwpIHtcbiAgcmV0dXJuIHJlc29sdmVJZk5vdFBsYWluT3JVcmwocmVsVXJsLCBwYXJlbnRVcmwpIHx8IChyZWxVcmwuaW5kZXhPZignOicpICE9PSAtMSA/IHJlbFVybCA6IHJlc29sdmVJZk5vdFBsYWluT3JVcmwoJy4vJyArIHJlbFVybCwgcGFyZW50VXJsKSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVBbmRDb21wb3NlUGFja2FnZXMgKHBhY2thZ2VzLCBvdXRQYWNrYWdlcywgYmFzZVVybCwgcGFyZW50TWFwLCBwYXJlbnRVcmwpIHtcbiAgZm9yICh2YXIgcCBpbiBwYWNrYWdlcykge1xuICAgIHZhciByZXNvbHZlZExocyA9IHJlc29sdmVJZk5vdFBsYWluT3JVcmwocCwgYmFzZVVybCkgfHwgcDtcbiAgICB2YXIgcmhzID0gcGFja2FnZXNbcF07XG4gICAgLy8gcGFja2FnZSBmYWxsYmFja3Mgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWRcbiAgICBpZiAodHlwZW9mIHJocyAhPT0gJ3N0cmluZycpXG4gICAgICBjb250aW51ZTtcbiAgICB2YXIgbWFwcGVkID0gcmVzb2x2ZUltcG9ydE1hcChwYXJlbnRNYXAsIHJlc29sdmVJZk5vdFBsYWluT3JVcmwocmhzLCBiYXNlVXJsKSB8fCByaHMsIHBhcmVudFVybCk7XG4gICAgaWYgKCFtYXBwZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5TWVNURU1fUFJPRFVDVElPTilcbiAgICAgICAgdGFyZ2V0V2FybmluZygnVzEnLCBwLCByaHMpO1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRXYXJuaW5nKCdXMScsIHAsIHJocywgJ2JhcmUgc3BlY2lmaWVyIGRpZCBub3QgcmVzb2x2ZScpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICBvdXRQYWNrYWdlc1tyZXNvbHZlZExoc10gPSBtYXBwZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVBbmRDb21wb3NlSW1wb3J0TWFwIChqc29uLCBiYXNlVXJsLCBvdXRNYXApIHtcbiAgaWYgKGpzb24uaW1wb3J0cylcbiAgICByZXNvbHZlQW5kQ29tcG9zZVBhY2thZ2VzKGpzb24uaW1wb3J0cywgb3V0TWFwLmltcG9ydHMsIGJhc2VVcmwsIG91dE1hcCwgbnVsbCk7XG5cbiAgdmFyIHU7XG4gIGZvciAodSBpbiBqc29uLnNjb3BlcyB8fCB7fSkge1xuICAgIHZhciByZXNvbHZlZFNjb3BlID0gcmVzb2x2ZVVybCh1LCBiYXNlVXJsKTtcbiAgICByZXNvbHZlQW5kQ29tcG9zZVBhY2thZ2VzKGpzb24uc2NvcGVzW3VdLCBvdXRNYXAuc2NvcGVzW3Jlc29sdmVkU2NvcGVdIHx8IChvdXRNYXAuc2NvcGVzW3Jlc29sdmVkU2NvcGVdID0ge30pLCBiYXNlVXJsLCBvdXRNYXAsIHJlc29sdmVkU2NvcGUpO1xuICB9XG5cbiAgZm9yICh1IGluIGpzb24uZGVwY2FjaGUgfHwge30pXG4gICAgb3V0TWFwLmRlcGNhY2hlW3Jlc29sdmVVcmwodSwgYmFzZVVybCldID0ganNvbi5kZXBjYWNoZVt1XTtcbiAgXG4gIGZvciAodSBpbiBqc29uLmludGVncml0eSB8fCB7fSlcbiAgICBvdXRNYXAuaW50ZWdyaXR5W3Jlc29sdmVVcmwodSwgYmFzZVVybCldID0ganNvbi5pbnRlZ3JpdHlbdV07XG59XG5cbmZ1bmN0aW9uIGdldE1hdGNoIChwYXRoLCBtYXRjaE9iaikge1xuICBpZiAobWF0Y2hPYmpbcGF0aF0pXG4gICAgcmV0dXJuIHBhdGg7XG4gIHZhciBzZXBJbmRleCA9IHBhdGgubGVuZ3RoO1xuICBkbyB7XG4gICAgdmFyIHNlZ21lbnQgPSBwYXRoLnNsaWNlKDAsIHNlcEluZGV4ICsgMSk7XG4gICAgaWYgKHNlZ21lbnQgaW4gbWF0Y2hPYmopXG4gICAgICByZXR1cm4gc2VnbWVudDtcbiAgfSB3aGlsZSAoKHNlcEluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLycsIHNlcEluZGV4IC0gMSkpICE9PSAtMSlcbn1cblxuZnVuY3Rpb24gYXBwbHlQYWNrYWdlcyAoaWQsIHBhY2thZ2VzKSB7XG4gIHZhciBwa2dOYW1lID0gZ2V0TWF0Y2goaWQsIHBhY2thZ2VzKTtcbiAgaWYgKHBrZ05hbWUpIHtcbiAgICB2YXIgcGtnID0gcGFja2FnZXNbcGtnTmFtZV07XG4gICAgaWYgKHBrZyA9PT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmIChpZC5sZW5ndGggPiBwa2dOYW1lLmxlbmd0aCAmJiBwa2dbcGtnLmxlbmd0aCAtIDFdICE9PSAnLycpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5TWVNURU1fUFJPRFVDVElPTilcbiAgICAgICAgdGFyZ2V0V2FybmluZygnVzInLCBwa2dOYW1lLCBwa2cpO1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRXYXJuaW5nKCdXMicsIHBrZ05hbWUsIHBrZywgXCJzaG91bGQgaGF2ZSBhIHRyYWlsaW5nICcvJ1wiKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHBrZyArIGlkLnNsaWNlKHBrZ05hbWUubGVuZ3RoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0YXJnZXRXYXJuaW5nIChjb2RlLCBtYXRjaCwgdGFyZ2V0LCBtc2cpIHtcbiAgY29uc29sZS53YXJuKGVyck1zZyhjb2RlLCBwcm9jZXNzLmVudi5TWVNURU1fUFJPRFVDVElPTiA/IFt0YXJnZXQsIG1hdGNoXS5qb2luKCcsICcpIDogXCJQYWNrYWdlIHRhcmdldCBcIiArIG1zZyArIFwiLCByZXNvbHZpbmcgdGFyZ2V0ICdcIiArIHRhcmdldCArIFwiJyBmb3IgXCIgKyBtYXRjaCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUltcG9ydE1hcCAoaW1wb3J0TWFwLCByZXNvbHZlZE9yUGxhaW4sIHBhcmVudFVybCkge1xuICB2YXIgc2NvcGVzID0gaW1wb3J0TWFwLnNjb3BlcztcbiAgdmFyIHNjb3BlVXJsID0gcGFyZW50VXJsICYmIGdldE1hdGNoKHBhcmVudFVybCwgc2NvcGVzKTtcbiAgd2hpbGUgKHNjb3BlVXJsKSB7XG4gICAgdmFyIHBhY2thZ2VSZXNvbHV0aW9uID0gYXBwbHlQYWNrYWdlcyhyZXNvbHZlZE9yUGxhaW4sIHNjb3Blc1tzY29wZVVybF0pO1xuICAgIGlmIChwYWNrYWdlUmVzb2x1dGlvbilcbiAgICAgIHJldHVybiBwYWNrYWdlUmVzb2x1dGlvbjtcbiAgICBzY29wZVVybCA9IGdldE1hdGNoKHNjb3BlVXJsLnNsaWNlKDAsIHNjb3BlVXJsLmxhc3RJbmRleE9mKCcvJykpLCBzY29wZXMpO1xuICB9XG4gIHJldHVybiBhcHBseVBhY2thZ2VzKHJlc29sdmVkT3JQbGFpbiwgaW1wb3J0TWFwLmltcG9ydHMpIHx8IHJlc29sdmVkT3JQbGFpbi5pbmRleE9mKCc6JykgIT09IC0xICYmIHJlc29sdmVkT3JQbGFpbjtcbn1cbiIsIi8qXG4gKiBTeXN0ZW1KUyBDb3JlXG4gKiBcbiAqIFByb3ZpZGVzXG4gKiAtIFN5c3RlbS5pbXBvcnRcbiAqIC0gU3lzdGVtLnJlZ2lzdGVyIHN1cHBvcnQgZm9yXG4gKiAgICAgbGl2ZSBiaW5kaW5ncywgZnVuY3Rpb24gaG9pc3RpbmcgdGhyb3VnaCBjaXJjdWxhciByZWZlcmVuY2VzLFxuICogICAgIHJlZXhwb3J0cywgZHluYW1pYyBpbXBvcnQsIGltcG9ydC5tZXRhLnVybCwgdG9wLWxldmVsIGF3YWl0XG4gKiAtIFN5c3RlbS5nZXRSZWdpc3RlciB0byBnZXQgdGhlIHJlZ2lzdHJhdGlvblxuICogLSBTeW1ib2wudG9TdHJpbmdUYWcgc3VwcG9ydCBpbiBNb2R1bGUgb2JqZWN0c1xuICogLSBIb29rYWJsZSBTeXN0ZW0uY3JlYXRlQ29udGV4dCB0byBjdXN0b21pemUgaW1wb3J0Lm1ldGFcbiAqIC0gU3lzdGVtLm9ubG9hZChlcnIsIGlkLCBkZXBzKSBoYW5kbGVyIGZvciB0cmFjaW5nIC8gaG90LXJlbG9hZGluZ1xuICogXG4gKiBDb3JlIGNvbWVzIHdpdGggbm8gU3lzdGVtLnByb3RvdHlwZS5yZXNvbHZlIG9yXG4gKiBTeXN0ZW0ucHJvdG90eXBlLmluc3RhbnRpYXRlIGltcGxlbWVudGF0aW9uc1xuICovXG5pbXBvcnQgeyBnbG9iYWwsIGhhc1N5bWJvbCB9IGZyb20gJy4vY29tbW9uLmpzJztcbmltcG9ydCB7IGVyck1zZyB9IGZyb20gJy4vZXJyLW1zZy5qcyc7XG5leHBvcnQgeyBzeXN0ZW1KU1Byb3RvdHlwZSwgUkVHSVNUUlkgfVxuXG52YXIgdG9TdHJpbmdUYWcgPSBoYXNTeW1ib2wgJiYgU3ltYm9sLnRvU3RyaW5nVGFnO1xudmFyIFJFR0lTVFJZID0gaGFzU3ltYm9sID8gU3ltYm9sKCkgOiAnQCc7XG5cbmZ1bmN0aW9uIFN5c3RlbUpTICgpIHtcbiAgdGhpc1tSRUdJU1RSWV0gPSB7fTtcbn1cblxudmFyIHN5c3RlbUpTUHJvdG90eXBlID0gU3lzdGVtSlMucHJvdG90eXBlO1xuXG5zeXN0ZW1KU1Byb3RvdHlwZS5pbXBvcnQgPSBmdW5jdGlvbiAoaWQsIHBhcmVudFVybCkge1xuICB2YXIgbG9hZGVyID0gdGhpcztcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShsb2FkZXIucHJlcGFyZUltcG9ydCgpKVxuICAudGhlbihmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbG9hZGVyLnJlc29sdmUoaWQsIHBhcmVudFVybCk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBsb2FkID0gZ2V0T3JDcmVhdGVMb2FkKGxvYWRlciwgaWQpO1xuICAgIHJldHVybiBsb2FkLkMgfHwgdG9wTGV2ZWxMb2FkKGxvYWRlciwgbG9hZCk7XG4gIH0pO1xufTtcblxuLy8gSG9va2FibGUgY3JlYXRlQ29udGV4dCBmdW5jdGlvbiAtPiBhbGxvd2luZyBlZyBjdXN0b20gaW1wb3J0IG1ldGFcbnN5c3RlbUpTUHJvdG90eXBlLmNyZWF0ZUNvbnRleHQgPSBmdW5jdGlvbiAocGFyZW50SWQpIHtcbiAgdmFyIGxvYWRlciA9IHRoaXM7XG4gIHJldHVybiB7XG4gICAgdXJsOiBwYXJlbnRJZCxcbiAgICByZXNvbHZlOiBmdW5jdGlvbiAoaWQsIHBhcmVudFVybCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShsb2FkZXIucmVzb2x2ZShpZCwgcGFyZW50VXJsIHx8IHBhcmVudElkKSk7XG4gICAgfVxuICB9O1xufTtcblxuLy8gb25Mb2FkKGVyciwgaWQsIGRlcHMpIHByb3ZpZGVkIGZvciB0cmFjaW5nIC8gaG90LXJlbG9hZGluZ1xuaWYgKCFwcm9jZXNzLmVudi5TWVNURU1fUFJPRFVDVElPTilcbiAgc3lzdGVtSlNQcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24gKCkge307XG5mdW5jdGlvbiBsb2FkVG9JZCAobG9hZCkge1xuICByZXR1cm4gbG9hZC5pZDtcbn1cbmZ1bmN0aW9uIHRyaWdnZXJPbmxvYWQgKGxvYWRlciwgbG9hZCwgZXJyLCBpc0VyclNvdXJjZSkge1xuICBsb2FkZXIub25sb2FkKGVyciwgbG9hZC5pZCwgbG9hZC5kICYmIGxvYWQuZC5tYXAobG9hZFRvSWQpLCAhIWlzRXJyU291cmNlKTtcbiAgaWYgKGVycilcbiAgICB0aHJvdyBlcnI7XG59XG5cbnZhciBsYXN0UmVnaXN0ZXI7XG5zeXN0ZW1KU1Byb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkZXBzLCBkZWNsYXJlKSB7XG4gIGxhc3RSZWdpc3RlciA9IFtkZXBzLCBkZWNsYXJlXTtcbn07XG5cbi8qXG4gKiBnZXRSZWdpc3RlciBwcm92aWRlcyB0aGUgbGFzdCBhbm9ueW1vdXMgU3lzdGVtLnJlZ2lzdGVyIGNhbGxcbiAqL1xuc3lzdGVtSlNQcm90b3R5cGUuZ2V0UmVnaXN0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfbGFzdFJlZ2lzdGVyID0gbGFzdFJlZ2lzdGVyO1xuICBsYXN0UmVnaXN0ZXIgPSB1bmRlZmluZWQ7XG4gIHJldHVybiBfbGFzdFJlZ2lzdGVyO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlTG9hZCAobG9hZGVyLCBpZCwgZmlyc3RQYXJlbnRVcmwpIHtcbiAgdmFyIGxvYWQgPSBsb2FkZXJbUkVHSVNUUlldW2lkXTtcbiAgaWYgKGxvYWQpXG4gICAgcmV0dXJuIGxvYWQ7XG5cbiAgdmFyIGltcG9ydGVyU2V0dGVycyA9IFtdO1xuICB2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAodG9TdHJpbmdUYWcpXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCB0b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gIFxuICB2YXIgaW5zdGFudGlhdGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKClcbiAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsb2FkZXIuaW5zdGFudGlhdGUoaWQsIGZpcnN0UGFyZW50VXJsKTtcbiAgfSlcbiAgLnRoZW4oZnVuY3Rpb24gKHJlZ2lzdHJhdGlvbikge1xuICAgIGlmICghcmVnaXN0cmF0aW9uKVxuICAgICAgdGhyb3cgRXJyb3IoZXJyTXNnKDIsIHByb2Nlc3MuZW52LlNZU1RFTV9QUk9EVUNUSU9OID8gaWQgOiAnTW9kdWxlICcgKyBpZCArICcgZGlkIG5vdCBpbnN0YW50aWF0ZScpKTtcbiAgICBmdW5jdGlvbiBfZXhwb3J0IChuYW1lLCB2YWx1ZSkge1xuICAgICAgLy8gbm90ZSBpZiB3ZSBoYXZlIGhvaXN0ZWQgZXhwb3J0cyAoaW5jbHVkaW5nIHJlZXhwb3J0cylcbiAgICAgIGxvYWQuaCA9IHRydWU7XG4gICAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoIShuYW1lIGluIG5zKSB8fCBuc1tuYW1lXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBuc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgcCBpbiBuYW1lKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gbmFtZVtwXTtcbiAgICAgICAgICBpZiAoIShwIGluIG5zKSB8fCBuc1twXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG5zW3BdID0gdmFsdWU7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmFtZS5fX2VzTW9kdWxlKSB7XG4gICAgICAgICAgbnMuX19lc01vZHVsZSA9IG5hbWUuX19lc01vZHVsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZWQpXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1wb3J0ZXJTZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHNldHRlciA9IGltcG9ydGVyU2V0dGVyc1tpXTtcbiAgICAgICAgICBpZiAoc2V0dGVyKSBzZXR0ZXIobnMpO1xuICAgICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHZhciBkZWNsYXJlZCA9IHJlZ2lzdHJhdGlvblsxXShfZXhwb3J0LCByZWdpc3RyYXRpb25bMV0ubGVuZ3RoID09PSAyID8ge1xuICAgICAgaW1wb3J0OiBmdW5jdGlvbiAoaW1wb3J0SWQpIHtcbiAgICAgICAgcmV0dXJuIGxvYWRlci5pbXBvcnQoaW1wb3J0SWQsIGlkKTtcbiAgICAgIH0sXG4gICAgICBtZXRhOiBsb2FkZXIuY3JlYXRlQ29udGV4dChpZClcbiAgICB9IDogdW5kZWZpbmVkKTtcbiAgICBsb2FkLmUgPSBkZWNsYXJlZC5leGVjdXRlIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgIHJldHVybiBbcmVnaXN0cmF0aW9uWzBdLCBkZWNsYXJlZC5zZXR0ZXJzIHx8IFtdXTtcbiAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgIGxvYWQuZSA9IG51bGw7XG4gICAgbG9hZC5lciA9IGVycjtcbiAgICBpZiAoIXByb2Nlc3MuZW52LlNZU1RFTV9QUk9EVUNUSU9OKSB0cmlnZ2VyT25sb2FkKGxvYWRlciwgbG9hZCwgZXJyLCB0cnVlKTtcbiAgICB0aHJvdyBlcnI7XG4gIH0pO1xuXG4gIHZhciBsaW5rUHJvbWlzZSA9IGluc3RhbnRpYXRlUHJvbWlzZVxuICAudGhlbihmdW5jdGlvbiAoaW5zdGFudGlhdGlvbikge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChpbnN0YW50aWF0aW9uWzBdLm1hcChmdW5jdGlvbiAoZGVwLCBpKSB7XG4gICAgICB2YXIgc2V0dGVyID0gaW5zdGFudGlhdGlvblsxXVtpXTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobG9hZGVyLnJlc29sdmUoZGVwLCBpZCkpXG4gICAgICAudGhlbihmdW5jdGlvbiAoZGVwSWQpIHtcbiAgICAgICAgdmFyIGRlcExvYWQgPSBnZXRPckNyZWF0ZUxvYWQobG9hZGVyLCBkZXBJZCwgaWQpO1xuICAgICAgICAvLyBkZXBMb2FkLkkgbWF5IGJlIHVuZGVmaW5lZCBmb3IgYWxyZWFkeS1ldmFsdWF0ZWRcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXBMb2FkLkkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoc2V0dGVyKSB7XG4gICAgICAgICAgICBkZXBMb2FkLmkucHVzaChzZXR0ZXIpO1xuICAgICAgICAgICAgLy8gb25seSBydW4gZWFybHkgc2V0dGVycyB3aGVuIHRoZXJlIGFyZSBob2lzdGVkIGV4cG9ydHMgb2YgdGhhdCBtb2R1bGVcbiAgICAgICAgICAgIC8vIHRoZSB0aW1pbmcgd29ya3MgaGVyZSBhcyBwZW5kaW5nIGhvaXN0ZWQgZXhwb3J0IGNhbGxzIHdpbGwgdHJpZ2dlciB0aHJvdWdoIGltcG9ydGVyU2V0dGVyc1xuICAgICAgICAgICAgaWYgKGRlcExvYWQuaCB8fCAhZGVwTG9hZC5JKVxuICAgICAgICAgICAgICBzZXR0ZXIoZGVwTG9hZC5uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlcExvYWQ7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSkpXG4gICAgLnRoZW4oZnVuY3Rpb24gKGRlcExvYWRzKSB7XG4gICAgICBsb2FkLmQgPSBkZXBMb2FkcztcbiAgICB9KTtcbiAgfSk7XG4gIGlmICghcHJvY2Vzcy5lbnYuU1lTVEVNX0JST1dTRVIpXG4gICAgbGlua1Byb21pc2UuY2F0Y2goZnVuY3Rpb24gKCkge30pO1xuXG4gIC8vIENhcGl0YWwgbGV0dGVyID0gYSBwcm9taXNlIGZ1bmN0aW9uXG4gIHJldHVybiBsb2FkID0gbG9hZGVyW1JFR0lTVFJZXVtpZF0gPSB7XG4gICAgaWQ6IGlkLFxuICAgIC8vIGltcG9ydGVyU2V0dGVycywgdGhlIHNldHRlcnMgZnVuY3Rpb25zIHJlZ2lzdGVyZWQgdG8gdGhpcyBkZXBlbmRlbmN5XG4gICAgLy8gd2UgcmV0YWluIHRoaXMgdG8gYWRkIG1vcmUgbGF0ZXJcbiAgICBpOiBpbXBvcnRlclNldHRlcnMsXG4gICAgLy8gbW9kdWxlIG5hbWVzcGFjZSBvYmplY3RcbiAgICBuOiBucyxcblxuICAgIC8vIGluc3RhbnRpYXRlXG4gICAgSTogaW5zdGFudGlhdGVQcm9taXNlLFxuICAgIC8vIGxpbmtcbiAgICBMOiBsaW5rUHJvbWlzZSxcbiAgICAvLyB3aGV0aGVyIGl0IGhhcyBob2lzdGVkIGV4cG9ydHNcbiAgICBoOiBmYWxzZSxcblxuICAgIC8vIE9uIGluc3RhbnRpYXRlIGNvbXBsZXRpb24gd2UgaGF2ZSBwb3B1bGF0ZWQ6XG4gICAgLy8gZGVwZW5kZW5jeSBsb2FkIHJlY29yZHNcbiAgICBkOiB1bmRlZmluZWQsXG4gICAgLy8gZXhlY3V0aW9uIGZ1bmN0aW9uXG4gICAgZTogdW5kZWZpbmVkLFxuXG4gICAgLy8gT24gZXhlY3V0aW9uIHdlIGhhdmUgcG9wdWxhdGVkOlxuICAgIC8vIHRoZSBleGVjdXRpb24gZXJyb3IgaWYgYW55XG4gICAgZXI6IHVuZGVmaW5lZCxcbiAgICAvLyBpbiB0aGUgY2FzZSBvZiBUTEEsIHRoZSBleGVjdXRpb24gcHJvbWlzZVxuICAgIEU6IHVuZGVmaW5lZCxcblxuICAgIC8vIE9uIGV4ZWN1dGlvbiwgTCwgSSwgRSBjbGVhcmVkXG5cbiAgICAvLyBQcm9taXNlIGZvciB0b3AtbGV2ZWwgY29tcGxldGlvblxuICAgIEM6IHVuZGVmaW5lZCxcblxuICAgIC8vIHBhcmVudCBpbnN0YW50aWF0b3IgLyBleGVjdXRvclxuICAgIHA6IHVuZGVmaW5lZFxuICB9O1xufVxuXG5mdW5jdGlvbiBpbnN0YW50aWF0ZUFsbCAobG9hZGVyLCBsb2FkLCBwYXJlbnQsIGxvYWRlZCkge1xuICBpZiAoIWxvYWRlZFtsb2FkLmlkXSkge1xuICAgIGxvYWRlZFtsb2FkLmlkXSA9IHRydWU7XG4gICAgLy8gbG9hZC5MIG1heSBiZSB1bmRlZmluZWQgZm9yIGFscmVhZHktaW5zdGFudGlhdGVkXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShsb2FkLkwpXG4gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFsb2FkLnAgfHwgbG9hZC5wLmUgPT09IG51bGwpXG4gICAgICAgIGxvYWQucCA9IHBhcmVudDtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChsb2FkLmQubWFwKGZ1bmN0aW9uIChkZXApIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbnRpYXRlQWxsKGxvYWRlciwgZGVwLCBwYXJlbnQsIGxvYWRlZCk7XG4gICAgICB9KSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgaWYgKGxvYWQuZXIpXG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIGxvYWQuZSA9IG51bGw7XG4gICAgICBpZiAoIXByb2Nlc3MuZW52LlNZU1RFTV9QUk9EVUNUSU9OKSB0cmlnZ2VyT25sb2FkKGxvYWRlciwgbG9hZCwgZXJyLCBmYWxzZSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9wTGV2ZWxMb2FkIChsb2FkZXIsIGxvYWQpIHtcbiAgcmV0dXJuIGxvYWQuQyA9IGluc3RhbnRpYXRlQWxsKGxvYWRlciwgbG9hZCwgbG9hZCwge30pXG4gIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcG9zdE9yZGVyRXhlYyhsb2FkZXIsIGxvYWQsIHt9KTtcbiAgfSlcbiAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsb2FkLm47XG4gIH0pO1xufVxuXG4vLyB0aGUgY2xvc2VzdCB3ZSBjYW4gZ2V0IHRvIGNhbGwodW5kZWZpbmVkKVxudmFyIG51bGxDb250ZXh0ID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKG51bGwpKTtcblxuLy8gRXF1aXZhbGVudCB0byBgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseWBcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2RldmVsb3BpdC9kOTcwYmFjMTg0MzA5NDNlNGIzMzkyYjAyOWEyYTk2Y1xudmFyIHByb21pc2VQcm90b3R5cGVGaW5hbGx5ID0gUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSB8fCBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4oY2FsbGJhY2ssIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgY29uc3QgUCA9IHRoaXMuY29uc3RydWN0b3IgfHwgUHJvbWlzZTtcbiAgICByZXR1cm4gdGhpcy50aGVuKFxuICAgICAgICB2YWx1ZSA9PiBQLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbigoKSA9PiB2YWx1ZSksXG4gICAgICAgIGVyciA9PiBQLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbigoKSA9PiB7IHRocm93IGVycjsgfSksXG4gICAgKTtcbn1cblxuLy8gcmV0dXJucyBhIHByb21pc2UgaWYgYW5kIG9ubHkgaWYgYSB0b3AtbGV2ZWwgYXdhaXQgc3ViZ3JhcGhcbi8vIHRocm93cyBvbiBzeW5jIGVycm9yc1xuZnVuY3Rpb24gcG9zdE9yZGVyRXhlYyAobG9hZGVyLCBsb2FkLCBzZWVuKSB7XG4gIGlmIChzZWVuW2xvYWQuaWRdKSB7XG4gICAgcmV0dXJuIGxvYWQuRTtcbiAgfVxuICBzZWVuW2xvYWQuaWRdID0gdHJ1ZTtcblxuICBpZiAoIWxvYWQuZSkge1xuICAgIGlmIChsb2FkLmVyKVxuICAgICAgdGhyb3cgbG9hZC5lcjtcbiAgICBpZiAobG9hZC5FKVxuICAgICAgcmV0dXJuIGxvYWQuRTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGcm9tIGhlcmUgd2UncmUgYWJvdXQgdG8gZXhlY3V0ZSB0aGUgbG9hZC5cbiAgLy8gQmVjYXVzZSB0aGUgZXhlY3V0aW9uIG1heSBiZSBhc3luYywgd2UgcG9wIHRoZSBgbG9hZC5lYCBmaXJzdC5cbiAgLy8gU28gYGxvYWQuZSA9PT0gbnVsbGAgYWx3YXlzIG1lYW5zIHRoZSBsb2FkIGhhcyBiZWVuIGV4ZWN1dGVkIG9yIGlzIGV4ZWN1dGluZy5cbiAgLy8gVG8gaW5zcGVjdCB0aGUgc3RhdGU6XG4gIC8vIC0gSWYgYGxvYWQuZXJgIGlzIHRydXRoeSwgdGhlIGV4ZWN1dGlvbiBoYXMgdGhyZXcgb3IgaGFzIGJlZW4gcmVqZWN0ZWQ7XG4gIC8vIC0gb3RoZXJ3aXNlLCBlaXRoZXIgdGhlIGBsb2FkLkVgIGlzIGEgcHJvbWlzZSwgbWVhbnMgaXQncyB1bmRlciBhc3luYyBleGVjdXRpb24sIG9yXG4gIC8vIC0gdGhlIGBsb2FkLkVgIGlzIG51bGwsIG1lYW5zIHRoZSBsb2FkIGhhcyBjb21wbGV0ZWQgdGhlIGV4ZWN1dGlvbiBvciBoYXMgYmVlbiBhc3luYyByZXNvbHZlZC5cbiAgY29uc3QgZXhlYyA9IGxvYWQuZTtcbiAgbG9hZC5lID0gbnVsbDtcblxuICAvLyBkZXBzIGV4ZWN1dGUgZmlyc3QsIHVubGVzcyBjaXJjdWxhclxuICB2YXIgZGVwTG9hZFByb21pc2VzO1xuICBsb2FkLmQuZm9yRWFjaChmdW5jdGlvbiAoZGVwTG9hZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgZGVwTG9hZFByb21pc2UgPSBwb3N0T3JkZXJFeGVjKGxvYWRlciwgZGVwTG9hZCwgc2Vlbik7XG4gICAgICBpZiAoZGVwTG9hZFByb21pc2UpIFxuICAgICAgICAoZGVwTG9hZFByb21pc2VzID0gZGVwTG9hZFByb21pc2VzIHx8IFtdKS5wdXNoKGRlcExvYWRQcm9taXNlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgbG9hZC5lciA9IGVycjtcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuU1lTVEVNX1BST0RVQ1RJT04pIHRyaWdnZXJPbmxvYWQobG9hZGVyLCBsb2FkLCBlcnIsIGZhbHNlKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH0pO1xuICBpZiAoZGVwTG9hZFByb21pc2VzKVxuICAgIHJldHVybiBsb2FkLkUgPSBwcm9taXNlUHJvdG90eXBlRmluYWxseS5jYWxsKFByb21pc2UuYWxsKGRlcExvYWRQcm9taXNlcykudGhlbihkb0V4ZWMpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9hZC5FID0gbnVsbDtcbiAgICB9KTtcblxuICB2YXIgZXhlY1Byb21pc2UgPSBkb0V4ZWMoKTtcbiAgaWYgKGV4ZWNQcm9taXNlKSB7XG4gICAgcmV0dXJuIGxvYWQuRSA9IHByb21pc2VQcm90b3R5cGVGaW5hbGx5LmNhbGwoZXhlY1Byb21pc2UsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsb2FkLkUgPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZG9FeGVjICgpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIGV4ZWNQcm9taXNlID0gZXhlYy5jYWxsKG51bGxDb250ZXh0KTtcbiAgICAgIGlmIChleGVjUHJvbWlzZSkge1xuICAgICAgICBleGVjUHJvbWlzZSA9IGV4ZWNQcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGxvYWQuQyA9IGxvYWQubjtcbiAgICAgICAgICBpZiAoIXByb2Nlc3MuZW52LlNZU1RFTV9QUk9EVUNUSU9OKSB0cmlnZ2VyT25sb2FkKGxvYWRlciwgbG9hZCwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBsb2FkLmVyID0gZXJyO1xuICAgICAgICAgIGlmICghcHJvY2Vzcy5lbnYuU1lTVEVNX1BST0RVQ1RJT04pIHRyaWdnZXJPbmxvYWQobG9hZGVyLCBsb2FkLCBlcnIsIHRydWUpO1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleGVjUHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIC8vIChzaG91bGQgYmUgYSBwcm9taXNlLCBidXQgYSBtaW5pZnkgb3B0aW1pemF0aW9uIHRvIGxlYXZlIG91dCBQcm9taXNlLnJlc29sdmUpXG4gICAgICBsb2FkLkMgPSBsb2FkLm47XG4gICAgICBsb2FkLkwgPSBsb2FkLkkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgIGxvYWQuZXIgPSBlcnI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgaWYgKCFwcm9jZXNzLmVudi5TWVNURU1fUFJPRFVDVElPTikgdHJpZ2dlck9ubG9hZChsb2FkZXIsIGxvYWQsIGxvYWQuZXIsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuXG5nbG9iYWwuU3lzdGVtID0gbmV3IFN5c3RlbUpTKCk7XG4iLCJpbXBvcnQgdHlwZSB7IEhvdFN0YXRlIH0gZnJvbSAnLi9obXIvaG90JztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU3lzdGVtIH0gZnJvbSAnLi9tb2R1bGUtc3lzdGVtL21vZHVsZS1zeXN0ZW0nO1xuXG5cbmV4cG9ydCB0eXBlIE1vZHVsZUlkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgTW9kdWxlID0gT2JqZWN0O1xuZXhwb3J0IHR5cGUgTW9kdWxlTWFwID0gUmVjb3JkPE1vZHVsZUlkLCBNb2R1bGU+O1xuXG5leHBvcnQgdHlwZSBTeXN0ZW1KUyA9IFN5c3RlbUpTUHJvdG90eXBlICYge1xuICAgIHJlYWRvbmx5IGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHJlYWRvbmx5IHByb3RvdHlwZTogU3lzdGVtSlNQcm90b3R5cGU7XG4gICAgfTtcbn1cblxudHlwZSBEZXBzID0gc3RyaW5nW107XG50eXBlIERlY2xhcmUgPSAoX2V4cG9ydD86IHN0cmluZywgX2NvbnRleHQ/OiBPYmplY3QpID0+IHtcbiAgICBzZXR0ZXJzOiAoKG5zOiBPYmplY3QpID0+IHZvaWQpW10sXG4gICAgZXhlY3V0b3I6ICgpID0+IHZvaWQ7XG59O1xudHlwZSBSZWdpc3RlciA9IFtEZXBzLCBEZWNsYXJlXTtcblxuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRDb250ZXh0IHtcbiAgICB1cmw6IHN0cmluZztcbiAgICByZXNvbHZlIChzcGVjaWZpZXI6IHN0cmluZywgcGFyZW50Pzogc3RyaW5nKTogc3RyaW5nO1xuICAgIGNjSG90PzogSG90U3RhdGU7XG4gICAgbW9kdWxlU3lzdGVtPzogTW9kdWxlU3lzdGVtO1xuICAgIC8qKlxuICAgICAqIERlY29yYXRvciB0byBzdXBwb3J0ZWQgdG8gcmVnaXN0ZXIgdXB2YWx1ZSBjbGFzcyBpbiBtb2R1bGUuXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAgICovXG4gICAgdXB2YWx1ZTogKG5hbWU6IHN0cmluZykgPT4gQ2xhc3NEZWNvcmF0b3I7XG59XG5cbnR5cGUgRW50cmllcyA9IEl0ZXJhYmxlSXRlcmF0b3I8W2lkOiBzdHJpbmcsIG5zOiBPYmplY3QsIHVwdmFsdWVMaXN0PzogUmVjb3JkPHN0cmluZywgT2JqZWN0Pl0+O1xuXG5pbnRlcmZhY2UgU3lzdGVtSlNQcm90b3R5cGUge1xuICAgIGhhcyAoaWQ6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgICBkZWxldGUgKGlkOiBzdHJpbmcpOiBmYWxzZSB8ICgoKSA9PiB2b2lkKTtcblxuICAgIGVudHJpZXMgKCk6IEVudHJpZXM7XG5cbiAgICBvbmxvYWQgKGVycjogdW5rbm93biB8IHVuZGVmaW5lZCwgaWQ6IHN0cmluZywgZGVwZW5kZW5jaWVzOiBzdHJpbmdbXSwgLi4uYXJnczogdW5rbm93bltdKTogdm9pZDtcblxuICAgIHByZXBhcmVJbXBvcnQgKCk6IFByb21pc2U8dm9pZD47XG5cbiAgICBjcmVhdGVDb250ZXh0IChpZDogc3RyaW5nKTogSW1wb3J0Q29udGV4dDtcblxuICAgIHJlc29sdmUgKHNwZWNpZmllcjogc3RyaW5nLCBwYXJlbnQ/OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgICBpbXBvcnQgKGlkOiBzdHJpbmcpOiBQcm9taXNlPHVua25vd24+O1xuXG4gICAgaW5zdGFudGlhdGUgKHVybDogc3RyaW5nLCBmaXJzdFBhcmVudFVybDogc3RyaW5nKTogUmVnaXN0ZXI7XG5cbiAgICBzZXREZWZhdWx0SG90UmVsb2FkYWJsZSAodmFsdWU6IGJvb2xlYW4pOiB2b2lkO1xuXG4gICAgZ2V0RGVmYXVsdEhvdFJlbG9hZGFibGUgKCk6IGJvb2xlYW47XG5cbiAgICByZWxvYWQgKGZpbGVzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj47XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgICBsZXQgU3lzdGVtOiBTeXN0ZW1KUztcbn1cblxudHlwZSBJbXBvcnRzID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRNYXAge1xuICAgIGltcG9ydHM6IEltcG9ydHMsXG4gICAgc2NvcGVzOiBSZWNvcmQ8c3RyaW5nLCBJbXBvcnRzPixcbn1cblxuZGVjbGFyZSBsZXQgJGdsb2JhbDogYW55OyAgLy8gICRnbG9iYWwgZm9yIFRBT0JBT1xuZGVjbGFyZSBsZXQgZ2V0QXBwOiBhbnk7ICAvLyBnZXRBcHAgZm9yIFdFQ0hBVCBtaW5pcHJvZ3JhbVxuXG5jb25zdCBnbG9iYWxPYmogPSAoZnVuY3Rpb24gZ2V0R2xvYmFsT2JqICgpIHtcbiAgICBpZiAodHlwZW9mICRnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiAkZ2xvYmFsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldEFwcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gZ2V0QXBwKCkuR2FtZUdsb2JhbDtcbiAgICB9XG59KSgpO1xuXG5leHBvcnQgY29uc3Qgc3lzdGVtR2xvYmFsID0gKHR5cGVvZiBnbG9iYWxPYmogIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsT2JqLlN5c3RlbSA6IFN5c3RlbSkgYXMgU3lzdGVtSlM7XG5cbmV4cG9ydCBjb25zdCBzeXN0ZW1KU1Byb3RvdHlwZTogU3lzdGVtSlNQcm90b3R5cGUgPSBzeXN0ZW1HbG9iYWwuY29uc3RydWN0b3IucHJvdG90eXBlO1xuIiwiaW1wb3J0IHsgc3lzdGVtSlNQcm90b3R5cGUgfSBmcm9tICcuL2dsb2JhbHMnO1xuXG5zeXN0ZW1KU1Byb3RvdHlwZS5pbnN0YW50aWF0ZSA9IGZ1bmN0aW9uKHVybDogc3RyaW5nLCBmaXJzdFBhcmVudFVybDogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gaW5zdGFudGlhdGUgJHt1cmx9IGZyb20gJHtmaXJzdFBhcmVudFVybH1gKTtcbn07IiwiaW1wb3J0IHsgc3lzdGVtSlNQcm90b3R5cGUsIFJFR0lTVFJZIH0gZnJvbSAnLi4vc3lzdGVtLWNvcmUuanMnO1xuaW1wb3J0IHsgYmFzZVVybCwgcmVzb2x2ZUlmTm90UGxhaW5PclVybCB9IGZyb20gJy4uL2NvbW1vbi5qcyc7XG5pbXBvcnQgeyBlcnJNc2cgfSBmcm9tICcuLi9lcnItbXNnLmpzJztcblxudmFyIHRvU3RyaW5nVGFnID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnO1xuXG5zeXN0ZW1KU1Byb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdmFyIGxvYWQgPSB0aGlzW1JFR0lTVFJZXVtpZF07XG4gIGlmIChsb2FkICYmIGxvYWQuZSA9PT0gbnVsbCAmJiAhbG9hZC5FKSB7XG4gICAgaWYgKGxvYWQuZXIpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbG9hZC5uO1xuICB9XG59O1xuXG5zeXN0ZW1KU1Byb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoaWQsIG1vZHVsZSkge1xuICBpZiAoIXByb2Nlc3MuZW52LlNZU1RFTV9QUk9EVUNUSU9OKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIE5vIHBhZ2UtcmVsYXRpdmUgVVJMcyBhbGxvd2VkXG4gICAgICBuZXcgVVJMKGlkKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybihFcnJvcihlcnJNc2coJ1czJywgJ1wiJyArIGlkICsgJ1wiIGlzIG5vdCBhIHZhbGlkIFVSTCB0byBzZXQgaW4gdGhlIG1vZHVsZSByZWdpc3RyeScpKSk7XG4gICAgfVxuICB9XG4gIHZhciBucztcbiAgaWYgKHRvU3RyaW5nVGFnICYmIG1vZHVsZVt0b1N0cmluZ1RhZ10gPT09ICdNb2R1bGUnKSB7XG4gICAgbnMgPSBtb2R1bGU7XG4gIH1cbiAgZWxzZSB7XG4gICAgbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUobnVsbCksIG1vZHVsZSk7XG4gICAgaWYgKHRvU3RyaW5nVGFnKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCB0b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gIH1cblxuICB2YXIgZG9uZSA9IFByb21pc2UucmVzb2x2ZShucyk7XG5cbiAgdmFyIGxvYWQgPSB0aGlzW1JFR0lTVFJZXVtpZF0gfHwgKHRoaXNbUkVHSVNUUlldW2lkXSA9IHtcbiAgICBpZDogaWQsXG4gICAgaTogW10sXG4gICAgaDogZmFsc2UsXG4gICAgZDogW10sXG4gICAgZTogbnVsbCxcbiAgICBlcjogdW5kZWZpbmVkLFxuICAgIEU6IHVuZGVmaW5lZFxuICB9KTtcblxuICBpZiAobG9hZC5lIHx8IGxvYWQuRSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIFxuICBPYmplY3QuYXNzaWduKGxvYWQsIHtcbiAgICBuOiBucyxcbiAgICBJOiB1bmRlZmluZWQsXG4gICAgTDogdW5kZWZpbmVkLFxuICAgIEM6IGRvbmVcbiAgfSk7XG4gIHJldHVybiBucztcbn07XG5cbnN5c3RlbUpTUHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChpZCkge1xuICB2YXIgbG9hZCA9IHRoaXNbUkVHSVNUUlldW2lkXTtcbiAgcmV0dXJuICEhbG9hZDtcbn07XG5cbi8vIERlbGV0ZSBmdW5jdGlvbiBwcm92aWRlZCBmb3IgaG90LXJlbG9hZGluZyB1c2UgY2FzZXNcbnN5c3RlbUpTUHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICB2YXIgcmVnaXN0cnkgPSB0aGlzW1JFR0lTVFJZXTtcbiAgdmFyIGxvYWQgPSByZWdpc3RyeVtpZF07XG4gIC8vIGluIGZ1dHVyZSB3ZSBjYW4gc3VwcG9ydCBsb2FkLkUgY2FzZSBieSBmYWlsaW5nIGxvYWQgZmlyc3RcbiAgLy8gYnV0IHRoYXQgd2lsbCByZXF1aXJlIFRMQSBjYWxsYmFja3MgdG8gYmUgaW1wbGVtZW50ZWRcbiAgaWYgKCFsb2FkIHx8IChsb2FkLnAgJiYgbG9hZC5wLmUgIT09IG51bGwpIHx8IGxvYWQuRSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGltcG9ydGVyU2V0dGVycyA9IGxvYWQuaTtcbiAgLy8gcmVtb3ZlIGZyb20gaW1wb3J0ZXJTZXR0ZXJzXG4gIC8vIChyZWxlYXNlIGZvciBnYylcbiAgaWYgKGxvYWQuZClcbiAgICBsb2FkLmQuZm9yRWFjaChmdW5jdGlvbiAoZGVwTG9hZCkge1xuICAgICAgdmFyIGltcG9ydGVySW5kZXggPSBkZXBMb2FkLmkuaW5kZXhPZihsb2FkKTtcbiAgICAgIGlmIChpbXBvcnRlckluZGV4ICE9PSAtMSlcbiAgICAgICAgZGVwTG9hZC5pLnNwbGljZShpbXBvcnRlckluZGV4LCAxKTtcbiAgICB9KTtcbiAgZGVsZXRlIHJlZ2lzdHJ5W2lkXTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9hZCA9IHJlZ2lzdHJ5W2lkXTtcbiAgICBpZiAoIWxvYWQgfHwgIWltcG9ydGVyU2V0dGVycyB8fCBsb2FkLmUgIT09IG51bGwgfHwgbG9hZC5FKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBiYWNrIHRoZSBvbGQgc2V0dGVyc1xuICAgIGltcG9ydGVyU2V0dGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzZXR0ZXIpIHtcbiAgICAgIGxvYWQuaS5wdXNoKHNldHRlcik7XG4gICAgICBzZXR0ZXIobG9hZC5uKTtcbiAgICB9KTtcbiAgICBpbXBvcnRlclNldHRlcnMgPSBudWxsO1xuICB9O1xufTtcblxudmFyIGl0ZXJhdG9yID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLml0ZXJhdG9yO1xuXG5zeXN0ZW1KU1Byb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbG9hZGVyID0gdGhpcywga2V5cyA9IE9iamVjdC5rZXlzKGxvYWRlcltSRUdJU1RSWV0pO1xuICB2YXIgaW5kZXggPSAwLCBucywga2V5O1xuICB2YXIgcmVzdWx0ID0ge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdoaWxlIChcbiAgICAgICAgKGtleSA9IGtleXNbaW5kZXgrK10pICE9PSB1bmRlZmluZWQgJiYgXG4gICAgICAgIChucyA9IGxvYWRlci5nZXQoa2V5KSkgPT09IHVuZGVmaW5lZFxuICAgICAgKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRvbmU6IGtleSA9PT0gdW5kZWZpbmVkLFxuICAgICAgICB2YWx1ZToga2V5ICE9PSB1bmRlZmluZWQgJiYgW2tleSwgbnNdXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICByZXN1bHRbaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzIH07XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBiYXNlVXJsIGFzIG9yaWdpbmFsQmFzZVVybCB9IGZyb20gJy4uLy4uL3N5c3RlbWpzL3NyYy9jb21tb24uanMnO1xuXG5leHBvcnQgbGV0IGJhc2VVcmwgPSBvcmlnaW5hbEJhc2VVcmw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRCYXNlVXJsKHVybDogc3RyaW5nKSB7XG4gICAgYmFzZVVybCA9IHVybDtcbn1cbiIsIlxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgcmVzb2x2ZUltcG9ydE1hcCwgcmVzb2x2ZUlmTm90UGxhaW5PclVybCwgcmVzb2x2ZUFuZENvbXBvc2VJbXBvcnRNYXAgfSBmcm9tICcuLi8uLi9zeXN0ZW1qcy9zcmMvY29tbW9uLmpzJztcbmltcG9ydCB7IHN5c3RlbUpTUHJvdG90eXBlLCBJbXBvcnRNYXAgfSBmcm9tICcuLi9nbG9iYWxzJztcbmltcG9ydCB7IGJhc2VVcmwgfSBmcm9tICcuL2Jhc2UtdXJsJztcblxuZXhwb3J0IGNvbnN0IGltcG9ydE1hcCA9IHsgaW1wb3J0czoge30sIHNjb3Blczoge30gfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldEltcG9ydE1hcChqc29uOiBJbXBvcnRNYXAsIGxvY2F0aW9uOiBzdHJpbmcpIHtcbiAgICByZXNvbHZlQW5kQ29tcG9zZUltcG9ydE1hcChqc29uLCBsb2NhdGlvbiB8fCBiYXNlVXJsLCBpbXBvcnRNYXApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kc0ltcG9ydE1hcChqc29uOiBJbXBvcnRNYXAsIGxvY2F0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbXBvcnRNYXBVcmwgPSByZXNvbHZlSWZOb3RQbGFpbk9yVXJsKGxvY2F0aW9uLCBiYXNlVXJsKTtcbiAgICByZXNvbHZlQW5kQ29tcG9zZUltcG9ydE1hcChqc29uLCBpbXBvcnRNYXBVcmwgfHwgbG9jYXRpb24sIGltcG9ydE1hcCk7ICAgIFxufVxuXG5mdW5jdGlvbiB0aHJvd1VucmVzb2x2ZWQoaWQ6IHN0cmluZywgcGFyZW50VXJsOiBzdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVzb2x2ZWQgaWQ6ICR7aWR9IGZyb20gcGFyZW50VXJsOiAke3BhcmVudFVybH1gKTtcbn1cblxuc3lzdGVtSlNQcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcsIHBhcmVudFVybDogc3RyaW5nKSB7XG4gICAgcGFyZW50VXJsID0gcGFyZW50VXJsIHx8IGJhc2VVcmw7XG4gICAgcmV0dXJuIHJlc29sdmVJbXBvcnRNYXAoaW1wb3J0TWFwLCByZXNvbHZlSWZOb3RQbGFpbk9yVXJsKGlkLCBwYXJlbnRVcmwpIHx8IGlkLCBwYXJlbnRVcmwpIHx8IHRocm93VW5yZXNvbHZlZChpZCwgcGFyZW50VXJsKTtcbn07XG4iLCJcbmltcG9ydCB7IHNldEJhc2VVcmwgfSBmcm9tICcuL2Jhc2UtdXJsJztcbmltcG9ydCB7IGV4dGVuZHNJbXBvcnRNYXAsIHNldEltcG9ydE1hcCwgaW1wb3J0TWFwIH0gZnJvbSAnLi9pbXBvcnQtbWFwJztcbmltcG9ydCB7IHN5c3RlbUpTUHJvdG90eXBlLCBJbXBvcnRNYXAgfSBmcm9tICcuLi9nbG9iYWxzJztcblxuLyoqXG4gKiBBZGFwdHMgdGhlIENvbW1vbkpTIGxpa2UgcGxhdGZvcm1zIHN1Y2ggYXMgbWluaS1nYW1lIGJhc2VkIGFuZCBqc2ItYmFzZWQgcGxhdGZvcm1zLlxuICogXG4gKiBUaGVzZSBwbGF0Zm9ybXMgaGF2ZSB0aGUgZm9sbG93aW5nIGNoYXJhY3RlcmlzdGljczpcbiAqIC0gVGhleSBkbyBub3QgaGF2ZSBhIFwiYmFzZVwiIFVSTCB0aGF0IFN5c3RlbUpTIHVzZWQgdG8gZm9ybSBVUkwgb2Ygc2NyaXB0cyBvciBpbXBvcnQgbWFwcy5cbiAqIC0gTG9hZGluZyBzY3JpcHRzIGlzIG5vdCBmaW5pc2hlZCB0aHJvdWdoIGA8c2NyaXB0PmAgdGFnLlxuICogXG4gKiBUaGlzIGZ1bmN0aW9uIGVtdWxhdGVzIGEgYmFzZSBVUkwgd2l0aCBhbiBvcGFxdWUgcHJvdG9jb2wgYW5kIHNwZWNpZmllZCBgJHtwYXRobmFtZX1gLlxuICogSXQgYWNjZXB0cyBhIGhhbmRsZXIgdG8gbG9hZCBzY3JpcHRzIHVuZGVyIHN1Y2ggYSBiYXNlIFVSTC5cbiAqIFxuICogRm9yIGV4YW1wbGUsIGFuIGltcG9ydCBtYXAgd2l0aCBgaW1wb3J0TWFwVXJsYCBiZWVuIHNldCB0byBgaW1wb3J0LW1hcC5qc29uYFxuICogc2hvdWxkIGhhdmUgYW4gc2ltdWxhdGVkIFVSTDogYDxwcm90b2NvbC10aGF0LXlvdS1kby1ub3QtY2FyZT46L2ltcG9ydC1tYXAuanNvbmAuXG4gKiBcbiAqIEdpdmVuIHRoYXQgdGhlIGltcG9ydCBtYXAgaGFzIGNvbnRlbnQgbGlrZSwgZm9yIGV4YW1wbGUsIGB7IGltcG9ydHM6IHsgXCJtXCI6IFwiLi9hL2IvYy5qc1wiIH0gfWAuXG4gKiBUaGUgbW9kdWxlIGAnbSdgIHdpbGwgbWFwcGVkIHRvIGFuIHNpbXVsYXRlZCBVUkw6IGA8cHJvdG9jb2wtdGhhdC15b3UtZG8tbm90LWNhcmU+Oi9hL2IvYy5qc2BcbiAqIFRoZSBwcm90b2NvbC1zdHJpcHBlZCBwb3J0aW9uIG9mIHRoYXQgVVJMKGAvYS9iL2MuanNgKSB3aWxsIGJlIHBhc3NlZCB0byB5b3VyIGBkZWZhdWx0SGFuZGxlcmAgdG9cbiAqIGV4ZWN1dGUgdGhlIHNjcmlwdC4gSW4gbW9zdCBjYXNlcywgdGhlIGBkZWZhdWx0SGFuZGxlcmAgd291bGQgYmUgYCh1cmxOb1NjaGVtYSkgPT4gcmVxdWlyZSgnLicgKyB1cmxOb1NjaGVtYSlgLlxuICogXG4gKiBUaGlzIGZ1bmN0aW9uIGFsc28gYWxsb3cgeW91IHRvIGN1c3RvbWl6ZSBsb2FkaW5nIG9mIHNjcmlwdHMgd2l0aCBzcGVjaWZpZWQgcHJvdG9jb2wuXG4gKiB0aHJvdWdoIHRoZSBgaGFuZGxlcnNgIHBhcmFtZXRlci5cbiAqIEhhbmRsZXIgbGlrZVxuICogYGBganNcbiAqIHsgXCJwbHVnaW46XCI6ICh1cmxOb1NjaGVtYSkgPT4gcmVxdWlyZVBsdWdpbih1cmxOb1NjaGVtYSkgfVxuICogYGBgXG4gKiB3aWxsIGhhbmRsZSB0aGUgbG9hZGluZyBvZiBzY3JpcHRzIHdpdGggVVJMIGBwbHVnaW46L2EvYi9jYC5cbiAqIFRoZSBgdXJsTm9TY2hlbWFgIHBhc3NlZCB0byBoYW5kbGVyIHdvdWxkIGV4YWN0bHkgYmUgdGhlIHByb3RvY29sLXN0cmlwcGVkIHBvcnRpb24gb2YgdGhhdCBVUkw6IGAvYS9iL2NgLlxuICogXG4gKiBAcGFyYW0gcGF0aG5hbWUgVGhlIHBhdGhuYW1lIG9mIHRoZSBvcGFjaXR5IGJhc2UgVVJMLiBEZWZhdWx0IHRvIGAnLydgLlxuICogQHBhcmFtIGltcG9ydE1hcCBJbXBvcnQgbWFwLlxuICogQHBhcmFtIGltcG9ydE1hcFVybCBSZWxhdGl2ZSB1cmwgdG8gaW1wb3J0IG1hcC5cbiAqIEBwYXJhbSBkZWZhdWx0SGFuZGxlciBMb2FkIHVybHMgd2l0aCBubyBwcm90b2NvbCBzcGVjaWZpZWQuIENhbiByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIFRoZSBgU3lzdGVtLnJlZ2lzdGVyKClgIG11c3QgaGF2ZSBiZWVuIGNhbGxlZDpcbiAqIC0gd2hlbiB0aGUgaGFuZGxlciByZXR1cm5zIGlmIGl0IHJldHVybnMgbm9uLXByb21pc2UsIG9yXG4gKiAtICoqYXQgdGhlIHRpbWUqKiB0aGUgcHJvbWlzZSBnZXQgcmVzb2x2ZWQsIGlmIGl0IHJldHVybnMgcHJvbWlzZS5cbiAqIEZvciBleGFtcGxlLCBlaXRoZXI6XG4gKiAtIGByZXF1aXJlKHVybE5vU2NoZW1hKWA7IHJldHVybjtcbiAqIC0gYHJldHVybiBpbXBvcnQodXJsTm9TY2hlbWEpYDtcbiAqIC0gb3IgYHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gcmVzb2x2ZShyZXF1aXJlKHVybE5vU2NoZW1hKSkpO2BcbiAqIEFzIGEgY29tcGFyaXNvbiwgYFByb21pc2UucmVzb2x2ZShyZXF1aXJlKHVybE5vU2NoZW1hKSlgIG1pZ2h0IGluY29ycmVjdCBzaW5jZVxuICogYmVmb3JlIHRoZSBwcm9taXNlIGdldCByZXNvbHZlZCwgaGFuZGxlcnMgdGhhdCBwcm9jZXNzIG90aGVyIFVSTHMgbWF5IGJlIGludm9rZWQuXG4gKiBAcGFyYW0gaGFuZGxlcnMgTG9hZCB1cmxzIHdpdGggc3BlY2lmaWVkIHByb3RvY29sLlxuICovXG5cbnR5cGUgU2NoZW1hSGFuZGxlciA9ICh1cmxOb1NjaGVtYTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+IHwgYW55O1xuXG5pbnRlcmZhY2UgV2FybXVwT3B0aW9ucyB7XG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbiAgICBpbXBvcnRNYXA6IEltcG9ydE1hcCxcbiAgICBpbXBvcnRNYXBVcmw6IHN0cmluZyxcbiAgICBpbXBvcnRNYXBMaXN0OiBBcnJheTwgeyBsb2NhdGlvbjogc3RyaW5nLCBtYXA6IEltcG9ydE1hcCB9PixcbiAgICBkZWZhdWx0SGFuZGxlcjogU2NoZW1hSGFuZGxlcixcbiAgICBoYW5kbGVyczogUmVjb3JkPHN0cmluZywgU2NoZW1hSGFuZGxlcj4sXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHtcbiAgICBwYXRobmFtZSA9ICcvJyxcbiAgICBpbXBvcnRNYXAsXG4gICAgaW1wb3J0TWFwVXJsLFxuICAgIGltcG9ydE1hcExpc3QsXG4gICAgZGVmYXVsdEhhbmRsZXIsXG4gICAgaGFuZGxlcnMsXG59OiBXYXJtdXBPcHRpb25zKSB7XG4gICAgY29uc3QgYmFzZVVybFNjaGVtYSA9ICduby1zY2hlbWE6JztcbiAgICBzZXRCYXNlVXJsKGAke2Jhc2VVcmxTY2hlbWF9JHtwYXRobmFtZX1gKTtcblxuICAgIGlmIChpbXBvcnRNYXBVcmwgJiYgaW1wb3J0TWFwKSB7XG4gICAgICAgIHNldEltcG9ydE1hcChpbXBvcnRNYXAsIGAke2Jhc2VVcmxTY2hlbWF9LyR7aW1wb3J0TWFwVXJsfWApO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGltcG9ydE1hcExpc3QpKSB7XG4gICAgICAgIGZvciAoY29uc3QgZSBvZiBpbXBvcnRNYXBMaXN0KSB7XG4gICAgICAgICAgICBleHRlbmRzSW1wb3J0TWFwKGUubWFwLCBlLmxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkZWZhdWx0SGFuZGxlcikge1xuICAgICAgICBob29rSW5zdGFudGlhdGlvbk92ZXJTY2hlbWEoYmFzZVVybFNjaGVtYSwgd3JhcEhhbmRsZXIoZGVmYXVsdEhhbmRsZXIpKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBwcm90b2NvbCBvZiBPYmplY3Qua2V5cyhoYW5kbGVycykpIHtcbiAgICAgICAgICAgIGhvb2tJbnN0YW50aWF0aW9uT3ZlclNjaGVtYShwcm90b2NvbCwgd3JhcEhhbmRsZXIoaGFuZGxlcnNbcHJvdG9jb2xdKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGUodmFsdWU6IGFueSkge1xuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81Mzk1NTY2NC8xMDYwMjUyNVxuICAgIHJldHVybiBCb29sZWFuKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gZm91bmRLZXlCeVZhbHVlSW5JbXBvcnRNYXAodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IGltcG9ydHM6IGFueSA9IGltcG9ydE1hcC5pbXBvcnRzO1xuICAgIGZvciAoY29uc3QgayBpbiBpbXBvcnRzKSB7XG4gICAgICAgIGNvbnN0IHYgPSBpbXBvcnRzW2tdO1xuICAgICAgICBpZiAodiAmJiAodmFsdWUgPT09IHYgfHwgYG5vLXNjaGVtYTovJHt2YWx1ZX1gID09PSB2KSkge1xuICAgICAgICAgICAgcmV0dXJuIGs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHRyeUdldFJlZ2lzdGVyKGNvbnRleHQ6IGFueSwgdXJsTm9TY2hlbWE6IHN0cmluZykge1xuICAgIGxldCByZXQ7XG4gICAgbGV0IHJlZ2lzdGVyS2V5ID0gdXJsTm9TY2hlbWE7XG4gICAgaWYgKHJlZ2lzdGVyS2V5LnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICByZWdpc3RlcktleSA9IHJlZ2lzdGVyS2V5LnNsaWNlKDEpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGZvdW5kS2V5QnlWYWx1ZUluSW1wb3J0TWFwKHJlZ2lzdGVyS2V5KTtcbiAgICBpZiAoa2V5KSB7XG4gICAgICAgIHJlZ2lzdGVyS2V5ID0ga2V5O1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0LnJlZ2lzdGVyUmVnaXN0cnkgJiYgKHJldCA9IGNvbnRleHQucmVnaXN0ZXJSZWdpc3RyeVtyZWdpc3RlcktleV0pKSB7XG4gICAgICAgIGNvbnRleHQucmVnaXN0ZXJSZWdpc3RyeVtyZWdpc3RlcktleV0gPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBTeXN0ZW1KUyBpbnN0YW50aWF0aW9uIGhvb2sgd2hpY2ggY2FsbHMgYGhhbmRsZXJgIGFuZCBnZXQgdGhlIHJlZ2lzdGVyLlxuICovXG5mdW5jdGlvbiB3cmFwSGFuZGxlcihoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbih1cmxOb1NjaGVtYTogc3RyaW5nKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG5cbiAgICAgICAgY29uc3QgcmVnaXN0ZXIgPSB0cnlHZXRSZWdpc3Rlcihjb250ZXh0LCB1cmxOb1NjaGVtYSk7XG4gICAgICAgIGlmIChyZWdpc3Rlcikge1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldFZhbDogYW55O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0VmFsID0gaGFuZGxlcih1cmxOb1NjaGVtYSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1RoZW5hYmxlKHJldFZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LmdldFJlZ2lzdGVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBjYW4gbm90IGRpcmVjdGx5IGByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldFZhbClgXG4gICAgICAgICAgICAvLyBzaW5jZSBvbmNlIHdlIGdldCB0aGUgcmV0dXJucywgdGhlIGBTeXN0ZW0ucmVnaXN0ZXIoKWAgc2hvdWxkIGhhdmUgYmVlbiBjYWxsZWQuXG4gICAgICAgICAgICAvLyBJZiBpdCdzIHN5bmNocm9uaXplZCwgYFByb21pc2UucmVzb2x2ZSgpYCBkZWZlcnMgdGhlIGB0aGlzLmdldFJlZ2lzdGVyKClgXG4gICAgICAgICAgICAvLyB3aGljaCBtZWFucyBvdGhlciBgU3lzdGVtLnJlZ2lzdGVyKClgIG1heSBoYXBwZW4gYmVmb3JlIHdlIHJlc29sdmVkIHRoZSBwcm9taXNlLlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldFZhbC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb250ZXh0LmdldFJlZ2lzdGVyKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBob29rSW5zdGFudGlhdGlvbk92ZXJTY2hlbWEoc2NoZW1hOiBzdHJpbmcsIGhvb2s6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgdmVuZGVySW5zdGFudGlhdGUgPSBzeXN0ZW1KU1Byb3RvdHlwZS5pbnN0YW50aWF0ZTtcbiAgICBzeXN0ZW1KU1Byb3RvdHlwZS5pbnN0YW50aWF0ZSA9IGZ1bmN0aW9uKHVybDogc3RyaW5nLCBmaXJzdFBhcmVudFVybDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYUVyYXNlZCA9IHVybC5zdWJzdHIoMCwgc2NoZW1hLmxlbmd0aCkgPT09IHNjaGVtYSA/XG4gICAgICAgICAgICB1cmwuc3Vic3RyKHNjaGVtYS5sZW5ndGgpIDogbnVsbDtcbiAgICAgICAgcmV0dXJuIHNjaGVtYUVyYXNlZCA9PT0gbnVsbCA/XG4gICAgICAgICAgICB2ZW5kZXJJbnN0YW50aWF0ZS5jYWxsKHRoaXMsIHVybCwgZmlyc3RQYXJlbnRVcmwpIDpcbiAgICAgICAgICAgIGhvb2suY2FsbCh0aGlzLCBzY2hlbWFFcmFzZWQsIGZpcnN0UGFyZW50VXJsKTtcbiAgICB9O1xufVxuIiwiaW1wb3J0IHdhcm11cCBmcm9tICcuL3dhcm11cC1jb21tb25qcy1saWtlJztcbmltcG9ydCB7IHN5c3RlbUpTUHJvdG90eXBlIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5zeXN0ZW1KU1Byb3RvdHlwZS5wcmVwYXJlSW1wb3J0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7IH1cblxuLy8gQHRzLWlnbm9yZSB0aGlzIHNob3VsZCBiZSBhIHByaXZhdGUgaW50ZXJmYWNlXG5zeXN0ZW1KU1Byb3RvdHlwZS53YXJtdXAgPSB3YXJtdXA7XG4iLCIvKlxuICogU3lzdGVtSlMgbmFtZWQgcmVnaXN0ZXIgZXh0ZW5zaW9uXG4gKiBTdXBwb3J0cyBTeXN0ZW0ucmVnaXN0ZXIoJ25hbWUnLCBbLi5kZXBzLi5dLCBmdW5jdGlvbiAoX2V4cG9ydCwgX2NvbnRleHQpIHsgLi4uIH0pXG4gKiBcbiAqIE5hbWVzIGFyZSB3cml0dGVuIHRvIHRoZSByZWdpc3RyeSBhcy1pc1xuICogU3lzdGVtLnJlZ2lzdGVyKCd4JywgLi4uKSBjYW4gYmUgaW1wb3J0ZWQgYXMgU3lzdGVtLmltcG9ydCgneCcpXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIHZhciBTeXN0ZW0gPSBnbG9iYWwuU3lzdGVtO1xuICBzZXRSZWdpc3RlclJlZ2lzdHJ5KFN5c3RlbSk7XG4gIHZhciBzeXN0ZW1KU1Byb3RvdHlwZSA9IFN5c3RlbS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gIHZhciBjb25zdHJ1Y3RvciA9IFN5c3RlbS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFN5c3RlbUpTID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gICAgc2V0UmVnaXN0ZXJSZWdpc3RyeSh0aGlzKTtcbiAgfTtcbiAgU3lzdGVtSlMucHJvdG90eXBlID0gc3lzdGVtSlNQcm90b3R5cGU7XG4gIFN5c3RlbS5jb25zdHJ1Y3RvciA9IFN5c3RlbUpTO1xuXG4gIHZhciBmaXJzdE5hbWVkRGVmaW5lO1xuXG4gIGZ1bmN0aW9uIHNldFJlZ2lzdGVyUmVnaXN0cnkoc3lzdGVtSW5zdGFuY2UpIHtcbiAgICBzeXN0ZW1JbnN0YW5jZS5yZWdpc3RlclJlZ2lzdHJ5ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuXG4gIHZhciByZWdpc3RlciA9IHN5c3RlbUpTUHJvdG90eXBlLnJlZ2lzdGVyO1xuICBzeXN0ZW1KU1Byb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChuYW1lLCBkZXBzLCBkZWNsYXJlKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiByZWdpc3Rlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHZhciBkZWZpbmUgPSBbZGVwcywgZGVjbGFyZV07XG4gICAgdGhpcy5yZWdpc3RlclJlZ2lzdHJ5W25hbWVdID0gZGVmaW5lO1xuICAgIGlmICghZmlyc3ROYW1lZERlZmluZSkge1xuICAgICAgZmlyc3ROYW1lZERlZmluZSA9IGRlZmluZTtcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBmaXJzdE5hbWVkRGVmaW5lID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVnaXN0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICB2YXIgcmVzb2x2ZSA9IHN5c3RlbUpTUHJvdG90eXBlLnJlc29sdmU7XG4gIHN5c3RlbUpTUHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbiAoaWQsIHBhcmVudFVSTCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBQcmVmZXIgaW1wb3J0IG1hcCAob3Igb3RoZXIgZXhpc3RpbmcpIHJlc29sdXRpb24gb3ZlciB0aGUgcmVnaXN0ZXJSZWdpc3RyeVxuICAgICAgcmV0dXJuIHJlc29sdmUuY2FsbCh0aGlzLCBpZCwgcGFyZW50VVJMKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChpZCBpbiB0aGlzLnJlZ2lzdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaW5zdGFudGlhdGUgPSBzeXN0ZW1KU1Byb3RvdHlwZS5pbnN0YW50aWF0ZTtcbiAgc3lzdGVtSlNQcm90b3R5cGUuaW5zdGFudGlhdGUgPSBmdW5jdGlvbiAodXJsLCBmaXJzdFBhcmVudFVybCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnJlZ2lzdGVyUmVnaXN0cnlbdXJsXTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyUmVnaXN0cnlbdXJsXSA9IG51bGw7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW5zdGFudGlhdGUuY2FsbCh0aGlzLCB1cmwsIGZpcnN0UGFyZW50VXJsKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGdldFJlZ2lzdGVyID0gc3lzdGVtSlNQcm90b3R5cGUuZ2V0UmVnaXN0ZXI7XG4gIHN5c3RlbUpTUHJvdG90eXBlLmdldFJlZ2lzdGVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIENhbGxpbmcgZ2V0UmVnaXN0ZXIoKSBiZWNhdXNlIG90aGVyIGV4dHJhcyBuZWVkIHRvIGtub3cgaXQgd2FzIGNhbGxlZCBzbyB0aGV5IGNhbiBwZXJmb3JtIHNpZGUgZWZmZWN0c1xuICAgIHZhciByZWdpc3RlciA9IGdldFJlZ2lzdGVyLmNhbGwodGhpcyk7XG5cbiAgICB2YXIgcmVzdWx0ID0gZmlyc3ROYW1lZERlZmluZSB8fCByZWdpc3RlcjtcbiAgICBmaXJzdE5hbWVkRGVmaW5lID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogZ2xvYmFsKTtcbiJdLCJuYW1lcyI6WyJiYXNlVXJsIiwidG9TdHJpbmdUYWciLCJzeXN0ZW1KU1Byb3RvdHlwZSIsImdsb2JhbCIsIm9yaWdpbmFsQmFzZVVybCJdLCJtYXBwaW5ncyI6Ijs7O0VBQU8sU0FBUyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtFQUNyQyxFQUdJLE9BQU8sQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLG1CQUFtQixHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsdUJBQXVCLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQztFQUN2Rzs7RUNITyxJQUFJLFNBQVMsR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUM7RUFDOUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDO0VBQzFDLElBQUksV0FBVyxHQUFHLE9BQU8sUUFBUSxLQUFLLFdBQVcsQ0FBQztBQUN6RDtFQUNBLElBQUksU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBTXhDO0VBQ08sSUFBSUEsU0FBTyxDQUFDO0FBQ25CO0VBQ0EsSUFBSSxXQUFXLEVBQUU7RUFDakIsRUFBRSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0VBQ3BELEVBQUUsSUFBSSxNQUFNO0VBQ1osSUFBSUEsU0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7RUFDMUIsQ0FBQztBQUNEO0VBQ0EsSUFBSSxDQUFDQSxTQUFPLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO0VBQ2pELEVBQUVBLFNBQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENB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
