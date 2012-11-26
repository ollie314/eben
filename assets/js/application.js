/**
 *
 */
// APP
var app = {
    bodyLoad:function(){
        document.addEventListener("deviceready", app.deviceReady, false);
    },
    deviceReady:function(){
        app.init();
    },
    init:function(){
        // First lets check to see if we have a user or not
        if(!localStorage.getItem(facebook_token)){
            $("#fbAction").attr('data-theme', 'b');
            $("#status").hide();

            $("#fbAction").click(function(){
                Facebook.init();
            });
        }
        else {
            Simnet.Logger.debug("showing loged in");
            $("#loginArea").hide();
            $("#status").show();
            $("#statusBTN").click(function(){
                createPost();
            });
        }
    },
    done:function(){

    },
    createPost:function(){


        // Define our message!
        var msg = $("#statusTXT").val();

        // Define the part of the Graph you want to use.
        var _fbType = 'feed';

        // This example will post to a users wall with an image, link, description, text, caption and name.
        // You can change
        var params = {};
        params['message'] = msg;
        params['name'] = 'A Facebook App for Phonegap';
        params['description'] = "I just made a Facebook app with Phonegap using this sweet tutorial from Drew Dahlman";
        params['_link'] = "http://www.drewdahlman.com";
        params['picture'] = "http://compixels.com/wp-content/uploads/2011/04/Facebook-Logo.jpg";
        params['caption'] = 'Hello World';

        // When you're ready send you request off to be processed!
        Facebook.post(_fbType,params);
    }
},
createPost = function(){


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
},
onDeviceReady = function() {
    Simnet.Logger.activate();
    $.support.cors = true;
    $.mobile.showPageLoadingMsg();
    $( '#notificationContainer' ).toast();

    //SimFacebook.init();

    $( "#loginButton" ).click( function( mouseEvent ) {
        // test simapp & social functions
        SimFacebook.postMessage( "This is a simple test" );
        return false;
    } );

    $( "#fbAction" ).click( function( mouseEvent ) {
        SimFacebook.postMessage( "This is a simple test from the application ..." );
        return false;
    } );
};

( function( $ ) {
    document.addEventListener("deviceready", onDeviceReady, false);
} )( jQuery );

if( false ) {
    window.fbAsyncInit = function() {
        // param to initialize the fb api
        FB.init( {
            appId      : SimFacebook.API_ID,
            channelUrl : SimFacebook.CHAN_URL,
            status     : true,
            cookie     : true,
            xfbml      : false
        } );

        SimFacebook.fetchLoginStatus();
        $( document ).trigger( SimApp.events.FB_APPLICATION_INITIALIZING );

    }; /* fbAsyncInit */

    // load the facebook api and run it.
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
    }( document, true ) );
}