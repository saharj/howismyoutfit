// function statusChangeCallback(response) {
//   console.log('statusChangeCallback');
//   console.log(response);
//   // The response object is returned with a status field that lets the
//   // app know the current login status of the person.
//   // Full docs on the response object can be found in the documentation
//   // for FB.getLoginStatus().
//   if (response.status === 'connected') {
//     // Logged into your app and Facebook.
//     testAPI();
//   } else if (response.status === 'not_authorized') {
//     // The person is logged into Facebook, but not your app.
//     document.getElementById('status').innerHTML = 'Please log ' +
//       'into this app.';
//   } else {
//     // The person is not logged into Facebook, so we're not sure if
//     // they are logged into this app or not.
//     document.getElementById('status').innerHTML = 'Please log ' +
//       'into Facebook.';
//   }
// }

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1137251773008595',
    xfbml      : true,
    version    : 'v2.8'
  });

  FB.Event.subscribe('auth.authResponseChange', checkLoginState);
};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState(event) {
  if (event.authResponse) {
  	$('.wrapper').css('display', 'inline-block');
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
    FB.api('/me', function(response) {
	    console.log('Successful login for: ' + response.name);
	    $('#status').html('Hello ' + response.name + '!');
	  });
  } else {
    // User is signed-out of Facebook.
    firebase.auth().signOut();
    $('#status').html('Successfully logged out!')
  }
}


var inputElement = $('#image-file').change(handleFiles);
function handleFiles() {
  var fileList = this.files; 
  console.log(fileList);

	var storageRef = firebase.storage().ref();

	var ref = storageRef.child('/profiles/USERNAME/outfit.jpg');
	ref.getDownloadURL();

	ref.put(fileList[0]).then(function(snapshot) {
	  console.log('Uploaded a blob or file!');
	}).then(function () {
		return ref.getDownloadURL();
	}).then(function (url) {
		var a = $("#createPost").find('img');
		console.log(url);

		// Avoid showing more than one pic in #createPost
		if(a.length < 1) {
			console.log('No image');
			$("#createPost").append($("<img/>").attr("src", url));
		} else {
			console.log('There exists an image');
			$("#createPost img").replaceWith($("<img/>").attr("src", url));
		}
	})
}
