// ytk-jukebox

"use strict";

const model = {
  loggedIn: false,
  username: null
};

function toggleUserStuff(loggedIn, username) {
  model.loggedIn = loggedIn;
  model.username = username;
}

function logout() {
  firebase.auth().signOut().then(
    ()=>{ toggleUserStuff(false); },
    ()=>alert('logout failed. maybe try refreshing the page?'));
}

// validate the song request form and submit to firebase
function request_song() {
  function fail(reason) {
    alert(reason);
    return false;
  }

  let vid = "",
      form = document.forms["song-request"];
  const fields = ["singer", "link", "title", "artist"];

  for (let i = 0; i < fields.length; i++) {
    if (!form[fields[i]].value) return fail('missing required field: ' + fields[i]);
  }

  try {
    vid = new URL(form['link'].value).searchParams.get('v');
  } catch (e) {
    return fail('please use a youtube video link with v=XXXX in the query string.');
  }

  if (vid.length !== 11) return fail("video link contains an invalid video id.");

  $(form).find("button").prop("disabled", true);

  let request = {
    singer: form['singer'].value,
    title: form['title'].value,
    artist: form['artist'].value,
    vid: vid
  };

  let qRef = '/q', // where to put the queue
      key = firebase.database().ref(qRef).push().key,
      ups = {};
  ups[qRef + '/' + key] = request;
  firebase.database().ref().update(ups).then(function () {
    form.reset();
    $(form).find("button").prop("disabled", false);
  });
  return false;
}

function ensure_user() {
  let df = $.Deferred();
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      toggleUserStuff(true, user.displayName);
      df.resolve(user);
    } else {
      toggleUserStuff(false);
      let ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', {
        signInSuccessUrl: 'app.html',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        tosUrl: 'TODO'
      });
    }
  });
  return df.promise();
}

function ytk_songlist(user) {
  let grid = $('#ytk-songs').find('.grid').kendoGrid({
    columns: [
      {field: 'v', title: 'vid'},
      {field: 't', title: 'title'},
      {field: 'a', title: 'artist'}],
    dataSource: {
      autoSync: true,
      schema: {model: {id: 'v'}},
      type: 'firebase',
      transport: {
        firebase: {ref: '/u/' + user.uid}
      }
    },
    editable: true,
    toolbar: ['create', 'save', 'cancel']
  }).data('kendoGrid');

  // make the grid rows sortable
  grid.table.kendoSortable({
    filter: '>tbody >tr',
    cursor: 'move',
    hint: function (elem) {
      return $('<table class="k-grid k-widget"></table>')
        .append(elem.clone())
        .css({width: '640px', opacity: 0.7});
    },
    placeholder: function (elem) {
      let result = $('<tr class="placeholder"><td colspan="4"></td></tr>');
      result.find('td').css({"border-bottom": 'dashed silver 2px'});
      return result;
    },
    change: function (e) {
      let skip = 0, // grid.dataSource.skip(),
        item = grid.dataSource.getByUid(e.item.data('uid'));
      grid.dataSource.remove(item);
      grid.dataSource.insert(e.newIndex + skip, item);
    }
  });
}


const ytk = new Vue({
  el: '#ytk-app',
  data: model
});
$(() => ensure_user().then(ytk_songlist));
