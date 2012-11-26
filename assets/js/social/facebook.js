/*-------------------------------------------------------------------------
 * Facebook function definition
 *
 * DEPENDENCIES
 *      - date.js
 *      - simnet.logger.js
 * 	- simapp.js
 *-------------------------------------------------------------------------*/

/*
 * Common defintion use by the application.
 */
var my_client_id = "490104927689454",
    my_secret = "53fb1242e82413962563b378bd6260f9",
    my_redirect_uri = "http://www.facebook.com/connect/login_success.html",
    my_type ="user_agent",
    my_display = "touch", // no longer used

    facebook_token = "fbToken"; // reference in the local storage
    client_browser = null; // childbrowser plugin reference

/**
 * The Facebook object definition.
 *
 * @author mlefebvre@simnetsa.ch
 * @version 0.04
 * @since 2012-11-26
 * @compagny Simnet S.A. (http://www.simnetsa.ch)
 * @copyright Simnet S.A.
 *
 * @resource http://www.drewdahlman.com/meusLabs/?p=88
 */
var Facebook = {

	status : {
		connected : false
	},
	
	constants : {
		PUBLIC_FEED : 'feed'
	},

    /**
     * Obtain the authorisation url based on informations defined at the top
     * of this document.
     *
     * @return string - the url
     */
    getAuthorizeUrl : function() {
        var authorize_url = "https://graph.facebook.com/oauth/authorize?" +
                "client_id=" + my_client_id +
                "&redirect_uri=" + my_redirect_uri +
                "&display=" + my_display +
                "&scope=publish_stream,offline_access";
        Simnet.Logger.debug( "Authorize url is [" + authorize_url + "]");
        return authorize_url;
    },

    /**
     * Initialize the facebook closure.
     * This method will automatically call the handshake process.
     *
     * @return void
     */
    init : function() {
    	Simnet.Logger.debug( "Facebook application intializing" );
    	// First lets check to see if we have a user or not
        if( !localStorage.getItem( facebook_token ) ) {
            Simnet.Logger.debug( "User not logged in to facebook" );
            SimApp.fireEvent( SimApp.events.FB_USER_NOT_CONNECTED );
            Facebook.status.connected = false;
            
            // bind events ...
            $( document ).bind( SimApp.events.FB_HANDSHAKE_COMPLETED, function() {
            	window.plugins.childBrowser.close();
            } );
        }
        else {
            Simnet.Logger.debug("User already logged in");
            SimApp.fireEvent( SimApp.events.FB_USER_AUTHENTICATED );
            Facebook.status.connected = true;
        }
        Simnet.Logger.debug( "Facebook application intialized" );
    },

    /**
     * Initialize the facebook connection.
     * This method will automatically call the handshake process.
     *
     * @todo : manage the case where an authentication attempt occured when a
     *  user is already logged in. Should normally cause no error since the facebook
     *  api will answer correctly and redirect to our url and then, the application
     *  will take back the hand.
     *
     * @return void
     */
    connect : function( feedType, message ) {
        // do connection only if needed
        if( Facebook.status.connected ) {
        	return false;
        }
        Simnet.Logger.debug( "Facebook connection attempt" );
        SimApp.fireEvent( SimApp.events.FB_APPLICATION_INITIALIZING )
        // Begin Authorization
        var authorize_url = Facebook.getAuthorizeUrl();
        // Open Child browser and ask for permissions
        if( null == client_browser ) {
            client_browser = window.plugins.childBrowser;
        }
        client_browser.onLocationChange = function( loc ){
            Facebook.facebookLocChanged( loc, feedType, message );
        };
        client_browser.showWebPage( authorize_url );
    },

    /**
     * Handler define to check a location change event inside the childbrowser.
     * This is usefull to get information about the position in the process and then
     * determine if the user is correctly logged in or not.
     *
     * @param string loc :  url of the current page
     * @return void
     */
    facebookLocChanged : function( loc, feedType, message ){
        Simnet.Logger.debug( "ChildBrowser location change detected [url:" + loc + "]");
        // When the childBrowser window changes locations we check to see if that page is our success page.
        if( loc.indexOf( my_redirect_uri ) > -1 ) {
            Simnet.Logger.debug( "Success url detected [url:" + loc + "] - Requesting an access token");
            // extract authorisation code and build the access_token request url.
            var fbCode = loc.match( /code=(.*)$/ )[1],
                url = 'https://graph.facebook.com/oauth/access_token?client_id=' + my_client_id +
                        '&client_secret=' + my_secret +
                        '&code=' + fbCode +
                        '&redirect_uri=http://www.facebook.com/connect/login_success.html';
            Simnet.Logger.debug( "Decrypted fbCode is [" + fbCode + "]");
            Simnet.Logger.debug( "Sending the request for a token using url [" + url + "]");
            // send an access token request ...
            $.ajax({
                url: url,
                data: {},
                dataType: 'text',
                type: 'POST',
                beforeSend : function() {
                    SimApp.fireEvent( SimApp.events.AJAX_LOADING_START );
                },
                success: function(data, status){
                    Simnet.Logger.debug( "Access token successfully grabbed");
                    var token = data.split( "=" )[1];
                    Simnet.Logger.debug( "Access token will be [" + token + "]");
                    // We store our token in a localStorage Item called facebook_token
                    localStorage.setItem( facebook_token, token );
                    Simnet.Logger.debug( "Token persisted");
                    SimApp.fireEvent( SimApp.events.FB_AUTHENTICATION_SUCCESS );
                    setTimeout( function( ) {
                    	Facebook.post( feedType, message );
                    }, 3000 );
                    Simnet.Logger.debug( "Ajax call completed, authentication successfully completed");
                },
                error: function(error) {
                    Simnet.Logger.debug( "Error occurred during the access token request ...");
                    SimApp.fireEvent( SimApp.events.FB_AUTHENTICATION_FAILURE );
                },
                complete : function() {
                    SimApp.fireEvent( SimApp.events.AJAX_LOADING_COMPLETE );
                    // at this stage, the handshake has been completed
                    SimApp.fireEvent( SimApp.events.FB_HANDSHAKE_COMPLETED );
                }
            });
        } else {
            Simnet.Logger.debug( "Handshake still pending.");
        }
    },

    /**
     * XMLHttpRequest ready state change handler. May usefull for debugging.
     *
     * @param object request : the XMLHttpRequest object
     * @return void
     */
    detect_ready_state_change : function( request ) {
        Simnet.Logger.debug( "Ready state changed for the request [" + req + "]");
    },

    /**
     * Send effectively something on the user wall. All informations are stored
     * in the url. The only thing to do here is to send a request to the facebook
     * server.
     * The XMLHttpRequest returned by the method has already sent data.
     *
     * @param string url : the url to send
     * @return object - the XMLHttpRequest use to create the reqest.
     */
    share : function( url ){
        Simnet.Logger.debug( "Trying to share something [url : " + url + "]");
        // Create our request and open the connection
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            Facebook.detect_ready_state_change( req );
        }
        req.open( "POST", url, true );
        req.send(null);
        return req;
    },

    /**
     * Post a message on the facebook wall.
     *
     * @param string _fbType : type of the stream to target into facebook (feed by default)
     * @param object params : message parameters
     * @return void
     */
    post : function( _fbType, params ) {
    	Simnet.Logger.debug( "Detect a post attempt");
    	if( !localStorage.getItem( facebook_token ) ) {
    		Simnet.Logger.debug( "User is not connected, do the handshake right now");
    		Facebook.connect( _fbType, params );
    		return false;
    	}
        Simnet.Logger.debug( "User is connected, post the messsage right now");
        // Our Base URL which is composed of our request type and our localStorage facebook_token
        var url = 'https://graph.facebook.com/me/' + _fbType + '?access_token=' + localStorage.getItem( facebook_token );
        // Build our URL
        for( var key in params ){
            if( key == "message" ){
                // We will want to escape any special characters here vs encodeURI
                url = url+"&"+key+"="+escape( params[key] );
            }
            else {
                url = url+"&"+key+"="+encodeURIComponent( params[key] );
            }
        }
        Simnet.Logger.debug( "Post wil lbe send using url [" + url + "]");
        var req = Facebook.share( url );
        // Our success callback
        req.onload = Facebook.success();
    },

    /**
     * Success post message handler. This is called each time the xhr post will
     * proceed.
     * This method simply fire event indicating the post process has been completed.
     *
     * @todo : manage the case when the post is not a success
     *
     * @return void
     */
    success : function(){
        Simnet.Logger.debug( "Post success !!" );
        SimApp.fireEvent( SimApp.events.FB_POST_SUCCESS );
    }
};


