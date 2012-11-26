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
var Application = {

    /**
     * Initialize the application according to our needs.
     *
     * @return void
     */
    init:function(){
        SimApp.init();
        Facebook.init();
        SimApp.fireEvent( SimApp.events.APPLICATION_INITIALILIZED );
    },

    /**
     * Silent function for now.
     *
     * @return void
     */
    done:function(){

    },

    /**
     * Post a message on Facebook
     * 
     * @param string message : the body of the message
     * @param object options : Options of the message
     * @return void
     */
    postFacebookMessage:function( message, options ) {
        SimApp.postMessage( message, option, SimApp.postType.FACEBOOK );
    },
    
    /**
     * Post a message on twitter
     * 
     * @param string message : the body of the message
     * @param object options : Options of the message
     * @return void
     */
    postTwitterMessage : function( message, options ) {
    	SimApp.postMessage( message, options, SimApp.postType.TWITTER );
    },
    
    /**
     * Post a message on linkedin
     * 
     * @param string message : the body of the message
     * @param object options : Options of the message
     * @return void
     */
    postLinkedinMessage : function( message, options ) {
    	SimApp.postMessage( message, options, SimApp.postType.LINKEDIN );
    }
},

onDeviceReady = function() {
    Simnet.Logger.activate();
    Simnet.Logger.debug( "Device is now ready, proceed to application initialisation");
    $.support.cors = true;
    Application.init();
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