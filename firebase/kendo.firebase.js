// based on: https://github.com/jbristowe/kendo-fire
/*
The MIT License (MIT)

Copyright (c) 2014 John Bristowe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function (kendo, undefined) {
  kendo.data.transports.firebase = kendo.data.RemoteTransport.extend({
    create: function (options) {
      var data = this.parameterMap(options.data, 'create');
      delete data.id;

      this.requestId = kendo.guid();

      var fbRef = this.ref.push(data, function (error) {
        if (error) options.fail();
      });

      if (fbRef !== undefined) {
        var result = data;
        result.id = fbRef.getKey();
        options.success(result);
        delete this.requestId;
      }
    },

    destroy: function (options) {
      var data = this.parameterMap(options.data, 'update');
      this.ref.child(data.id).set(null, function (error) {
        if (!error) {
          var result = data;
          result.id = data.id;
          options.success(result);
        } else {
          options.fail();
        }
      });
    },

    init: function (options) {
      let fbOpt = options && options.firebase ? options.firebase : {},
          ref = fbOpt.ref;
      if (!ref) throw new Error('The firebase.ref option must be set.');
      this.ref = firebase.database().ref(ref);
      kendo.data.RemoteTransport.fn.init.call(this, options);
    },

    push: function (callbacks) {
      this.ref.on('child_added', function (childSnapshot, prevChildName) {
        if (this.requestId !== undefined) {
          return;
        }
        var model = childSnapshot.val();
        model.id = childSnapshot.key;
        callbacks.pushUpdate(model);
      }, function() {}, this);

      this.ref.on('child_changed', function (childSnapshot, prevChildName) {
        var model = childSnapshot.val();
        model.id = childSnapshot.key;
        callbacks.pushUpdate(model);
      });

      this.ref.on('child_moved', function (childSnapshot, prevChildName) {
        var model = childSnapshot.val();
        model.id = childSnapshot.key;
        callbacks.pushUpdate(model);
      });

      this.ref.on('child_removed', function (oldChildSnapshot) {
        var model = oldChildSnapshot.val();
        model.id = oldChildSnapshot.key;
        callbacks.pushDestroy(model);
      });
    },

    read: function (options) {
      this.ref.once('value', function (dataSnapshot) {
        var data = [];
        dataSnapshot.forEach(function (childSnapshot) {
          var item = childSnapshot.val();
          item.id = childSnapshot.key;
          data.push(item);
        });
        options.success(data);
      });
    },

    update: function (options) {
      var id = options.data.id,
          data = this.parameterMap(options.data, 'update');

      delete data.id;
      this.ref.child(id).set(data, function(error) {
        if (!error) {
          var result = data;
          result.id = id;
          options.success(result);
        } else {
          options.fail();
        }
      });
    }
  });
})(window.kendo);
