namespace WebAtoms{

    /**
     * 
     * 
     * @export
     * @class WindowService
     */
    @DIGlobal
    export class WindowService{

        private lastWindowID:number = 1;

        /**
         * Display an alert, and method will continue after alert is closed.
         * 
         * @param {string} msg 
         * @param {string} [title] 
         * @returns {Promise<any>} 
         * @memberof WindowService
         */
        alert(msg:string,title?:string):Promise<any>{
            return this.showAlert(msg,title || "Message",false);
        }

        /**
         * Display a confirm window with promise that will resolve when yes or no
         * is clicked.
         * 
         * @param {string} msg 
         * @param {string} [title] 
         * @returns {Promise<boolean>} 
         * @memberof WindowService
         */
        confirm(msg:string,title?:string):Promise<boolean>{
            return this.showAlert(msg,title || "Confirm",true);
        }

        private showAlert(msg,title:string,confirm:boolean):Promise<boolean>{
            return new Promise((resolve,reject)=>{

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
                        }else{
                        resolve(false);
                        }
                    });

                    w.set_cancelNext(()=>{
                        w.dispose();
                        //$(e).remove();
                        e.remove();
                        
                        resolve(false);
                    });
                
                    w.refresh();

            });
        }


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
        async openWindow<T>(windowType: string | {new(e)}, viewModel?: AtomWindowViewModel):Promise<T>{

            return new  Promise<T>((resolve,reject)=>{

                var windowDiv = document.createElement("div");

                windowDiv.id = `atom_window_${this.lastWindowID++}`;


                var atomApplication = window["atomApplication"];
                var AtomUI = window["AtomUI"];
                
                atomApplication._element.appendChild(windowDiv);

                if(windowType instanceof String){
                    windowType = window[windowType] as {new (e)};
                }

                var windowCtrl = AtomUI.createControl(windowDiv,windowType);

                var closeSubscription = WebAtoms.AtomDevice.instance.subscribe(`atom-window-close:${windowDiv.id}`,(g,i)=>{
                    if(i!==undefined){
                        Atom.set(windowCtrl,"value",i);                
                    }
                    windowCtrl.closeCommand();
                });

                var cancelSubscription = WebAtoms.AtomDevice.instance.subscribe(`atom-window-cancel:${windowDiv.id}`,(g,i)=>{
                    windowCtrl.cancelCommand();
                });

                windowDiv.setAttribute("atom-local-scope","true");

                windowCtrl.init();

                var dispatcher = WebAtoms["dispatcher"];

                if(viewModel !== undefined){
                    Atom.set(windowCtrl,"viewModel",viewModel);
                }

                windowCtrl.set_next(()=>{
                    cancelSubscription.dispose();
                    closeSubscription.dispose();
                    try{
                        resolve(windowCtrl.get_value());
                    }catch(e){
                        console.error(e);
                    }
                    dispatcher.callLater(()=>{
                        windowCtrl.dispose();
                        windowDiv.remove();
                    });
                });

                windowCtrl.set_cancelNext(()=>{
                    cancelSubscription.dispose();
                    closeSubscription.dispose();
                    try{
                        reject("cancelled");
                    }catch(e){
                        console.error(e);
                    }
                    dispatcher.callLater(()=>{
                        windowCtrl.dispose();
                        windowDiv.remove();
                    });
                });

            
                dispatcher.callLater(()=>{
                    var scope = windowCtrl.get_scope();
                    var vm = windowCtrl.get_viewModel();
                    if(vm){
                        vm.windowName = windowDiv.id;
                    }
                    windowCtrl.openWindow(scope,null);
                });




            });
        }

    }

}

var WindowService = WebAtoms.WindowService;