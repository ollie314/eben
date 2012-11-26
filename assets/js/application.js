/*-------------------------------------------------------------------------
 * Facebook function definition
 *
 * DEPENDENCIES
 *      - date.js
 *      - simnet.logger.js
 * 	- simapp.js
 * 	- facebook.js
 *-------------------------------------------------------------------------*/

/**
 * Application object definition.
 *
 * @author Mehdi Lefebvre mlefebvre@simnetsa.ch
 * @since
 * @version 0.01
 * @compagny Simnet S.A. (http://www.simnetsa.ch)
 * @copyright Simnet S.A.
 */
var app = {
    /**
     * Initialize the application according to our needs.
     *
     * @return void
     */
    init:function(){
        // First lets check to see if we have a user or not
        if( !localStorage.getItem( facebook_token ) ) {
            Simnet.logger.debug( "User not logged in to facebook" );
            SimApp.fireEvent( SimApp.events.FB_USER_NOT_CONNECTED );

            /*$( "#fbAction" ).attr( "data-theme", "a" ).click( function(){
                Facebook.init();
            } ); */
        }
        else {
            Simnet.Logger.debug("User already logged in");
            SimApp.fireEvent( SimApp.events.FB_USER_AUTHENTICATED );
        }
        SimApp.init();
    },

    /**
     * Silent function for now.
     *
     * @return void
     */
    done:function(){

    },

    /**
     * Post a message on a medias
     */
    postMessage:function( message, options ){
        options = options || {};
        message = message || "No message to post";
        var _fbType = 'feed'; // kind of the feed to fetch
        // When you're ready send you request off to be processed!
        Facebook.post( _fbType, options );
    }
},

onDeviceReady = function() {
    Simnet.Logger.activate();
    Simnet.Logger.debug( "Device is now ready, proceed to application initialisation");
    $.support.cors = true;
    app.init();
};

 // arm the main handler ...
( function( $ ) {
    document.addEventListener("deviceready", onDeviceReady, false);
} )( jQuery );


/*
// fake post  for testing purpose only ...
createPost = function(){
    Simnet.Logger.debug( "Creaing a fake post ...");
    // Define our message!
    var msg = "This is a test !!!";

    // Define the part of the Graph you want to use.
    var _fbType = 'feed';

    // This example will post to a users wall with an image, link, description, text, caption and name.
    // You can change
    var params = {};
    params['message'] = msg;
    params['name'] = 'Another day of labour ... ;)';
    params['description'] = "Retrying to do some things";
    params['_link'] = "http://www.simnetsa.ch";
    params['picture'] = "http://www.simnetsa.ch/themes/simnetsa//images/logo.png";
    params['caption'] = 'Is it Working ???';

    // When you're ready send you request off to be processed!
    Facebook.post(_fbType,params);
}
*/