function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    testAPI();
    $('#content').css('background-color', 'blue');
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1137251773008595',
    xfbml      : true,
    version    : 'v2.8'
  });

  FB.Event.subscribe('auth.authResponseChange', checkLoginState);
};

function myFacebookLogin() {
  FB.login(function(){}, {scope: 'publish_actions'});
}

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}

function checkLoginState(event) {
  if (event.authResponse) {
    // Build Firebase credential with the Facebook auth token.
    var credential = firebase.auth.FacebookAuthProvider.credential(
        event.authResponse.accessToken);
    // Sign in with the credential from the Facebook user.
    firebase.auth().signInWithCredential(credential).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
      alert("there was an error, " + errorMessage);
    });
  } else {
    // User is signed-out of Facebook.
    firebase.auth().signOut();
  }
}


var inputElement = $('#image-file').change(handleFiles);
function handleFiles() {
  var fileList = this.files; 
  console.log(fileList);

	var storageRef = firebase.storage().ref();

	// Create a reference to 'mountains.jpg'
	var ref = storageRef.child('/profiles/USERNAME/outfit.jpg');
	ref.getDownloadURL();

	ref.put(fileList[0]).then(function(snapshot) {
	  console.log('Uploaded a blob or file!');
	}).then(function () {
		return ref.getDownloadURL();
	}).then(function (url) {
		$("#createPost").append($("<img/>").attr("src", url));
	})
}
