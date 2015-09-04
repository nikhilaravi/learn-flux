"use strict";

var Dispatcher = require("../dispatcher/dispatcher.js");
var emitter = require("../emitter.js");

var list = JSON.parse(localStorage.getItem("todo-list")) || {}; //lives outside exported react class - private data structure

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

module.exports = Store;
