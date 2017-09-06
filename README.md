# Web Atoms MVVM

Web Atoms MVVM Pattern Library

* Support for ViewModel
* Support for Commands
* Support for Message Broadcast/Subscriptions for communication between ViewModels
* Support for REST Service similar to Retro Fit
* Simple and Small Dependency Injection

# Installation

## Dependency

Please add following Web Atoms to your Html page or Project.

<a href="//github.com/neurospeech/web-atoms.js">`Web Atoms`</a>

## CDN in Production

    <script 
    src="//cdn.jsdelivr.net/npm/web-atoms-mvvm@1.0.38/dist/web-atoms-mvvm.min.js">

## NPM Package

    npm install web-atoms-mvvm

## Unit testing

For unit testing, please see     
<a href="//github.com/neurospeech/web-atoms-unit">`Web Atoms Unit`</a>

## All Samples are in TypeScript

# Sample REST Service

```typescript

    var BaseService = WebAtoms.BaseService;

    @DIGlobal
    class BackendService extends BaseService{


        @Get("/task/{taskId}")
        getTask(
            @Path("taskId") taskId:number
        ): Promise<Task>{
            return null;
        }

        @Put("/task/{taskId}")
        saveTask(
            @Path("taskId") taskId: number, 
            @Body task:Task
        ):Promise<Task>{
            return null;
        }

        @Delete("/task/{taskId}")
        deleteTask(
            @Path("taskId") taskId: number
        ):Promise<any>{
            return null;
        }


        // support for CancelToken
        
        @Get("/tasks")
        getTasks(
            @Query("deleted" deleted: boolean,
            @Cancel cancel:CancelToken
        ):Promise<Array<Task>>{
            return null;
        }
        

    }

```

# Sample View Model 

```typescript

    var AtomViewModel = WebAtoms.AtomViewModel;
    var AtomList = WebAtoms.AtomList;
    var AtomCommand = WebAtoms.AtomCommand;
    

    class Task{
        id: number;
        label:String;
    }

    class TaskViewModel extends AtomViewModel{
        
        @bindableProperty
        list:AtomList<Task>;

        @bindableProperty
        newItem:Task;

        @bindableProperty
        selectedItem: Task;

        addCommand: AtomCommand<any>;
        removeCommand: AtomCommand<Task>

        backendService: BackendService;

        constructor(){
            this.list = new AtomList<Task>();
            this.newItem = new Task();
            this.addCommand = new AtomCommand(a => onAddCommand());
            this.removeCommand = new AtomCommand(task => 
                onRemoveCommand(task);)

            // simple dependency injection !!!
            this.backendService = WebAtoms.DI.resolve(BackendService);
        }

        async init():Promise<any>{
            var results = await this.backendService.getTasks(false);
            this.list.addAll(results);
        }

        onPropertyChanged(name:string){
            // called when any property of this viewmodel
            // is modified anywhere
        }

        async addCommand():Promise<any>{

            if(!this.newItem.label){
                this.broadcast(
                    "ui-notification",
                    new AtomNotification(
                        "Task cannot be empty",
                        "Error"
                    ));
                return;
            }

            this.newItem = 
                await this.backendService.saveTask(this.newItem);

            this.list.add(this.newItem);
            this.newItem = new Task();

        }

        async removeCommand(task:Task):Promise<any>{

            await this.backendService.deleteTask(task.id);

            this.list.remove(task);
        }

    }
```

# Sample HTML
```html

        <div 
            atom-type="AtomApplication"
            atom-view-model="{ new TaskViewModel() }">
            <div>
                <input type="text" 
                    atom-value="$[viewModel.newItem.label]" 
                    placeholder="New Task"/>
                <button 
                        atom-type="AtomButton" 
                        atom-command="{$viewModel.addCommand}">Add Mew</button>
            </div>
                

            <div 
                    atom-type="AtomListBox"
                    atom-items="[$viewModel.list]">
                <div atom-template="itemTemplate">
                    <span atom-text="{$data.label}"></span>
                    <button 
                            atom-type="AtomDeleteButton"
                            atom-command="{$viewModel.removeCommand}"
                            atom-command-parameter="{$data}">Delete</button>
                </div>
            </div>            
        </div>

```

# Sample Broadcast Listener

Let's assume, you have a Atom Component that displays notifications.
And you have set `atom-view-model` to `NotificationServiceViewModel`

```typescript

    class AtomNotification {

        static short(message: string, title: string = ""): AtomNotification {
            return new AtomNotification(message, title);
        }

        constructor(
            message: string, 
            title: string, 
            icon: string = null, 
            delay: number = 5000)
        {
            this.message = message;
            this.title = title;
            this.icon = icon || "";
            this.delay = delay || 5000;
        }

        message: string;
        title: string;

        // displayed on left side..
        icon: string;

        // maximum delay to be displayed
        @bindableProperty
        delay: number;

        timeout: number;

    }

    class NotificationServiceViewModel extends AtomViewModel {

        notifications: AtomList<AtomNotification>;

        removeCommand: AtomCommand<AtomNotification>;

        constructor() {
            super();

            this.notifications = new AtomList<AtomNotification>();

            this.removeCommand = new AtomCommand <AtomNotification>(n => this.onRemoveCommand(n));



            // subscribe to UI notifications sent by anyone...
            this.onMessage<AtomNotification>(
                "ui-notification",
                (m, n) => this.onNotified(n);
        }

        async onRemoveCommand(n: AtomNotification): Promise<any> {
            this.notifications.remove(n);
            if (n.timeout) {
                clearTimeout(n.timeout);
            }
        }

        async onNotified(n: AtomNotification): Promise<any> {
            this.notifications.add(n);
            if (n.delay > 0) {
                this.updateTimer(n);
            }
        }

        // this will reduce delay by 1000 millseconds
        // you can bind `n.delay` to display "Closing in (n) seconds" etc 
        private updateTimer(n: AtomNotification): void {
            if (n.delay > 0) {
                n.delay = n.delay - 1000;
                setTimeout(() => this.updateTimer(n), 1000);
            } else {
                this.notifications.remove(n);
            }
        }

    }
```

## Sample Notification UI
```html
    <div 
         atom-type="AtomItemsControl"
         atom-view-model="{ new NotificationServiceViewModel() }"
         atom-items="{$viewModel.notifications}"
         style="position:absolute;top:0;left:0;"
         style-display="[$viewModel.notifications.length ? 'block' : 'none']"
         style-width="100%"
         style-height="100%">

        <div style="margin:200px;position:relative;opacity:0.5;background-color:aquamarine"
             atom-presenter="itemsPresenter">
             <div atom-template="itemTemplate">
                 <div>
                     <span atom-text="{$data.title}"></span>
                     <button 
                             atom-type="AtomButton"
                             atom-command-parameter="{$data}"
                             atom-command="{$viewModel.removeCommand}"
                             >Close</button>
                 </div>
                 <div atom-text="{$data.message}"></div>
                 <div atom-text="['Closing in (' + (($data.delay/1000)+1) + ') seconds.. ']"></div>
             </div>
        </div>

    </div>
```

# Reference

## AtomDisposable

```typescript
    interface AtomDisposable{
        dispose();
    }

    // action f will be called on dispose
    class DisposableAction implements AtomDisposable{
        constructor(f:()=>void);
    }
```

## Atom

```typescript

    class Atom{

        // watch for change in property in target object
        // method will return subscription, you can call dispose to 
        // remove subscription to avoid memory leak
        static watch(target:any, property:string, f:()=>void) : AtomDisposable;

        static async delay(n:number, ct?:CancelToken):Promise<any>;
    }

```

## AtomCommand

Although you can directly call `viewModel` methods into binding expressions, 
we recommend using `AtomCommand`, as command has busy property, which will be set
to true when asynchronous Promise is still executing.

You can set enabled to false to disable any UI associated with it, `AtomButton` automatically
binds to `enabled` property.

```typescript
    class AtomCommand<T>{

        @bindableProperty
        enabled: boolean;

        @bindableProperty
        busy: boolean;

        constructor( action:(T) => any );
    }
```

## AtomModel
```typescript
    class AtomModel{

        // this will notify bindings to refresh the UI
        refresh(field:string);
    }
```

## AtomViewModel
```typescript
    class AtomViewModel extends AtomModel{
        constructor();
        async init();
        dispose();

        // should only be called in constructor
        onMessage<T>(message:string,action:(msg:string,T)=>any);

        broadcast(message:string,data:any);

        // registers watch for item
        // and it will automatically call dispose on subscription
        // when View Model will be disposed
        watch(item:any, property:string, f:()=>void);

        // you can register a disposable which will
        // be disposed when View Model will be disposed by the UI service
        registerDisposable(d:AtomDisposable);

        // called when any property of view model
        // is changed
        onPropertyChanged(name:string);
    }
```

## AtomDevice
```typescript

    type AtomAction = (msg: string, data: any) => void;

    class AtomDevice{

        // only access static instance
        // never create an instance
        static instance:AtomDevice;

        broadcast(message:string, data:any);

        // method will return subscription
        // you must call subscription.dispose() to avoid memory leak
        subscribe(message:string, action:AtomAction ): AtomDisposable;

        // takes care of errors
        runAsync<T>(task:Promise<T>):Promise<any>;
    }

```

## AtomList
```typescript

    class AtomList<T>{
        add(item:T):number;
        addAll(items:Array<T>);
        insert(i: number, item: T);
        removeAt(i: number);
        remove(item: T);
        clear();
        
        // refreshes binding
        refresh();        

        // watch for changes in events..
        // type: (add/remove)
        // returns AtomDisposable
        // you must call dispose on AtomDisposable to avoid
        // memory leak
        watch(f:(type:string, index:number)=>void): AtomDisposable;

    }

```

## DI
```typescript

    class DI{

        // this will resolve instance
        // by providing type
        // example,
        //
        //      @DIGlobal
        //      class BackendService{
        //          ....            
        //      }
        //
        //      var servie = WebAtoms.DI.resolve(BackendService);
        static resolve(c:{new ()}):any;


        // register a type in code instead of @DIGlobal
        // example,
        //
        //      WebAtoms.DI.register(BackendService, () => new BackendService()  );
        static register(c:{new ()}, factory: ()=> any);


        // manually override global instance, if you want to override factory, you can
        // call register method
        // example,
        //
        //      WebAtoms.DI.override(BackendService, new MockBackendService());
        // 
        static override(c:{new ()}, instance:any);

    }

```


