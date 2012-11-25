// JavaScript Document

// constants use by thirds
const DEBUG_MODE            = true;
const API_ID                = "490104927689454";
const CHAN_URL              = "//WWW.simnetsa.ch/channel.html";

// constants use by the application
const UNAUTHORIZED_MSG      = "Application is not authorized. Please authorized it from the application settings";
const NOT_LOGGED_MSG        = "User not connected. Please authenticate yourself on the application using facebook";

/**
 * This var contains all information about current fb exchanges.
 *
 * @var object
 */
var fb_status = {
    connection_state : {
        connected : false, /* indicate if the user is connected */
        authorized : false /* indicate i fthe application is authorized by the user */
    },
    login : null, /* facebook login currently */
    user_infos : {} /* facebook user informations */
};


/**
 * Send an android like notification on the UI.
 * The content of the notification may only be a string representing the message
 * to display.
 *
 * @param string message : the message to display
 * @return boolean : always true for now.
 */
function notify( message ) {
    try {
        $( "#notificationContainer" ).html( message )
            .toast( 'show' );
    } catch ( err ) {
        alert( message );
    }
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
function post_message( message, options ) {
    if( fb_status.connection_state.connected &&
        fb_status.connection_state.authorized ) {
        options = options || {};
        var fb_message = {
            message : message.message,
            caption : options.description,
            picture : options.picture,
            link : options.url,
            name : options.name
        };
        FB.api('me/feed', 'post', fb_message, function( response ) {
            if( !response || response.error ) {
                $( document ).trigger( 'fbposterror', response );
				notify("Erreur avec la connexion Facebook");
                return false;
            }
            $( document ).trigger( 'fbpostsuccess', {
                message : message,
                id : response.id
            } );
        } );
    } else {
        if( !fb_status.connection_state.connected ) {
            function handle_success(event, handle_success ) {
                // redo post now ...
                post_message( message, options );
                // be sure to unbind to prevent any disturbing situation
                $( document ).unbind( 'fbuserathenticationsuccess', handle_success );
            };
            $( document ).bind( 'fbuserathenticationsuccess', handle_success );
            login();
        } else {
            notify( UNAUTHORIZED_MSG );
        }
    }
};

function update_user_status_after_success() {
    // update information about the current state of the application
    fb_status.connection_state.connected = true;
    fb_status.connection_state.authorized = true;
};

function update_user_status_after_unauthorized() {
    // update information about the current state of the application
    fb_status.connection_state.connected = true;
    fb_status.connection_state.authorized = false;
};

function load_user_informations( event, auth_response ) {
    var u_id = auth_response.userID;
    // assign user id to the fb_status ...
    fb_status.user_infos['id'] = u_id;
    // setup the logout button be retreiving information about the user.
    FB.api( '/me', function( api_response ) {
        console.log( api_response );
    } );
};

/**
 * Login method for facebook.
 *
 * @return void
 */
function login() {
    FB.login( function( response ) {
        if( response.authResponse ) {
            $( document ).trigger( 'fbuserathenticationsuccess', response.authResponse );
        } else {
            // user not login ...
            $( document ).trigger( 'fbuserauthenticationfailure' );
        }
    }, {scope: 'publish_stream'} ) ;
};

/**
 * Response handler for the facebook logout response event.
 *
 * @param object response : facebook response
 * @return void
 */
function fb_logout_handler( response ) {
    fb_status.connection_state.connected = false;
};

/**
 * Logout method for facebook.
 *
 * @return void
 */
function logout() {
    FB.logout( fb_logout_handler );
};

// subscribe to social events. Let this out of any closure since it may have to react to FB events and
// those are not necessarily published in a closure and consequently require global handlers.
$( document ).bind( 'fbuserauthenticated' , update_user_status_after_success );
$( document ).bind( 'fbuserathenticationsuccess', update_user_status_after_success );
$( document ).bind( 'fbuserathenticationsuccess', load_user_informations );
$( document ).bind( 'fbuserappnotauthorized' , update_user_status_after_unauthorized );

// FaceBook initialisation process. Do not wrap this part, it may disturb Facebook api / processes
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
                // fire success
                $( document ).trigger( 'fbuserauthenticated', response );
                break;
            case 'not_authorized' :
                // fire unauthorized notification.
                $( document ).trigger( 'fbuserappnotauthorized' );
                notify( UNAUTHORIZED_MSG );
                break;
            default :
                $( document ).trigger( 'fbusernotloggedin' );
                notify( NOT_LOGGED_MSG );
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


