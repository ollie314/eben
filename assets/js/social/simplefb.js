/*-------------------------------------------------------------------------
 * Facebook function definition
 *
 * DEPENDENCIES
 * 	- simapp.js
 *-------------------------------------------------------------------------*/

/**
 *
 * @author Mehdi Lefebvre mlefebvre@simnetsa.ch
 * @since
 * @version 0.01
 * @compagny Simnet S.A. (www.simnetsa.ch)
 * @copyright Simnet S.A.
 */
var SimFacebook = {
    API_ID 			: "490104927689454",
    CHAN_URL 		: "http://iphone.simnetsa.ch/grptv/services/facebook.html",
    callbackurl             : 'http://iphone.simnetsa.ch/grptv/services/fb.php',
    serviceUrl 		: 'http://iphone.simnetsa.ch/grptv/services/fb.php',
    domainName 		: 'http://iphone.simnetsa.ch',

    status : {
        connected : false,
        authorized : false,
        info : {}
    },

    isConnected : function() {
        return SimFacebook.status.connected;
    },

    isAuthorized : function() {
        return SimFacebook.status.authorized;
    },

    getInfo : function() {
        return SimFacebook.status.info;
    },

    init : function() {
        $( document ).bind( SimApp.events.FB_AUTHENTICATION_SUCCESS, function() {
            Simnet.Logger.trace( "Event received : [" + SimApp.events.FB_AUTHENTICATION_SUCCESS + "]" );
            SimFacebook.status.connected = true;
            SimFacebook.status.authorized = true;
        } );

        $( document ).bind( SimApp.events.FB_USER_NOT_AUTHORIZED, function() {
            Simnet.Logger.trace( "Event received : [" + SimApp.events.FB_USER_NOT_AUTHORIZED + "]" );
            SimFacebook.status.connected = false;
            SimFacebook.status.authorized = true;
        } );

        $( document ).bind( SimApp.events.FB_USER_NOT_CONNECTED, function() {
            Simnet.Logger.trace( "Event received : [" + SimApp.events.FB_USER_NOT_CONNECTED + "]" );
            SimFacebook.status.connected = false;
            SimFacebook.status.authorized = false;
        } );

        $( document ).bind( SimApp.events.FB_HANDSAKE_COMPLETE, function() {
            Simnet.Logger.trace( "Event received : [" + SimApp.events.FB_HANDSAKE_COMPLETE + "]" );
            window.plugins.childBrowser.close();
        } );
    },
    /**
	 * Post effecively a message on the facebook user's wall.
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
    doPost : function( message, options ) {
        options = options || {};
        var msg = {
            message : message.message,
            caption : options.description,
            picture : options.picture,
            link : options.url,
            name : options.name
        };
        FB.api( 'me/feed', 'post', msg, function( response ) {
            if( !response || response.error ) {
                $( document ).trigger( SimApp.events.FB_POST_ERROR , response );
                return false;
            }
            $( document ).trigger( SimApp.events.FB_POST_SUCCESS, {
                message : message,
                id : response.id
            } );
        } );
    },

    /**
	 * Do the handshake if the use isn't authenticated
	 *
	 * @param string message : the message to post
	 * @param object options : optionnal options to passed to the app (photo, geoloc, ...)
	 * @return void
	 */
    doHandshake : function( message, options ) {
        var successHandler = function( response ) {
            var browser = window.plugins.childBrowser, // childbrowser reference
            url = response.url;

            browser.showWebPage( url , {
                showLocationBar: true
            } );
            browser.onLocationChange = function( location ) {
                // check if the location is the service url, if then, read response to check out facebook information.
                // all information works at the cookie level, right here, we just wanna be sure that the request has been successfully completed.
                if( isValidLocation( location ) ) {
                    // TODO : manage the case where the url indicate the user authentication has failed
                    // the handshake has been successfully completed, so post message right now ...
                    SimFacebook.doPost( message, options );
                    // ... and mark the handshake completed
                    $( document ).trigger( SimApp.events.FB_HANDSAKE_COMPLETE );
                } else {
                    if( isEndLocation( location ) ) {
                        // failure, notification
                        $( document ).trigger( SimApp.events.FB_AUTHENTICATION_FAILURE );
                        SimApp.notify( SimApp.messages.AUTHENTICATION_FAILURE_ALERT );
                        $( document ).trigger( SimApp.events.FB_HANDSAKE_COMPLETE );
                    }
                }
            }; // browser.onLocationChange

            // when browser is closing, ask facebook to fetch user status and set internal
            // state of the current object according to this one.
            browser.onClose = function() {
                FB.getLoginStatus( function( response ) {
                    switch( response.status ) {
                        case 'connected' :
                            // facebook indicate that the user is correctly authenticated ...
                            $( document ).trigger( SimApp.events.FB_AUTHENTICATION_SUCCESS );
                            break;
                        case 'not_authorized' :
                            // facebook indicate that the user is authenticated but application is not authorized ...
                            $( document ).trigger( SimApp.events.FB_AUTHENTICATION_FAILURE );
                            $( document ).trigger( SimApp.events.FB_USER_NOT_AUTHORIZED );
                            break;
                        default :
                            // facebook indicate something else. It means the request failed and the user is not connected
                            $( document ).trigger( SimApp.events.FB_AUTHENTICATION_FAILURE );
                            $( document ).trigger( SimApp.events.FB_USER_NOT_CONNECTED );
                    }
                } );
            }; // browser.onClose
        }, // successHandler
        isValidLocation = function( location ) {
            // check if the url is the service one ...
            return ( location.indexOf( SimFacebook.serviceUrl ) + "?" >= 0 );
        },
        isEndLocation = function( location ){
            // check if the url is in the simnet domain or not. If it is on, it means
            // the request has been completed ...
            return ( location.indexOf( SimFacebook.domainUrl ) >= 0 );
        },
        onHandshakeComplete = function() {
            SimApp.cb.close();
            $( document ).unbind( SimApp.events.FB_HANDSAKE_COMPLETE, onHandshakeComplete );
        };
        $( document ).bind( SimApp.events.FB_HANDSAKE_COMPLETE , onHandshakeComplete );
        $.ajax( {
            url : SimFacebook.serviceUrl,
            data : {
                action : 'login'
            },
            dataType : 'json',
            type : 'post',
            beforeSend : function() {
                $( document ).trigger( SimApp.events.AJAX_LOADING_START );
            },
            complete : function() {
                $( document ).trigger( SimApp.events.AJAX_LOADING_COMPLETE );
            },
            success : function( data, status, jqXHR ) {
                // manage response using statusCode
                if( data.statusCode == 0 ) {
                    // success response ...
                    successHandler( data.content );
                    // trigger event indicate ajax loading success.
                    $( document ).trigger( SimApp.events.AJAX_LOADING_SUCCESS );
                } else {
                    // error response ...
                    // TODO : still have to manage the error (kind, dispatching, system behavior ...)
                    data = $.extend( data, {
                        type : SimApp.errors.SERCICE_ERROR
                    } );
                    $( document ).trigger( SimApp.events.AJAX_LOADING_ERROR, {
                        data : data,
                        status : status
                    } );
                }
            },
            error : function( status, jqXHR, errorThrown ) {
                $( document ).trigger( SimApp.events.AJAX_LOADING_ERROR, {
                    data : {
                        type : SimApp.errors.NETWORK_ERROR,
                        error : errorThrown
                    },
                    status : status
                } );
            }
        } );
    },

    /**
        * Post a message on the facebook user's wall. Depending on the user status,
        * the system may try to do an handshake to be able to post on the media.
        *
        * @param string message : the message to post
        * @param object options : optionnal options to passed to the app (photo, geoloc, ...)
        * @return void
        */
    postMessage : function( message, options ) {

        if( !( SimFacebook.isConnected() && SimFacebook.isAuthorized() ) ) {
            SimFacebook.doHandshake( message, options );
        } else {
            SimFacebook.doPost( message, options );
        }
    },

    /**
	 * Handler for login status send as soon as the api has been loaded.
	 * This handler only fire event to the context depending on the status of the user's account connection
	 *
	 * @return void
	 */
    fetchLoginStatus : function() {
        FB.getLoginStatus( function( response ) {
            switch( response.status ) {
                case 'connected' :
                    $( document ).trigger( SimApp.events.FB_USER_AUTHENTICATED, response );
                    break;
                case 'not_authorized' :
                    $( document ).trigger( SimApp.events.FB_USER_NOT_AUTHORIZED );
                    break;
                default :
                    $( document ).trigger( SimApp.events.FB_USER_NOT_CONNECTED );
            }
        } );
    },

    login : function() {
    }
};