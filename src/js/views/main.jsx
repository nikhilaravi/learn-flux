// This acts as the controller view
"use strict";
var React = require("react");
var Input = require("./components/todotextinput.jsx");
var TodoList = require("./components/todolist.jsx");
var Dispatcher = require("../dispatcher/dispatcher.js");
var Actions = require("../actions/actions.js");
var Store = require("../stores/todostore.js")
var emitter = require("../emitter.js");

var App = React.createClass({

  getInitialState: function(){
    return {
      todos: {}
    }
  },

  componentDidMount: function() {
    Dispatcher.dispatch({ type: "get-items" });
  },

  componentWillMount: function() {
     emitter.on("list-changed", function(todos) {
         this.setState({ todos: todos });
     }.bind(this));
   },

  render: function(){
    return (
      <div className="app-container">
        <Input deleteCompleted={this.deleteCompleted}/>
        <TodoList items={this.state.todos}/>
      </div>
    )
  }
});

React.render(
  <App />,
  document.getElementById("content")
);
