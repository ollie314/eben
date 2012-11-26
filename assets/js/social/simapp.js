/*-------------------------------------------------------------------------
 * social application function definition
 *
 * DEPENDENCIES
 *      - date.js
 *      - simnet.logger.js
 *-------------------------------------------------------------------------*/

/**
 *
 * @author Mehdi Lefebvre mlefebvre@simnetsa.ch
 * @since
 * @version 0.01
 * @compagny Simnet S.A. (http://www.simnetsa.ch)
 * @copyright Simnet S.A.
 */
var SimApp = {

    DEBUG_MODE : true,
    notificationSelector : "#notificationContainer",
    notificationContainer : null,
    initialized : false,
    cb : null, // no longer use ///

    events : {
        FB_APPLICATION_INITIALIZING 	: 'facebookappinitialization',
        FB_POST_ERROR 			: 'fbposterror',
        FB_POST_SUCCESS 		: 'fbpostsuccess',
        FB_AUTHENTICATION_FAILURE 	: 'fbauthenticationfailure',
        FB_AUTHENTICATION_SUCCESS 	: 'fbauthenticationsuccess',
        FB_USER_AUTHENTICATED 		: 'fbuserauthenticated',
        FB_USER_NOT_AUTHORIZED 		: 'fbuserappnotauthorized',
        FB_USER_NOT_CONNECTED 		: 'fbusernotconnected',
        FB_HANDSHAKE_COMPLETED          : 'fbhandshakecompleted',

        TW_APPLICATION_INITIALIZING     : 'twitterappinitialization',
        TW_POST_ERROR                   : 'twposterror',
        TW_POST_SUCCESS                 : 'twpostsuccess',
        TW_AUTHENTICATION_FAILURE       : 'twauthenticationfailure',
        TW_AUTHENTICATION_SUCCESS       : 'twauthenticationsuccess',
        TW_USER_AUTHENTICATED           : 'twuserauthenticated',
        TW_USER_NOT_AUTHORIZED          : 'twuserappnotauthorized',
        TW_USER_NOT_CONNECTED           : 'twusernotconnected',
        TW_HANDSHAKE_COMPLETED          : 'fbhandshakecompleted',

        LN_APPLICATION_INITIALIZING     : 'linkedinappinitialization',
        LN_POST_ERROR 			: 'lnposterror',
        LN_POST_SUCCESS 		: 'lnpostsuccess',
        LN_AUTHENTICATION_FAILURE 	: 'lnauthenticationfailure',
        LN_AUTHENTICATION_SUCCESS 	: 'lnauthenticationsuccess',
        LN_USER_AUTHENTICATED 		: 'lnuserauthenticated',
        LN_USER_NOT_AUTHORIZED 		: 'lnuserappnotauthorized',
        LN_USER_NOT_CONNECTED 		: 'lnusernotconnected',
        LN_HANDSHAKE_COMPLETED          : 'fbhandshakecompleted',

        AJAX_LOADING_START 		: 'ajaxloadingstart',
        AJAX_LOADING_COMPLETE 		: 'ajaxloadingcomplete',
        AJAX_LOADING_SUCCESS 		: 'ajaxloadingsuccess',
        AJAX_LOADING_ERROR 		: 'ajaxloadingerror',

        APPLICATION_ERROR               : 'applicationerror'
    },

    messages : {
        AUTHENTICATION_FAILURE_ALERT	: 'The authentication process failing down. Unable to post message on the media',
        UNAUTHORIZED_MSG                : "Application is not authorized. Please authorized it from the application settings",
        NOT_LOGGED_MSG                  : "User not connected. Please authenticate yourself on the application using facebook"
    },

    errors : {
        NETWORK_ERROR			: 0x1,
        SERVICE_ERROR			: 0x2,
        APPLICATION_ERROR               : 0x4,
        levels : {
            INFO                        : 1,
            WARN                        : 2,
            ERROR                       : 3,
            CRITICAL                    : 4,
            FATAL                       : 5
        }
    },

    postType : {
      FACEBOOK                          : 0x1,
      TWITTER                           : 0x2,
      LINKEDIN                          : 0x4
    },

    shouldPostOnFacebook : function( val ) {
        return ( val >> 0 & 1 );
    },

    shouldPostOnTwitter : function( val ) {
        return ( val >> 1 & 1 );
    },

    shouldPostOnLinkedin : function( val ) {
        return ( val >> 2 & 1 );
    },

    /**
     * Fire an event in the application.
     *
     * @param string evtType : the type of the event to fire
     * @param [optional]object params : optionnal parameters of the event to fire
     * @return void
     */
    fireEvent : function( /* string */ evtType, /* object [optional]*/ params ) {
        params = params || {};
        $( document ).trigger( evtType, params );
    },

    /**
     * Generate an application error.
     * The name of the error is determined by the application considering the level.
     * This application is not a specific kind of exception, it is a filter for
     * application error to allow developpers to create specific workflow to
     * manage errors.
     *
     * @param int level : level of the error
     * @param string message : message of the error
     * @return void
     * @throw the error.
     */
    generateError : function( level, message ) {
        var e = new Error();
        e.message = message;
        e.level = level;
        switch( level ) {
            case SimApp.errors.levels.CRITICAL :
                e.name = "SimApp critical error";
                break;
            default :
                e.name = "SimApp generic error";
        }
        throw e;
    },

    /**
     * Application initialisation function.
     *
     * @return void
     */
    init : function() {
        SimApp.notificationContainer = $( SimApp.notificationSelector ).toast();
        if(!localStorage.getItem(facebook_token)){
            Simnet.logger.debug( "Not already logged in, initialize the application ..." );
            $( "#fbAction" ).attr( "data-theme", "a" ).click( function(){
                Facebook.init();
            } );
        }
        else {
            Simnet.Logger.debug("User already logged in");
        }
        SimApp.initialized = true;
        SimApp.fireEvent( SimApp.events.APPLICATION_INITIALILIZED );
    },

    /**
     * Wrapper method to ask a plugin to load a web page externally.
     * Optionnaly, it is possible to parameterize the browser. For now, only
     * showNavBar option is available. By defaut, the navigation bar will be display,
     * by setting showNavBar option to false, the browser nav bar will be hidden.
     *
     * @param string page : url of the page to load
     * @param [optional]object : configuration options for the browser
     * @return void
     */
    showWebPage : function( page, options) {
        options = options || {};
        if( typeof window.plugins != 'undefined' &&
            typeof window.plugins.childBrowser == 'function' ) {
            SimApp.cb = window.plugins.childBrowser;
            try {
                SimApp.cb.showWebPage( page, options );
            } catch( err ) {
                $( document ).trigger( SimApp.events.APPLICATION_ERROR, { message : err } );
            }
        } else {
            $( document ).trigger( SimApp.events.APPLICATION_ERROR, { message : 'No internal browser detected, unable to display a page' } );
        }
    },

    /**
     * Obtain the remote name of the stream base on our stream id.
     *
     * @param int streamId : ID of the stream into the application
     * @return void
     * @throw ApplicationException if the streamId is not available.
     */
    getStreamTypeById : function( streamId ) {
        switch( streamId ) {
            case SimApp.postType.FACEBOOK :
                return 'feed';
            default :
                SimApp.generateError( SimApp.errors.levels.CRITICAL, "Unknown stream reference [streamId : " + streamId + "]" );
        }
    },

    /**
     * Format a message options according to facebook specifications.
     * For now, the message is simply returned as is because our specifications
     * are the same as facebook.
     *
     * @param object message : the message to format
     * @return object - the message formatted
     */
    formatMessageForFacebook : function( message ) {
        return message;
    },

    /**
     * Format a message for a stream based on the ID of the stream.
     * Since each Stream have a specific format for message, this method will
     * dispatch information provided by the client according to the stream specification.
     * If the stream ID is unknown by the application, the system will raise an exception.
     *
     * @param int streamId : the id of the stream to target
     * @param object message : the message to send
     * @return message - the message formatted for the stream
     */
    formatMessageForstream : function( streamId, message ) {
        switch( streamId ) {
            case SimApp.postType.FACEBOOK :
                return SimApp.formatMessageForFacebook( message );
            default :
                SimApp.generateError( SimApp.errors.levels.CRITICAL, "Unknown stream reference [streamId : " + streamId + "]" );
        }
    },

    /**
     * Post a message on different media.
     * It is possible to set params to the message to be more verbose on the stream
     * It is also possible to setup a stack of medias to push message onto. Actually,
     * only facebook is available but by passing a special value, it is possible
     * to target more stream.
     *
     * @example : if the message should be post on facebook and twitter, set medias value
     * to <code>SimApp.postType.FACEBOOK | SimApp.postType.TWITTER.</code>
     *
     * Options of the message correspond to :
     *  <ul>
     *      <li>picture : the picture associate the message<li>
     *      <li>caption : the caption of the picture to post with the message</li>
     *      <li>link : url of the link to associate to the picture</li>
     *      <li>name : the name of the message</li>
     *  </ul>
     *
     * Options are automatically formatted considering the medias to target.
     *
     * @param string message : the body of the message to post
     * @param [optional]object options : options of the message to post
     * @param [optional]int medias : medias to post the message onto
     * @return void
     */
    postMessage:function( message, options, medias ){
        message = message || "No message to post"; // message should be required ...
        options = options || {};
        medias = medias || SimApp.postType.FACEBOOK;
        var _fbType = 'feed'; // kind of the feed to fetch
        // When you're ready send you request off to be processed!
        Facebook.post( _fbType, options );
    },

    /**
     * Display an android like notification on the UI.
     * The content of the notification may only be a string representing the message
     * to display.
     *
     * @param string message : the message to display
     * @return boolean : always true for now.
     */
    notify : function( message ) {
        SimApp.notificationContainer.html( message )
        .toast( 'show' );
        return true;
    }
};