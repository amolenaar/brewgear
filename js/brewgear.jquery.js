/**
 * Extend JQuery with some custom methods.
 */

$.extend({
  escape: function(txt) {
    return txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  },
  update_queue: [],
  _change_count: 0,
  _update_timer: 0,
  
  process_updates: function() {
    /* Processing is delayed by a timeout function. This way
     * all change() events can be queued and update()s for a
     * field only have to be performed once.
     * In addition, the updates are performed through an interval,
     * this ensures the a nice spinner is showing up as soon as updates
     * take place.
     */
    if ($._update_timer === 0) {
      $('#spinner').css('visibility', 'visible');
      $._update_timer = setTimeout(function() {
        //console.log('start processing of update queue');
        try {
          var q = $.unique($.update_queue.reverse());
          $._update_timer = 0;
          q.reverse();
          var i = 0;
          var ival_id = setInterval(function() {
            $(q[i++]).update();
            //console.log('updated element', i, 'of', q.length, ':', q[i]);
            if (i >= q.length) {
              $('#spinner').css('visibility', 'hidden');
              clearInterval(ival_id);
            }
          }, 1);
          //for (var i in q) {
          //  $(q[i]).update();
          //}
          //$('#spinner').css('visibility', 'hidden');
        } finally {
          $.update_queue = [];
        }
      }, 1);
    }
  },
  

  block: function(callback) {
    var blocker = $('#_jq_blocker');
    if (!blocker.length) {
      $('body').append('<div id="_jq_blocker" />');
      blocker = $('#_jq_blocker');
      blocker.css({
        position: 'fixed',
        'background-color': 'black',
        opacity: 0.1,
        left: 0,
        top: 0, bottom: 0, right: 0,
        //width: $('body').innerWidth() + 'px',
        height: $('body').innerHeight() + 'px',
        'z-index': 999,
        cursor: 'wait'
      });
    }
    blocker.css('display', 'block');
    if (callback) { callback(); }
  },

  unblock: function(callback) {
    var blocker = $('#_jq_blocker');
    blocker.css('display', 'none');
    if (callback) { callback(); }
  }
});

$.fn.extend({

  /**
   * Simple way to enable/disable input fields.
   */
  disable: function() {
    $(this).attr('disabled', 'disabled');
  },

  enable: function() {
    $(this).removeAttr('disabled');
  },

  showDialog: function(callback) {
    var d = $(this);
    $.block(function() {
      d.css('left', (window.innerWidth - d.outerWidth()) / 2 + 'px');
      $(d).slideDown(callback);
    });
  },
  
  hideDialog: function(callback) {
    $(this).slideUp(function() {
      $.unblock(callback);
    });
  },
  
  /**
   * Returns the sum of a set of (input) fields. The value of a field is
   * determined by val(). Only finite values are added.
   */
  sum: function() {
    var total = 0;
    $(this).each(function() {
      var f = parseFloat($(this).val());
      if (isFinite(f)) { total += f }
    });
    return total;
  },

  /**
   * Override the change event.
   * The handler is wrapped, so it knows how to deal with queued updates.
   */
  change: function(handler) {
    return handler ? this.bind("change", function() {
      //console.log('Toplevel change is', this, e, toplevel, $.update_queue.length);
      $._change_count++;
      try {
        $(this).each(handler);
      } finally {
        --$._change_count;
      }
      if($._change_count === 0) {
        //console.log('processing queue from', this);
        $.process_updates();
      }
    }) : this.trigger("change");
  },

  /**
   * In case of a change() event (invoked by the user) and update() + change()
   * is invoked for the element.
   */
  observe: function(observed, lock) {
    var e = $(this);
    $(observed).change(function() {
      //console.log('updating', e, 'from', this);
      e.queue_for_update();
      e.change();
    });
    return this;
  },

  queue_for_update: function() {
    //$(this).update();
    //console.log('Pushing', this, 'on the queue');
    $.update_queue.push(this);
    return this;
  },

  /**
   * This (custom) trigger is used to update specific fields. The data used
   * may be obtained from other fields on the page.
   *
   * If 'observed' is provided, the update() function should only be performed if
   * one of the observed elements is causing the update signal.
   */
  update: function(handler) {
    return handler ? this.bind("update", handler) : this.trigger("update");
  },

  /**
   * Field() parses the input field value, to float or integer if the "real"
   * or "number" class is assigned to the input.
   */
  field: function() {
    var e = $(this);
    var c = e.attr('class');
    try {
      if (c.match(/\breal\b/)) {
        return parseFloat(e.val());
      } else if (c.match(/\bnumber\b/)) {
        return parseInt(e.val(), 10);
      } else if (c.match(/\bdate\b/)) {
        var parts = e.val().split(/[^\d]/);
        var y = parseInt(parts[2], 10), m = parseInt(parts[1], 10), d = parseInt(parts[0], 10);
        if (y < 100) { y += 2000; }
        return new Date(y, m-1, d);
      }
    } catch(exc) { }
    return e.val();
  },

  multistate: function(state) {
    if (typeof state == "string") {
      var e = $(this);
      var map = e.data('multistate');
      if (!map) {
        throw "Element not defined as multistate object";
      }
      var kv = map[state || '_default_'];
      $(this).val(kv[0]).text(kv[1]);
      return this;
    }
    
    // Default: initialize multistate input
    $(this).each(function() {
      var e = $(this);
      var map = { };
      var items = e.attr('rel').split(/,/);
      var last = '_default_';
      for (i in items) {
        var kv = items[i].split(/:/);
        map[last] = kv;
        last = kv[0];
      }
      // make the reference cyclic:
      map[last] = map._default_;
      
      var val = e.val();
      if (!val || val == map._default_[0]) {
        e.val(map._default_[0]).text(map._default_[1]);
      }
      e.click(function() {
        var map = e.data('multistate');
        var kv = map[e.val() || '_default_'];
        e.val(kv[0]).text(kv[1]).change();
      });
      e.data('multistate', map);
    });
    return this;
  }
  
});

// vim: sw=2:et:ai
