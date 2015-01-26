// raf.js
// o2web.ca
// 2015

(function($) {

  // jquery window
  $win = $(window);

  // RAF polyfill
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };


  //
  //
  // HELPERS

  // count keys in object array
  count = function(obj){
    var count = 0;
    for(var key in obj)
      if (obj.hasOwnProperty(key))
        count++;
    return count;
  }

  // unset key in array
  unset = function(key, array){
    if(typeof key == 'string'){
      var value = array[key];
      delete array[key];
      return value;
    }
    return array.splice(key, 1);
  }

  // find hook inside an event's array
  findHook = function(hook, event){
    var key = -1;
    for(var i=0; i<event.length; i++)
      if(event[i].delegate == hook.delegate && event[i].callback == hook.callback) key = i;
    return key;
  }

  // track pointer position on mouse/touch move
  trackPointer = function(e){
    e.data.self.newPointer = { x: e.pageX, y: e.pageY };
  }

  //
  //
  // HOOK OBJECT
  function hookObj(){
    // create empty hook
    var hook = {
      event: false,
      callback: false,
      data: false,
      delegate: $win
    };

    // parse arguments based on their types
    for(var i=0; i<arguments.length; i++){
      var arg = arguments[i];
      var type = typeof arg;
      if(type=='string') hook.event = arg
      else if(arg instanceof jQuery || type=='boolean') hook.delegate = arg
      else if(type=='function') hook.callback = arg
      else if(type=='object') hook.data = arg;
    }
    return hook;
  }

  //
  //
  // RAF
  // structure :
  // raf -> events -> hooks -> callback()
  function raf(){
    //
    //
    // SETUP
    var self = this;
    // events holder
    this.events = [];
    // raf request
    this.request = undefined;
    //  scroll data
    this.scroll = {
      top: window.pageYOffset,
      left: window.pageYOffset
    };
    // resize data
    this.resize = {
      viewport: 'innerWidth' in window ? window : document.documentElement,
      prefix: 'innerWidth' in window ? 'inner' : 'client',
      width: 0,
      height: 0,
    }
    // pointer data
    this.pointer = {x:0, y:0};

    //
    //
    // init functions triggered for the first event of a kind
    this.inits = {
      // init pointermove
      pointermove: function(){
        // start tracking pointer position on window
        $win.on('mousemove touchmove', {self:self}, trackPointer);
      }
    }

    //
    //
    // kill functions triggered when there's no more hooks for an event
    this.kills = {
      // kill pointerpove
      pointermove: function(){
        // stop tracking pointer position on window
        $win.off('mousemove touchmove', trackPointer);
      }
    }

    //
    //
    // detection for events
    this.detect = {
      // detect if scroll position has changed
      scroll: function(){
        var current = {
          top: window.pageYOffset,
          left: window.pageXOffset
        }
        // exit if scroll positions have not changed
        if(current.top == self.scroll.top && current.left == self.scroll.left) return;
        // set new scroll positions
        self.scroll = current;
        // loop throught hooks on scroll event
        for(var i=0; i<self.events.scroll.length; i++){
          var hook = self.events.scroll[i];
          hook.callback(hook);
        }
      },

      // detect if window size have changed
      resize: function(){
        var current = {
          width: self.resize.viewport[self.resize.prefix+'Width'],
          height: self.resize.viewport[self.resize.prefix+'Height']
        }
        // exit if window size have not changed
        if(current.width == self.resize.width && current.height == self.resize.height) return;
        // set new window sizes
        self.resize.width = current.width;
        self.resize.height = current.height;
        // loop throught hooks on resize event
        for(var i=0; i<self.events.resize.length; i++){
          var hook = self.events.resize[i];
          hook.callback(hook);
        }
      },

      // detect if pointer has moved
      pointermove: function(){
        // exit here if there is no pointer new position
        if(!self.newPointer) return;
        // exit if position is the same
        if( self.pointer.x == self.newPointer.x && self.pointer.y == self.newPointer.y ) return;
        // set new pointer position and erase old one
        self.pointer = self.newPointer;
        self.newPointer = undefined;
        // loop throught hooks on pointermove event
        for(var i=0; i<self.events.pointermove.length; i++){
          var hook = self.events.pointermove[i];
          hook.pointer = self.pointer;
          hook.callback(hook);
        }
      },

      // detect when next frame is rendered
      nextframe: function(){
        // loop throught hooks on nextframe event
        for(var i=0; i<self.events.nextframe.length; i++){
          var hook = self.events.nextframe[i];
          hook.callback(hook);
        }
        // unset nextframe event, so it runs only once
        unset('nextframe', self.events);
        // update count
        self.eventsCount = count(self.events);
      }
    }

    //
    //
    // RAF on()
     // arguments order is not important
    // window.raf.on(type:string, delegate:$(), callback:function(), data:{})
    this.on = function(){
      // parse arguments into a new event
      var hook = hookObj.apply(this, arguments);
      // exit if event type is not set
      if(!hook.event) return false;
      // create / append hook
      if(!self.events[hook.event]){
        // create new event
        self.events[hook.event] = [];
        // update count
        self.eventsCount = count(self.events);
        // if an init function exists for this event, trigger it;
        if(self.inits[hook.event]) self.inits[hook.event]();
      }
      // push hook into event
      self.events[hook.event].push(hook);
      // start raf
      self.start();
      // return raf object
      return self;
    }
    //
    //
    // RAF off()
    // arguments order is not important
    // window.raf.off(type:string, delegate:$(), callback:function(), data:{}, unsetEntireEvent:bool)
    this.off = function(){
      // parse arguments into a new event
      var hook = hookObj.apply(this, arguments);
      // exit if event is not found
      if(!self.events[hook.event]) return false;
      // get event for this hook
      var event = self.events[hook.event];
      // remove whole event if is not set for a specific selection
      if(hook.delegate===true) unset(hook.event, self.events)
      // else, remove only hook
      else{
        // get hook index
        var hookIndex = findHook(hook, event);
        // if hook is found, unset it
        if(hookIndex>-1) unset(hookIndex, event);
        // if event is empty, unset it
        if(event.length==0){
          // unset event
          unset(hook.event, self.events);
          // if a kill function exists fot this event, trigger it;
          if(self.kills[hook.event]) self.kills[hook.event]();
        }
      }
      // update count
      self.eventsCount = count(self.events);
      // stop raf if there's no more events
      if(!self.eventsCount) return self.stop();
      // return raf object
      return self;
    }


    // loop animation
    this.loop = function() {
      // stop loop if no event to detect
      if(!self.eventsCount) return self.stop();
      // parse each event
      for(var e in self.events){
        if(self.detect[e]) self.detect[e]();
      }
      // request another frame
      self.request = window.requestAnimationFrame(self.loop);
    }

    // start animation
    this.start = function(){
      if(!self.request) self.loop();
      return self;
    }

    // stop animation
    this.stop = function(){
      if(self.request){
        window.cancelAnimationFrame(self.request);
        self.request = undefined;
      }
      return self;
    }

    //
    //
    //  return raf object
    return;
  }




  //
  //
  // JQUERY INIT
  $(document).ready(function(){
    // init RAF
    window.raf = new raf();
  });

}(jQuery));