"use strict";

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
