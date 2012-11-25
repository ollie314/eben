/*-------------------------------------------------------------------------
 * social application function definition
 *
 * DEPENDENCIES
 *-------------------------------------------------------------------------*/

/**
 * 
 * @author Mehdi Lefebvre mlefebvre@simnetsa.ch
 * @since 
 * @version 0.01
 * @compagny Simnet S.A. (www.simnetsa.ch)
 * @copyright Simnet S.A.
 */
var SimApp = {
	
	DEBUG_MODE : true,
	
	cb : null,
	
	events : {
		FB_APPLICATION_INITIALIZING 	: 'facebookappinitialization',
		FB_POST_ERROR 					: 'fbposterror',
		FB_POST_SUCCESS 				: 'fbpostsuccess',
		FB_AUTHENTICATION_FAILURE 		: 'fbauthenticationfailure',
		FB_AUTHENTICATION_SUCCESS 		: 'fbauthenticationsuccess',
		FB_USER_AUTHENTICATED 			: 'fbuserauthenticated',
		FB_USER_NOT_AUTHORIZED 			: 'fbuserappnotauthorized',
		FB_USER_NOT_CONNECTED 			: 'fbusernotconnected',
		
		TW_APPLICATION_INITIALIZING 	: 'twitterappinitialization',
		TW_POST_ERROR 					: 'twposterror',
		TW_POST_SUCCESS 				: 'twpostsuccess',
		TW_AUTHENTICATION_FAILURE 		: 'twauthenticationfailure',
		TW_AUTHENTICATION_SUCCESS 		: 'twauthenticationsuccess',
		TW_USER_AUTHENTICATED 			: 'twuserauthenticated',
		TW_USER_NOT_AUTHORIZED 			: 'twuserappnotauthorized',
		TW_USER_NOT_CONNECTED 			: 'twusernotconnected',
		
		LN_APPLICATION_INITIALIZING 	: 'linkedinappinitialization',
		LN_POST_ERROR 					: 'lnposterror',
		LN_POST_SUCCESS 				: 'lnpostsuccess',
		LN_AUTHENTICATION_FAILURE 		: 'lnauthenticationfailure',
		LN_AUTHENTICATION_SUCCESS 		: 'lnauthenticationsuccess',
		LN_USER_AUTHENTICATED 			: 'lnuserauthenticated',
		LN_USER_NOT_AUTHORIZED 			: 'lnuserappnotauthorized',
		LN_USER_NOT_CONNECTED 			: 'lnusernotconnected',
		
		AJAX_LOADING_START 				: 'ajaxloadingstart',
		AJAX_LOADING_COMPLETE 			: 'ajaxloadingcomplete',
		AJAX_LOADING_SUCCESS 			: 'ajaxloadingsuccess',
		AJAX_LOADING_ERROR 				: 'ajaxloadingerror'
	},
	
	messages : {
		AUTHENTICATION_FAILURE_ALERT	: 'The authentication process failing down. Unable to post message on the media'
	},
	
	errors : {
		NETWORK_ERROR					: 0x1,
		SERVICE_ERROR					: 0x2
	},
	notificationSelector : "#notificationContainer",
	notificationContainer : null,
	initialized : false,
	
	/**
	 * Application initialisation function.
	 * 
	 * @return void
	 */
	init : function() {
		SimApp.notificationContainer = $( SimApp.notificationSelector ).toast();
		SimApp.initialized = true;
	},
	
	showWebPage : function( page, options) {
		options = options || {};
		if( typeof window.plugins != 'undefined' && 
				typeof window.plugins.childBrowser == 'function' ) {
			SimApp.cb = window.plugins.childBrowser;
		}
		SimApp.cb.showWebPage( page, options );
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

/*******************************************************************************************/
/*********************************** CORE OF THE UNIT **************************************/
/*******************************************************************************************/

// arm notification process.
$( document ).bind( 'pageinit', function( evt ) {
	SimApp.init();
} );