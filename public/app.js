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
// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1137251773008595',
    xfbml      : true,
    version    : 'v2.8'
  });

  FB.Event.subscribe('auth.authResponseChange', checkLoginState);
};

var appReference = firebase.database();
var storageRef = firebase.storage().ref();

function checkLoginState(event) {
  if (event.authResponse) {
  	$('.wrapper').css('display', 'inline-block');
    // Build Firebase credential with the Facebook auth token.
    var credential = firebase.auth.FacebookAuthProvider.credential(
        event.authResponse.accessToken);
    
    ready(credential);
    
  } else {
    // User is signed-out of Facebook.
    firebase.auth().signOut();
    $('#status').html('Successfully logged out!')
  }
}

function ready(credential) {
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
	    getPosts();
	  });
}

$('#image-file').change(handleFiles);

// Shows a thumbnail after selecting the picture
function handleFiles() {
  var fileList = this.files; 
  console.log(fileList);

	var a = $("#createPost").find('img');
	var postsRef = appReference.ref('posts');
	var newPost = postsRef.push({});
	var postId = newPost.key;

  FB.api('/me', function(response) {

  	getImgUrl(fileList[0], response.id, postId).then(function(url) {
	  	// Show only one picture at a time
	  	if(a.length < 1) {
	  			if(response.error) {
	  				return alert(response.error.message);
	  			}

		  		newPost.set({
		  			createdAt: Date.now(),
		  			userName: response.name,
		  			userId: response.id,
		  			likes: 0
		  		});

					$("#createPost").append($("<img/>").attr("src", url));
			} else {
				$("#createPost img").replaceWith($("<img/>").attr("src", url));
			}
  	});
  });
};

// Posts the photo to the Firebase and gets the URL from FB (a promise)
function getImgUrl(file, userId, postId) {
	var ref = storageRef.child('/profiles/' + userId + '/' + postId);

	return ref.put(file).then(function(snapshot) {
	  console.log('Uploaded a blob or file!');
	}).then(function () {
		return ref.getDownloadURL();
	});
}



function getPosts() {
	  appReference.ref('posts').on('value', function(results) {
	  	var allPosts = results.val();

	  	// empty the body first
	  	$('#posts').empty();

	  	Object.keys(allPosts).forEach(function (postId) {
	  		console.log(allPosts[postId]);
	  		var postsList = $('<li>');
	  		var path = '/profiles/' + allPosts[postId].userId + '/' + postId;
	  		var imageRef = storageRef.child(path);
        var likes = allPosts[postId].likes;
	  		var date = allPosts[postId].createdAt;
	  		var	name = allPosts[postId].userName;
        imageRef.getDownloadURL().then(function (url) {
		  		var image = $('<img>').attr('src', url);
		  		postsList.append(image);
	  		})
	  		var heartBtn = $('<i class="fa fa-heart-o" aria-hidden="true"></i>');
	  		heartBtn.on('click', function() {
	  			var postsRef = appReference.ref('posts').child(postId);
	  			postsRef.update({
	  				likes: likes+1
	  			})
	  		});
	  		
	  		var deleteBtn = $('<i class="fa fa-trash-o delete"></i>');
	  		deleteBtn.on('click', function() {
	  			var postsRef = appReference.ref('posts').child(postId);
	  			postsRef.remove()
					  .then(function() {
					    console.log("Remove succeeded.")
					  })
					  .catch(function(error) {
					    console.log("Remove failed: " + error.message)
					  });
	  			$(e.target.parentNode).remove();
        })

	  		postsList.append($('<p>').html(name));
	  		postsList.append(deleteBtn);
	  		postsList.append(heartBtn);
	  		postsList.append('<div class="pull-right">' + likes + '</div>');
	  		$('#posts').append(postsList);
	  		
	  		var postsRef = appReference.ref('posts' + postId);
			  postsRef.on('child_removed', function(data) {
				  deleteComment(postElement, data.key);
				});
	  	});

			// empty the creatPost box and post the photo in the body
			$('#submit').click(function() {
				$('#image-file').val('');
				$("#createPost").find('img').remove();

			});
	  });
	}


