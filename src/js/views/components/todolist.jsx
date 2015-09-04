"use strict";

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
