#Learn Flux

##What is Flux?

Flux is a client side application architecture that facilitates one way data flow. Unlike MVC, cascading updates can be avoided helping to prevent unpredictable results due to user interactions.

Simple structure of a flux application:

1. The data/business logic for the application is kept in **stores**. Stores register callbacks with a central **dispatcher** module which is similar to a [pub-sub system](link).

2.Users interact with a **view**. In response, an **action** (e.g. new message) containing a payload is created using an **action-creator** helper method.

3. The **action** is sent to the central **dispatcher** which calls the relevant data **store**.

4. In the callback registered by the **stores**, a switch statement is used to determine the appropriate response for the **action**.

5. The **stores** emit an event to notify the **views** that the data layer has been changed.

6. **Controller views** listen for these change events and can retrieve data from the **stores**. The appropriate **views** are then re-rendered.


###Action Creators

These are dispatcher helper methods called by views that create actions to pass to the stores.

###Dispatcher

Has two main functions:

1. Allow callbacks from stores to be registered

2. Take requests for actions from the views

A dispatcher differs from a pub-sub system in that every payload is dispatched to every registered callback (no subscription to events) and callbacks can be deferred until other callbacks are executed (to allow for dependancies between stores - see [Extensions](link)).

###Stores

Perform two functions:

1. Register callbacks with the dispatcher so that when an action is initiated, the store is notified and can respond.

Callbacks are the only entry point into the store.

2. Notify views of changes to the data layer through events.

Dependancies between stores can also be managed using the dispatcher. Stores can specify to wait for another store to update before updating themselves.

###Controller Views

Provide the link between the stores and the views. Controller-views are listeners for change events emitted by the stores, and cause re-rendering of views using their `setState()` or `forceUpdate()` methods. The top level parent component in a React App usually performs the role of the controller-view.

###Views

These are what the user sees. The views handle user interactions and create actions.  

##React.js

###Tutorial

To get a basic intro to React.js try this [tutorial](https://github.com/foundersandcoders/begin_react_workshop).

###React Best Practices
**Step 1: Draw wireframes for the UI and break it into components.**

A simple rule for separating components is the single responsibility principle - each component should only do one thing.

**Step 2: Arrange the components into a hierarchy**

Components that appear within another component become children of the parent component

**Step 3: Build a basic static version in React using only props**

Start with dummy data and render it into the UI using React components. The data should not change over time.

**Step 4: Figure out the minimal representation of the state**

Ask these questions to determine which properties should be states:
Is it passed in from a parent via props?
Does it change over time (e.g. based on user interaction)?
Can you compute it based on any other state or props in your component?

If the answer is yes to any of these then the value isn't a state.

**Step 5: Determine which component(s) should be stateful**

Look at which components require the same state variables. Then look up the component hierarchy to determine which parent these components belong to. The state should be declared in this parent and passed down as props to the children.

##Build a simple React app using Flux!

####Aims

* [ ] Add a new to do item to the list
* [ ] Toggle completion on click (indicate using strikethrough of text)
* [ ] Button to delete all completed items
* [ ] Save todo items and load the list when the page loads

To implement flux in our application, we'll use React.js for the Views, the Node EventEmitter for the Stores and the 'flux' npm module for the dispatcher (created by facebook).

We'll also be using browserify to bundle up our react components.

1. Clone this GitHub Repo

  ```
  git clone https://github.com/nikhilaravi/learn-flux.git

  ```

2. Make sure you are in the master branch. This contains only the folder structure and the `complete-app` branch contains the full code.

  ```
    - src
      - css
        - main.css
      - js
        - actions
          - actions.js
        - dispatcher
          - dispatcher.js
        - stores
          - todostore.js
        - views
          - components  
            - todoitem.jsx
            - todolist.jsx
            - todotextinput.jsx
          - main.jsx  // this file gets compiled by Browserify into a file called main.js within a new 'build' folder
        - emiiter.js
    - index.html

  ```

  As you go through the tutorial, fill in the code in the relevant files. The React component hierarchy for the app looks like this:

  ```
  <App>
    <TodoTextInput />
    <TodoList>
      <ul>
        <TodoItem />
      </ul>
    </TodoList>
  </App>

  ```

3. We'll start with the Dispatcher. Navigate to the dispatcher.js file in the Dispatcher folder.

  Here we will initialise our flux dispatcher and export it to use in our views.  

  ```js
  var Dispatcher = require('flux').Dispatcher;
  module.exports = Dispatcher;
  ```

4. Create the event emitter. We'll be using the `event-emitter` npm module for this.

  ```js
  var ee = require('event-emitter');
  var Emitter = ee({});
  module.exports = Emitter;
  ```

5. Create the  Todo list store.

  First, require in the Dispatcher and the event emitter and create a list object that will be our data store.

  We're using localStorage to save the list item between sessions.

  ```js
  var Dispatcher = require("../dispatcher/dispatcher.js");
  var emitter = require("../emitter.js");
  var list = JSON.parse(localStorage.getItem("todo-list")) || {}; //lives outside exported react classes - private data structure

  ```

  We're then going to create the different functions that will update our `list` data object:

  ```js
  var Store = {

    get: function() {
      this.notify();
    },

    create: function (text) {
      var id = Date.now();
       list[id] = {
         id: id,
         complete: false,
         text: text
       };
      this.notify();
    },

    toggleComplete: function(id) {
      list[id].complete = !list[id].complete;
      this.save();
    },

    save: function() {
      localStorage.setItem("todo-list", JSON.stringify(list));
      this.notify();
    },

    notify: function() {
      emitter.emit("list-changed", list);
    },

    delete: function() {
      for (var key in list){
        list[key].complete === true ? delete list[key] : 0
      };
      this.save()
    }

  };
  module.exports = Store;
  ```

  We then have to register the store with the dispatcher along with a callback function that is called every time an action from the views is sent through the dispatcher. We sort the actions by looking at their type and using a switch statement. (We'll get to the action helper functions next!)

  ```js
  Dispatcher.register(function(payload){
    switch (payload.type) {
      case "get-items":
        Store.get();
        break;
      case "create-item":
        Store.create(payload.text);
        break;
      case "complete-item":
        Store.toggleComplete(payload.id);
        break;
      case "save-items":
        Store.quit(payload.list);
        break;
      case "delete-completed":
        Store.delete()
        break;
    }
  });
  ```

5. Create the Action helpers.
    These are helper functions that format the actions sent by the views and dispatch them to the dispatcher. First require in the dispatcher.

  ```js
  var Dispatcher = require("../dispatcher/dispatcher.js");

  var Actions = {

    create: function(text) {
      Dispatcher.dispatch({
        type: "create-item",
        text: text
      })
    },

    complete: function(id) {
      Dispatcher.dispatch({
        type: "complete-item",
        id: id
      })
    },

    delete: function() {
      Dispatcher.dispatch({
        type: "delete-completed"
      })
    },
  };

  module.exports = Actions;

  ```

6. Create the Controller View (main.jsx).
  This is the parent component of all our React components. It contains listeners for updates from the stores on changes to the data layer.
  Start by requiring in all the components (don't worry we'll create these next), the Actions helper, the store and the emitter.

  ```js
  var React = require("react");
  var Input = require("./components/todotextinput.jsx");
  var TodoList = require("./components/todolist.jsx");
  var Dispatcher = require("../dispatcher/dispatcher.js");
  var Actions = require("../actions/actions.js");
  var Store = require("../stores/todostore.js")
  var emitter = require("../emitter.js");

  ```

  Then create the App component.

  ```js

  var App = React.createClass({

    getInitialState: function(){
      return {
        todos: {}, // the todo list items state variable is initialised in this parent component
        input: ""
      }
    },

    saveInput: function(e) {
      this.setState({
        input: e.target.value
      })
    },

    componentDidMount: function() {  // when the component mounts send an action through the dispatcher to the stores to retrieve all the stored items
      Dispatcher.dispatch({ type: "get-items" });
    },

    componentWillMount: function() { // when mounted, register a listener for updates to the to do list store and update the todo list state with the new information. This will trigger a re-rendering of the app with the new to do items
       emitter.on("list-changed", function(todos) {
           this.setState({ todos: todos });
       }.bind(this));
     },

    render: function(){
      return (
        <div className="app-container">
          <Input input={this.state.input} saveInput={this.saveInput}/>
          <TodoList items={this.state.todos}/>
        </div>
      )
    }
  });

  ```

  Finally we want to render our app into our index.html page.

  ```js
  React.render(
    <App />,
    document.getElementById("content")
  );

  ```

7. Create the Sub components.

  We have three sub-components to create. Firstly the text-input component.. Require in the action-creator helpers:

  ```js
  var React = require("react");
  var Actions = require("../../actions/actions.js");
  ```

  Then create the component.

  ```js
  var TextInput = React.createClass({

    getInitialState: function() {
      return {
        text: ""
      }
    },

    saveInput: function(e) {
      this.setState({
        text: e.target.value
      })
    },

    save: function(e) {
      e.preventDefault();
      Actions.create(this.state.text);
   },

   deleteCompleted: function(e) {
      e.preventDefault();
      Actions.delete();
   },

   onKeyDown: function(e) {
     if (e.keyCode === 13) {
       this.save();
     }
   },

    render: function(){
      return (
        <form>
          <input className="todo-text" type="text" onChange={this.saveInput} name="input"></input>
          <input className="todo-submit" type="submit" onClick={this.save} value="ADD ITEM"></input>
          <input className="todo-submit" type="submit" onClick={this.deleteCompleted} value="DELETE COMPLETED"></input>
        </form>
      )
    }
  });
  module.exports = TextInput;

  ```

  Then create the ToDoItem component:

  ```js
  var React = require("react");
  var Actions = require("../../actions/actions.js");

  var TodoItem = React.createClass({
    getDefaultProps: function(){
      return {
        item: ""
      }
    },

    markComplete: function() {
      Actions.complete(this.props.item.id);
    },

    render: function(){
      return (
          <li className={this.props.item.complete === false ? "incomplete" : "completed"} onClick={this.markComplete}>{this.props.item.text}</li>
      )
    }
  });

  module.exports = TodoItem;
  ```

  And finally the ToDoList component which creates a new TodoItem every time someone submits a new todo item.

  ```js
  var React = require("react");
  var TodoItem = require("./todoitem.jsx");

  var TodoList = React.createClass({
    getDefaultProps: function(){
      return ({
        items: {}
      })
    },

    render: function(){
      var todos = [];

      for (var key in this.props.items) {
        todos.push(<TodoItem key={this.props.items[key].id} item={this.props.items[key]}/>)
      }

      return (
        <div>
          <div className="title">To Do list:</div>
          <ul className="list-items">
            {todos}
          </ul>
        </div>
      )
    }
  });

  module.exports = TodoList;
  ```

8. Give it some styling! The CSS is already in main.css but you can modify it however you like!

9. Run the project using `npm run dev` in your terminal and navigate to `www.localhost//8080` to view your app!

Notes:
* make sure you add `"use strict!"` at the top of all your jsx files!
* TESTS are coming....

Extensions:
* The dispatcher also has a [`waitFor()` method](link) that allows for dependancies between stores - stores can wait for another store to update before updating themselves. Try and extend the 'todo' app implement the `waitFor()` method.
