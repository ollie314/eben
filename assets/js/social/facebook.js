/*
 *
 */
var my_client_id = "490104927689454", // YOUR APP ID
    my_secret = "53fb1242e82413962563b378bd6260f9", // YOUR APP SECRET
    my_redirect_uri = "http://www.facebook.com/connect/login_success.html", // LEAVE THIS
    my_type ="user_agent",
    my_display = "touch"; // LEAVE THIS

var facebook_token = "fbToken"; // OUR TOKEN KEEPER
var client_browser = null;

// FACEBOOK
var Facebook = {
    get_authorize_url : function() {
        var authorize_url = "https://graph.facebook.com/oauth/authorize?";
        authorize_url += "client_id=" + my_client_id;
        authorize_url += "&redirect_uri=" + my_redirect_uri;
        authorize_url += "&display=" + my_display;
        authorize_url += "&scope=publish_stream,offline_access"

        Simnet.Logger.debug( "Authorize url is [" + authorize_url + "]");
        return authorize_url;
    },
    init:function(){
        Simnet.Logger.debug( "Facebook initialisation detected");
        // Begin Authorization
        var authorize_url = Facebook.get_authorize_url();
        // Open Child browser and ask for permissions
        //client_browser = ChildBrowser.install();
        if( null == client_browser ) {
            client_browser = window.plugins.childBrowser;
        }
        client_browser.onLocationChange = function(loc){
            Facebook.facebookLocChanged(loc);
        };
        client_browser.showWebPage(authorize_url);
    },
    facebookLocChanged:function(loc){
        Simnet.Logger.debug( "ChildBorwser location change detected [url:" + loc + "]");
        // When the childBrowser window changes locations we check to see if that page is our success page.
        if (loc.indexOf("http://www.facebook.com/connect/login_success.html") > -1) {
            Simnet.Logger.debug( "Success url detected [url:" + loc + "] - Requesting an access token");
            var fbCode = loc.match(/code=(.*)$/)[1],
                url = 'https://graph.facebook.com/oauth/access_token?client_id=' + my_client_id +
                        '&client_secret=' + my_secret +
                        '&code=' + fbCode +
                        '&redirect_uri=http://www.facebook.com/connect/login_success.html';
            Simnet.Logger.debug( "Decrypted fbCode is [" + fbCode + "]");
            Simnet.Logger.debug( "Sending the request for a token using url [" + url + "]");
            $.ajax({
                url:url,
                data: {},
                dataType: 'text',
                type: 'POST',
                success: function(data, status){
                    Simnet.Logger.debug( "Access token successfully grabbed");
                    // We store our token in a localStorage Item called facebook_token
                    localStorage.setItem(facebook_token, data.split("=")[1]);
                    app.init();
                },
                error: function(error) {
                    Simnet.Logger.debug( "Error occurred during the access token request ...");
                },
                complete : function() {
                    window.plugins.childBrowser.close();
                }
            });
        }
    },
    detect_ready_state_change : function( request ) {
        Simnet.Logger.debug( "Ready state changed for the request [" + req + "]");
    },
    share:function(url){
        Simnet.Logger.debug( "Trying to share something [url : " + url + "]");
        // Create our request and open the connection
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            Facebook.detect_ready_state_change( req );
        }
        req.open("POST", url, true);
        req.send(null);
        return req;
    },
    post:function(_fbType,params){
        Simnet.Logger.debug( "Detect a post attempt");
        // Our Base URL which is composed of our request type and our localStorage facebook_token
        var url = 'https://graph.facebook.com/me/'+_fbType+'?access_token='+localStorage.getItem(facebook_token);
        // Build our URL
        for(var key in params){
            if(key == "message"){
                // We will want to escape any special characters here vs encodeURI
                url = url+"&"+key+"="+escape(params[key]);
            }
            else {
                url = url+"&"+key+"="+encodeURIComponent(params[key]);
            }
        }
        Simnet.Logger.debug( "Post wil lbe send using url [" + url + "]");
        var req = Facebook.share(url);
        // Our success callback
        req.onload = Facebook.success();
    },
    success:function(){
        Simnet.Logger.debug( "Post success !!");
        $("#statusTXT").show();
        $("#statusBTN").show();

        // hide our info
        $("#info").hide();

        // reset our field
        $("#statusTXT").val('');

        console.log("DONE!");

    }
};


