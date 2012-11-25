// JavaScript Document
   
   const DEBUG_MODE = true;
   const API_ID = "490104927689454";
   const CHAN_URL = "//WWW.simnetsa.ch/channel.html";


/**
 * Send an android like notification on the UI.
 * The content of the notification may only be a string representing the message
 * to display.
 *
 * @param string message : the message to display
 * @return boolean : always true for now.
 */
function notify( message ) {
  $( "#notificationContainer" ).html( message )
    .toast( 'show' );
  return true;
};

/**
 * Post a message on the facebook user's wall.
 * To listen login response, subscribe to events decribe below :
 * - fbposterror : an error occurred during the process.
 *      -> prototype : function( event, response );
 * -fbpostsuccess : post has successfully been sent
 *      -> prototype : function( event, data );
 *      -> data :
 *           -> message : message sent
 *           -> id : the id of the message on facebook
 *
 * @param string message : the message to post
 * @param object options : optionnal options to passed to the app (photo, geoloc, ...)
 * @return void
 */
function postMessage( message, options ) {
  options = options || {};
  FB.api('me/feed', 'post', { message : message }, function( response ) {
      if( !response || response.error ) {
	$( document ).trigger( 'fbposterror', response );
	notify( 'Error !' );
	return false;
      }
      $( document ).trigger( 'fbpostsuccess', { message : message, id : response.id } );
	  notify( message );
    } );
}

window.fbAsyncInit = function() {
  // param to initialize the fb api
  FB.init( {
    appId      : API_ID,
    channelUrl : CHAN_URL,
    status     : true,
    cookie     : true,
    xfbml      : false
  } );

  // handler for login status send as soon as the api has been loaded.
   FB.getLoginStatus( function( response ) {
       switch( response.status ) {
       case 'connected' :
	 $( document ).trigger( 'fbuserauthenticated', response );
	 break;
       case 'not_authorized' :
	 var msg = "Application is not authorized. Please authorized it from the application settings";
	 $( document ).trigger( 'fbuserappnotauthorized' );
	 notify( msg );
	 break;
       default :
	 var msg = "User not connected. Please authenticate yourself on the application using facebook";
       $( document ).trigger( 'fbusernotloggedin' );
	 notify( msg );
       }
   } );

  };
// load the api and run it.
( function( doc, dbg ){
  var js = doc.createElement( 'script' ),
    id = 'facebook-jssdk', 
    ref = doc.getElementsByTagName( 'script' )[0];
  if( doc.getElementById( id ) ) {
    return;
  } 
  js.id = id;
  js.async = true;
  js.src = "//connect.facebook.net/en_US/all" + ( dbg ? "/debug" : "" ) + ".js";
  ref.parentNode.insertBefore( js, ref );
 }( document, DEBUG_MODE ) );

/**
 * Login method for facebook.
 *
 * @return void
 */
function login() {
  FB.login( function( response ) {
      if( response.authResponse ) {
	var uId = response.authResponse.userID;
	$( document ).trigger( 'fbuserathenticationsuccess', response.authResponse );

	// setup the logout button be retreiving information about the user.
	FB.api( '/me', function( apiResponse ) {
	    $( "#fbAction" ).off( 'click' )
	      .html( 'Logout' )
	      .click( function( mouseEvent ) {
		  FB.logout( fb_logout_handler );
	      } );
	} );

      } else {
	// user not login ...
	$( document ).trigger( 'fbuserauthenticationfailure' );
      }
  } ) ;
}


/**
 * Response handler for the facebook logout event.
 *
 * @param object response : facebook response
 * @return void
 */
function fb_logout_handler( response ) {
  $( "#fbAction" ).off( 'click' ) /* drop out all click event handler */
    .text( 'Login' ) /* reset text */
    .click( function( mEvent ) {
	login.call( this ); /* replace the handler */
    } );
}

/**
 * Logout method for facebook.
 *
 * @return void
 */
function logout() {
  FB.logout( fb_logout_handler );
}

//Jquery mobile doc loading handling method
$( document ).bind( 'pageinit', function( evt ) {
    $( '#notificationContainer' ).toast();
    console.log( 'page initialized' );

    // bind click on login button
    $( "#fbAction" ).click( function( mouseEvent ) {
		//user is already logged in and connected
		//login();
		optionsMessage = 
		{
			message : "Test de message",
			name : "Application mobile de Verbier",
			url : "http://www.verbierbooking.com",
			description : 'Ouverture à Verbier',
            picture : 'http://www.verbierbooking.ch/multimedia/images/img_traitees/2012/10/dsc_0482_zoom680-510.jpg'
		};
		postMessage("Ceci est un test",optionsMessage);
	return false;
    } );
});

