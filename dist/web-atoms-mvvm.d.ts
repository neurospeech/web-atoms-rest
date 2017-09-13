declare function bindableProperty(target: any, key: string): void;
declare namespace WebAtoms {
    class CancelToken {
        listeners: Array<() => void>;
        private _cancelled;
        readonly cancelled: boolean;
        cancel(): void;
        reset(): void;
        registerForCancel(f: () => void): void;
    }
    class AtomModel {
        refresh(name: String): void;
    }
    class AtomCommand<T> extends AtomModel {
        readonly isMVVMAtomCommand: boolean;
        private _enabled;
        enabled: boolean;
        private _busy;
        busy: boolean;
        private action;
        execute: (p: T) => any;
        private executeAction(p);
        constructor(action: (p: T) => any);
    }
}
declare namespace WebAtoms {
    class DisposableAction implements AtomDisposable {
        f: () => void;
        constructor(f: () => void);
        dispose(): void;
    }
    interface AtomDisposable {
        dispose(): any;
    }
    type AtomAction = (msg: string, data: any) => void;
    class AtomMessageAction {
        message: string;
        action: AtomAction;
        constructor(msg: string, a: AtomAction);
    }
    class AtomDevice {
        static instance: AtomDevice;
        constructor();
        runAsync<T>(tf: () => Promise<T>): void;
        private bag;
        broadcast(msg: string, data: any): void;
        subscribe(msg: string, action: AtomAction): AtomDisposable;
    }
}
declare namespace WebAtoms {
    class AtomList<T> extends Array<T> {
        constructor();
        add(item: T): number;
        addAll(items: Array<T>): void;
        insert(i: number, item: T): void;
        removeAt(i: number): void;
        remove(item: T): void;
        clear(): void;
        refresh(): void;
        watch(f: () => void): AtomDisposable;
    }
}
declare namespace WebAtoms {
    class AtomViewModel extends AtomModel {
        private disposables;
        constructor();
        protected createErrors<T extends AtomErrors>(f: new (a: any) => T): T;
        private privateInit();
        private setupWatchers();
        protected watch(item: any, property: string, f: () => void): AtomDisposable;
        protected registerDisposable(d: AtomDisposable): void;
        protected onPropertyChanged(name: string): void;
        protected onMessage<T>(msg: string, a: (data: T) => void): void;
        broadcast(msg: string, data: any): void;
        init(): Promise<any>;
        dispose(): void;
    }
    class AtomWindowViewModel extends AtomViewModel {
        windowName: string;
        close(result?: any): void;
        cancel(): void;
    }
}
declare namespace WebAtoms {
    function errorIf<T>(fx: (fi: (t: T) => any) => boolean): (f: (t: T) => any, msg: string) => (target: AtomErrors<T>, propertyKey: string | symbol) => void;
    class AtomErrors<T> implements AtomDisposable {
        dispose(): void;
        watchers: AtomErrorExpression<T>[];
        target: any;
        constructor(target: T);
        ifEmpty(f: (x: T) => any): AtomErrorExpression<T>;
        ifTrue(f: (x: T) => boolean): AtomErrorExpression<T>;
        private ifExpressionTrue(f, fx);
        ifExpression(...path: string[]): AtomErrorExpression<T>;
        clear(): void;
    }
    class ObjectProperty {
        target: object;
        name: string;
        watcher: AtomDisposable;
        constructor(name: string);
    }
    class AtomErrorExpression<T> implements AtomDisposable {
        private setErrorMessage(a);
        errors: any;
        watcher: AtomWatcher;
        errorMessage: string;
        errorField: string;
        func: (...args: any[]) => void;
        constructor(errors: AtomErrors<T>, watcher: AtomWatcher);
        isEmpty(): AtomErrorExpression<T>;
        isTrue(f: (...args: any[]) => boolean): AtomErrorExpression<T>;
        isFalse(f: (...args: any[]) => boolean): AtomErrorExpression<T>;
        setError(name: string, msg?: string): void;
        dispose(): void;
    }
    class AtomWatcher implements AtomDisposable {
        func: () => void;
        evaluate(): any;
        path: Array<Array<ObjectProperty>>;
        target: any;
        constructor(target: any, path: Array<string>);
        dispose(): void;
    }
}
declare var errorIf: any;
/**
 * Easy and Simple Dependency Injection
 */
declare namespace WebAtoms {
    class DI {
        private static factory;
        static instances: any;
        static register(key: any, factory: any): void;
        static resolve<T>(c: new () => T): T;
        static put(key: any, instance: any): void;
    }
    function DIGlobal(c: any): any;
    function DIAlwaysNew(c: any): any;
}
declare var DIGlobal: typeof WebAtoms.DIGlobal;
declare var DIAlwaysNew: typeof WebAtoms.DIAlwaysNew;
declare function methodBuilder(method: string): (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function Return(type: {
    new ();
}): (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare function parameterBuilder(paramName: string): (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Atom: any;
declare var Path: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Query: (key: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Body: (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Post: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Get: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Delete: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Put: (url: string) => (target: WebAtoms.Rest.BaseService, propertyKey: string, descriptor: any) => void;
declare var Cancel: (target: WebAtoms.Rest.BaseService, propertyKey: string | symbol, parameterIndex: number) => void;
declare namespace WebAtoms.Rest {
    class ServiceParameter {
        key: string;
        type: string;
        constructor(type: string, key: string);
    }
    class AjaxOptions {
        method: string;
        url: string;
        data: any;
        type: string;
        cancel: CancelToken;
    }
    class CancellablePromise<T> implements Promise<T> {
        [Symbol.toStringTag]: "Promise";
        onCancel: () => void;
        p: Promise<T>;
        constructor(p: Promise<T>, onCancel: () => void);
        abort(): void;
        then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    }
    class BaseService {
        testMode: boolean;
        showProgress: boolean;
        showError: boolean;
        methods: any;
        methodReturns: any;
        encodeData(o: AjaxOptions): AjaxOptions;
        sendResult(result: any, error?: any): Promise<any>;
        invoke(url: string, method: string, bag: Array<ServiceParameter>, values: Array<any>, returns: {
            new ();
        }): Promise<any>;
    }
}
declare var validate: (error: string, func: (...a: any[]) => boolean, ...args: any[]) => (target: WebAtoms.AtomViewModel, propertyKey: string) => void;
declare namespace WebAtoms {
}
declare namespace WebAtoms {
    class WindowService {
        private lastWindowID;
        alert(msg: string, title?: string): Promise<any>;
        confirm(msg: string, title?: string): Promise<boolean>;
        private showAlert(msg, title, confirm);
        openWindow<T>(windowType: string | {
            new (e);
        }, viewModel?: any): Promise<T>;
    }
}
declare var WindowService: typeof WebAtoms.WindowService;
