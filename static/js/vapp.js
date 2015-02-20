vapp = new function(){
    var vapp = this,
        defaultFeeds = { 'mine' : { title: 'Моё видео', tabSource: 'mine' }}
        defaultFeed = 'mine';

    /**
     * initialize for vapp application
     * @param opts
     * opts.appId {Int} - app id of vk application
     */
    vapp.init = function(opts){
        opts = opts || {};

        vapp.currentFeed = opts.currentFeed || defaultFeed;
        vapp.feeds = opts.feeds || defaultFeeds;
        vapp.apiId = opts.apiId || apiId;

        vapp.nodes = {
            'body' : $('body'),
            'window' : $(window),
            'heap' : $('#node-heap'),
            'page' : $('#vapp-page'),
            'navigation' : $('#vapp-header_nav')
        }

        vapp.renderer.welcome();

        if( !vapp.videoSupported() ) {
            vapp.renderer.videoNotSupported();

            return false;
        }

        vapp.initBinds();
        vapp.feed.reset();
        vapp.vk.init(vapp.vk.check);
    };

    vapp.videoSupported = function(){
        var testEl = document.createElement( "video" ),
            support = false;

        try {
            if ( support = !!testEl.canPlayType ) {
                support = new Boolean(support);
                support.ogg = testEl.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,'');
                support.h264 = testEl.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,'');
                support.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
                support.vp9 = testEl.canPlayType('video/webm; codecs="vp9"').replace(/^no$/,'');
                support.hls = testEl.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/,'');
            }
        } catch(e){}

        return support;
    };

    function _onResize(){
        vapp.windowHeight = vapp.nodes.window.height();
        vapp.windowWidth = vapp.nodes.window.width();
    }

    function _onMove(event){
        if(typeof event == 'undefined' ) return;

        vapp.mouseX = event.pageX;
        vapp.mouseY = event.pageY;

    }

    vapp.initBinds = function(){
        _onResize();

        vapp.nodes.body.bind('resize', _onResize);
        vapp.nodes.body.bind('mousemove', function(event){
            _onMove(event);
        });
    }
}

vapp.vk = new function(){
    var vk = this;

    vk.init = function(callback){
        VK.init({ apiId: vapp.apiId });

        vk.inited = true;

        if ( callback ) callback();
    };

    vk.check = function(){
        if ( !vk.inited ) { vk.init( vk.check ) }

        VK.Auth.getLoginStatus(function( r ){
            if ( r.session ){
                vapp.session = r.session;

                VK.Api.call('account.getAppPermissions', { user_id: vapp.session.mid }, function(r){
                    if ( r.response == 22 ) {
                        vapp.renderer.tabs();
                        vapp.feed.load();
                    } else {
                        vapp.renderer.noRights();
                    }
                })
            } else {
                vapp.renderer.notLoggined();
            }
        })
    };

    vk.login = function(){
        if ( !vk.inited ) { vk.init( vk.login ) }

        VK.Auth.login(function( r ){
            if ( r.session ){
                vapp.session = r.session;
                vapp.renderer.tabs();
                vapp.feed.load();
            } else {
                vapp.renderer.notLoggined();
            }
        }, 22);
    };
};

vapp.feed = new function(){
    var feed = this;

    feed.load = function(){
        if ( !vapp.vk.inited ) { vapp.vk.init( vapp.feed.load ) }

        feed.load[vapp.currentFeed]();
    };

    feed.load.mine = function(){
        VK.Api.call('video.get', { owner_id: vapp.session.mid }, function(r){
            if ( r.error ){
               if ( r.error.error_code == 15 ){
                   vapp.renderer.error(r.error.error_msg);
               }
            } else {
                vapp.renderer.videos(r.response);
            }
        })
    };

    feed.load.friends = function(){
        if ( feed.friendId ){
            VK.Api.call('video.get', { owner_id: feed.friendId }, function(r){
                if ( r.error ){
                    if ( r.error.error_code == 15 ){
                        vapp.renderer.error(r.error.error_msg);
                    }
                } else {
                    vapp.renderer.videos(r.response);
                }
            })
        } else {
            VK.Api.call('friends.get', { fields: 'name,photo_100' }, function(r){
                vapp.renderer.friends(r.response);
            })
        }
    };

    feed.load.search = function(){
        console.log('search');
    };

    feed.change = function(feedSource, event){
        if ( typeof feedSource != 'string') return false;
        if ( !vapp.feeds[feedSource] ) return false;

        if ( feedSource != 'friends' ) feed.friendId = null;

        feed.setCurrent(feedSource);
        feed.load();

        cancelEvent(event);
    };

    feed.setCurrent = function(feedSource){
        vapp.currentFeed = feedSource;

        $('.vapp-header_link').removeClass('active');
        $('#vapp-header_link_' + feedSource).addClass('active');

        return vapp.currentFeed;
    };

    feed.reset = function(){
        vapp.vids = [];
        vapp.vidsIdsLoaded = [];
        vapp.feedOffset = 0;
        vapp.feedLimit = 50;
    };
};

vapp.locks = {};
vapp.lock = {
    checkLock: function(type){
        return vapp.locks.hasOwnProperty(type) ? !!vapp.locks[type] : false;
    },
    setLock: function(type, value){
        vapp.locks[type] = !!value;
        return vapp.locks[type];
    }
};

vapp.renderer = new function(){
    var renderer = this;

    renderer.welcome = function(){
        vapp.nodes.page.html(vapp.getTpl('vapp-welcome-page'));
    };

    renderer.tabs = function(){
        var html = '';

        for ( var i in vapp.feeds ) {
            html += vapp.getTpl('vapp-navigation-item').supplant(
                $.extend( {class: i == vapp.currentFeed ? 'active' : '' }, vapp.feeds[i] )
            );
        }

        vapp.nodes.navigation.html(html);
    };

    renderer.error = function(errorMSG){
        vapp.nodes.page.html(errorMSG);
    };

    renderer.videos = function(videos){
        var html = '';

        for ( var i in videos ){
            console.log(videos[i]);

            if ( typeof videos[i] == 'object' ) {
                html += vapp.getTpl('vapp-video-item').supplant(videos[i]);
            }
        }

        vapp.nodes.page.html(html);
    };

    renderer.friends = function(friends){
        var html = '';

        for ( var i in friends ){
            html += vapp.getTpl('vapp-friend-item').supplant(friends[i]);
        }

        vapp.nodes.page.html(html);
    };

    renderer.notLoggined = function(){
        vapp.nodes.page.html(vapp.getTpl('vapp-not-logined-page'));
    };

    renderer.noRights = function(){
        vapp.nodes.page.html(vapp.getTpl('vapp-not-rights-page'));
    };

    renderer.videoNotSupported = function(){
        vapp.nodes.page.html(vapp.getTpl('vapp-not-supported-page'));
    };
};

vapp.Player = function(){};

vapp.Player.prototype = new function(){
    var plProto = this;

    plProto.pause = function(){

    };

    plProto.play = function(){

    };

    plProto.mute = function(){

    };

    plProto.setVolume = function(){

    };

    plProto.end = function(){

    };
};

function indexOf(arr, value, from) { for (var i = from || 0, l = (arr || []).length; i < l; i++) { if (arr[i] == value) return i; } return -1; };
function inArray(value, arr) { return indexOf(arr, value) != -1; };
function ge(el) { return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el; };
function sp(e){ e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true; }
function pd(e){ e.preventDefault ? e.preventDefault() : e.returnValue = false; }
function cancelEvent(e) {
    e = e || window.event || {};
    e = e.originalEvent || e;
    sp(e);
    pd(e);
}
function objLength(obj) {
    if (typeof obj != 'object') return 0;

    var length = 0;

    for(var key in obj) if ( obj.hasOwnProperty(key) ) { length += 1; }

    return length;
};
function getByField(arr, field, val) {
    if (!arr || !field || !val) return false;

    for(var key in arr) if ( arr.hasOwnProperty(key) ) {
        if(arr[key][field] == val) return arr[key];
    }

    return false;
};

// templating
String.prototype.supplant = function(o) {
    return this.replace(/{([^{}]*)}/g, function(a, b) {
            var r = o[b];
            return (typeof r === 'string' || typeof r === 'number' ? r : a);
        }
    );
};
// templates cache
vapp.tplsCache = {};
/**
 * search tpl in dom
 * @param {String} id - id of tpl���
 * @param {Bool} ignoreCache ��� ���������� ������ ��� ����� ������ ������
 * @returns {String}
 */
vapp.getTpl = function(id, ignoreCache) {
    id = id + '' || '';

    var in_cache = !ignoreCache ? vapp.tplsCache.hasOwnProperty(id) : false;

    if ( in_cache ){
        return vapp.tplsCache[id];
    } else {
        var res_ge = ge(id);

        if(!res_ge){
            return '';
        } else {
            vapp.tplsCache[id] = res_ge.innerHTML;
            return vapp.tplsCache[id];
        }
    }
};