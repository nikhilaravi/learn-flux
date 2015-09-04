"use strict";

var React = require("react");
var Actions = require("../../actions/actions.js");

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
