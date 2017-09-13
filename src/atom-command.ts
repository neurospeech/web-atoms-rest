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
function bindableProperty(target: any, key: string) {
    
        var Atom = window["Atom"];
    
        // property value
        var _val = this[key];
    
        var keyName = "_" + key;
    
        this[keyName] = _val;
    
        // property getter
        var getter = function () {
            //console.log(`Get: ${key} => ${_val}`);
            return this[keyName];
        };
    
        // property setter
        var setter = function (newVal) {
            //console.log(`Set: ${key} => ${newVal}`);
            this[keyName] = newVal;
            Atom.refresh(this, key);

            if(this.onPropertyChanged){
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

namespace WebAtoms{

    var Atom = window["Atom"];

    /**
     * 
     * 
     * @export
     * @class CancelToken
     */
    export class CancelToken{

        listeners:Array<()=>void> = [];

        private _cancelled:boolean;
        get cancelled():boolean{
            return this._cancelled;
        }

        cancel(){
            this._cancelled = true;
            for(var fx of this.listeners){
                fx();
            }
        }

        reset(){
            this._cancelled = false;
            this.listeners.length = 0;
        }

        registerForCancel(f:()=>void){
            if(this._cancelled){
                f();
                this.cancel();
                return;
            }
            this.listeners.push(f);
        }

    }

    export class AtomModel {
        public refresh(name: String): void {
            Atom.refresh(this, name);
        }
    }



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
    export class AtomCommand<T> extends AtomModel {

        public readonly isMVVMAtomCommand: boolean = true;


        private _enabled: boolean = true;
        /**
         * 
         * 
         * @type {boolean}
         * @memberof AtomCommand
         */
        get enabled(): boolean {
            return this._enabled;
        }
        set enabled(v: boolean) {
            this._enabled = v;
            this.refresh("enabled");
        }

        private _busy: boolean = false;
        /**
         * 
         * 
         * @type {boolean}
         * @memberof AtomCommand
         */
        get busy(): boolean{
            return this._busy;
        }
        set busy(v:boolean){
            this._busy = v;
            this.refresh("busy");
        }


        private action: (p: T) => any;

        public execute: (p:T) => any;

        private executeAction(p:T): any {

            if(this._busy)
                return;
            this.busy = true;
            var result = this.action(p);

            if (result) {
                if(result.catch){
                    result.catch((error) => {
                        this.busy = false;
                        if(error !== 'cancelled'){
                            console.error(error);
                            Atom.showError(error);
                        }
                    });
                    return;
                }

                if(result.then){
                    result.then(()=>{
                        this.busy = false;
                    });
                    return;
                }

            }
            this.busy = false;
        }

        constructor(
            action: (p: T) => any) {
            super();
            this.action = action;

            var self = this;
            this.execute = (p:T) => {
                if (this.enabled) {
                    this.executeAction(p);
                }
            };


        }

    }

}