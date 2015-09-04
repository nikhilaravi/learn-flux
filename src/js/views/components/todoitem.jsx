"use strict";

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
