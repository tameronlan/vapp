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

        vapp.currentFeed = vapp.currentFeed || opts.currentFeed || defaultFeed;
        vapp.feeds = vapp.feeds || opts.feeds || defaultFeeds;
        vapp.apiId = vapp.apiId || opts.apiId || apiId;

        vapp.nodes = {
            'body' : $('body'),
            'window' : $(window),
            'heap' : $('#node-heap'),
            'wrapper' : $('#vapp-wrapper'),
            'pageTop' : $('#vapp-page_top'),
            'page' : $('#vapp-page'),
            'navigation' : $('#vapp-header_nav'),
            'headerUser' : $('#vapp-header_user'),
            'scroller_aim' : $('#vapp-scrolller_aim')
        };

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
};

vapp.vk = new function(){
    var vk = this,
        biteMask = 16; // friends, videos

    vk.init = function(callback){
        if ( !vk.inited ) {
            VK.init({ apiId: vapp.apiId });

            vk.inited = true;
        }

        if ( callback ) callback();
    };

    vk.check = function(){
        if ( !vk.inited ) { vk.init( vk.check ) }

        VK.Auth.getLoginStatus(function( r ){
            if ( r.session ){
                vapp.session = r.session;

                VK.Api.call('account.getAppPermissions', { user_id: vapp.session.mid }, function(r){
                    if ( r.response == biteMask ) {
                        vapp.renderer.tabs();
                        vapp.feed.load();
                        vk.loadUser();
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
                vk.loadUser();
            } else {
                vapp.renderer.notLoggined();
            }
        }, biteMask);
    };

    vk.logout = function(){
        if ( !vk.inited ) { vk.init( vk.logout ) }

        VK.Auth.logout(function( r ){
            if ( r ){
                vapp.nodes.navigation.html('');
                vapp.nodes.headerUser.html('');
                vapp.init({});
            }
        });
    };

    vk.loadUser = function(){
        if ( !vk.inited ) { vk.init( vk.loadUser ) }

        VK.Api.call('users.get', { fields: 'photo_50, photo_100'}, function( r ){
            if ( r.response ){
                vapp.renderer.headerUser(r.response[0]);
            }
        }, 22);
    };

    // получение видео от вк
    vk.getVideos = function(feedSource){
        if ( vapp.lock.checkLock('feed') ) return;

        var uid = feedSource == 'mine' ? vapp.session.mid : vapp.feed.friendId;

        vapp.lock.setLock('feed', true);

        vapp.nodes.scroller_aim.show();

        if ( feedSource == 'friends' && vapp.feed.offset == 0 ) {
            vapp.renderer.friendTop(uid);
        }

        VK.Api.call('video.get', { offset: vapp.feed.offset, count: +vapp.feed.limit, owner_id: uid }, function(r){
            vapp.nodes.scroller_aim.hide();

            if ( r.error ){
                vapp.renderer.error(r.error.error_msg);
            } else {
                if ( vapp.currentFeed != feedSource ) return;

                vapp.lock.setLock('feed', false);

                var _counter = vapp.renderer.videos(r.response);

                if ( !_counter && vapp.feed.scroller ) vapp.feed.scroller.destroy();
                if ( !_counter && !vapp.feed.offset ) vapp.renderer.emptyVideos();

                vapp.feed.offset = vapp.feed.offset + vapp.feed.limit;
            }
        })
    };

    // получение друзей из вк
    vk.getFriends = function(feedSource){
        if ( vapp.lock.checkLock('feed') ) return;

        vapp.lock.setLock('feed', true);

        vapp.nodes.scroller_aim.show();

        VK.Api.call('friends.get', { offset: vapp.feed.offset, count: +vapp.feed.limit, fields: 'photo_100,photo_50' }, function(r){
            vapp.nodes.scroller_aim.hide();

            if ( r.error ){
                vapp.renderer.error(r.error.error_msg);
            } else {
                if ( vapp.currentFeed != 'friends' ) return;

                vapp.lock.setLock('feed', false);

                var _counter = vapp.renderer.friends(r.response);

                if ( !_counter && vapp.feed.scroller ) vapp.feed.scroller.destroy();
                if ( !_counter && !vapp.feed.offset ) vapp.renderer.emptyFriends();

                vapp.feed.offset = vapp.feed.offset + vapp.feed.limit;
            }
        })
    };
};

vapp.feed = new function(){
    var feed = this;

    feed.limit = 50;

    // смена фида в приложении
    feed.change = function(feedSource, event){
        if ( typeof feedSource != 'string') return false;
        if ( !vapp.feeds[feedSource] ) return false;
        if ( feedSource != 'friends' ) feed.friendId = null;

        feed.setCurrent(feedSource);

        feed.load();

        cancelEvent(event);
    };

    // установка выбранной вкладки
    feed.setCurrent = function(feedSource){
        vapp.currentFeed = feedSource;

        $('.vapp-header_link').removeClass('active');
        $('#vapp-header_link_' + feedSource).addClass('active');
    };

    // загрузка фида видео, друзей или видео друга
    feed.load = function(){
        if ( !vapp.vk.inited ) { vapp.vk.init( vapp.feed.load ) }

        feed.reset();

        feed.load[vapp.currentFeed]();

        feed.scroller = new Scroller({
            scrollTo: '#vapp-scrolller_aim',
            onScroll: feed.load[vapp.currentFeed]
        })
    };

    // загрузка фида моего видео
    feed.load.mine = function(){
        vapp.vk.getVideos('mine');
    };

    // загрузка фида друзей
    feed.load.friends = function(){
        if ( feed.friendId ){
            vapp.vk.getVideos('friends');
        } else {
            vapp.vk.getFriends('friends');
        }
    };

    feed.load.search = function(){
        console.log('search');
    };

    feed.choiceFriend = function(id, ev){
        feed.friendId = id;

        feed.change('friends', ev);
    };

    feed.reset = function(){
        feed.cacheVids = [];
        feed.cacheVideo = {};
        feed.cacheFriends = {};
        feed.offset = 0;

        vapp.nodes.page.html('');
        vapp.nodes.pageTop.html('');

        if ( feed.scroller ) feed.scroller.destroy();
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

    renderer.emptyVideos = function(){
        vapp.nodes.page.html('<div class="vapp-page_title">Список видео пуст</div>');
    };

    renderer.emptyFriends = function(){
        vapp.nodes.page.html('<div class="vapp-page_title">Список друзей пуст</div>');
    };

    renderer.videos = function(videos){
        var html = '', _counter = 0;

        for ( var i in videos ){
            if ( typeof videos[i] == 'object' ) {
                _counter ++;

                vapp.feed.cacheVids.push(videos[i].vid);
                vapp.feed.cacheVideo[videos[i].vid] = videos[i];

                html += vapp.getTpl('vapp-video-item').supplant($.extend(true, videos[i], {duration_small : timeSmall(videos[i].duration)}));
            }
        }

        vapp.nodes.page.append(html);

        return _counter;
    };

    renderer.friends = function(friends){
        var html = '', _counter = 0;

        for ( var i in friends ){
            _counter ++;

            vapp.feed.cacheFriends[friends[i].uid] = friends[i];

            html += vapp.getTpl('vapp-friend-item').supplant(friends[i]);
        }

        vapp.nodes.page.append(html);

        return _counter;
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

    renderer.headerUser = function(user){
        vapp.nodes.headerUser.html(vapp.getTpl('vapp-user-box').supplant(user));
    };

    renderer.friendTop = function(uid){
        if ( !vapp.feed.cacheFriends[uid] ) return;

        vapp.nodes.pageTop.html(vapp.getTpl('vapp-friend-top').supplant(vapp.feed.cacheFriends[uid]));
    };

    renderer.videoAfter = function(vid){
        var index = indexOf(vapp.feed.cacheVids, vid);

        if ( index < 0 ) return false;

        var width = 240,
            boxWidth = vapp.player.popup.$box.width(),
            boxHeight = vapp.player.popup.$box.height(),
            countCols = Math.floor(boxWidth / width),
            widthCalculate = boxWidth / countCols,
            heightCalculate = widthCalculate * 0.75,
            countRows = Math.floor(boxHeight / heightCalculate) + 1,
            count = countCols * countRows,
            html = '',
            displayHolder = false;

        for(var i = 0; i < count; i++){
            var currentIndex = index + i > vapp.feed.cacheVids.length - 1 ? 0 : index + i,
                currentVideo = vapp.feed.cacheVids[currentIndex],
                params = $.extend(true, {height: heightCalculate, width: widthCalculate}, vapp.feed.cacheVideo[currentVideo]);

            html += vapp.getTpl('vapp-video-after').supplant(params);

            displayHolder = true
        }

        vapp.player.controls.videosHolder.html(html);

        return displayHolder;
    };
};

vapp.player = new function(){
    var player = this;

    player.video = null;

    player.open = function(vid){
        var currentVideo = vapp.feed.cacheVideo[vid];

        if(vapp.player.popup) vapp.player.popup.close();

        popup.open('<div class="ta-c"><div style="margin: 0 0 20px;">Загрузка видео</div><img src="/static/i/loader.gif"/></div>', {
            width: 9999,
            myClass: 'video-popup',
            onOpen: function(context){
                player.init(context, currentVideo);
            },
            onClose: function(){
                player.clear();
            }
        });
    };

    player.init = function(popupContext, currentVideo){
        var html = "";

        player.videoPlaying = currentVideo;
        player.popup = popupContext;

        var src;

        for(var i in currentVideo.files){
            src = currentVideo.files[i];
        }

        if(currentVideo.files.external || ( new RegExp('flv')).test(src) ){
            var isRutube = (new RegExp('rutube', 'gi')).test(currentVideo.player);

            popupContext.$content.html( '<iframe id="video-player" src="' + currentVideo.player + '" width="' + ( isRutube ? popupContext.$box.width() - 50 : popupContext.$box.width() ) + '" height="' + popupContext.$box.height() + '" type="text/html" frameborder="0" allowfullscreen="" mozallowfullscreen="" webkitallowfullscreen="" scrolling="no" preventhide="1"></iframe>' );

            player.video = ge('vapp-video');
        } else {
            var params = {
                class_fullscreen: vapp.fullscreen.supported() ? '' : 'h',
                class_volume: '',
                duration: timeSmall(currentVideo.duration),
                poster: currentVideo.image_medium,
                src: src,
                width: popupContext.$content.width(),
                height: popupContext.$content.height()
            };

            popupContext.$content.html(vapp.getTpl('vapp-video-player').supplant(params));

            player.viewed = false;
            player.viewedSeconds = 5;
            player.video = ge('vapp-video');

            player.initControls(popupContext);
            player.initBinds(popupContext);
        }
    };

    player.initControls = function(){
        player.controls = {
            player:             $('.vapp-player'),
            playOverlay:        $('.vapp-player_overlay'),
            playControls:       $('.vapp-player_control_play'),
            playControlGo:      $('.vapp-player_control_icn.icon-play'),
            playControlPause:   $('.vapp-player_control_icn.icon-pause'),
            playControlReload:  $('.vapp-player_control_icn.icon-cw'),
            bufferLine:         $('.vapp-player_timing_buffered'),
            progress:           $('.vapp-player_timing_line'),
            progressLine:       $('.vapp-player_timing_progress'),
            progressTtip:       $('.vapp-player_timing_ttip'),
            duration:           $('.vapp-player_timing_duration'),
            volumeIcnOn:        $('.vapp-player_volume_icn.icon-volume'),
            volumeIcnOff:       $('.vapp-player_volume_icn.icon-volume-off'),
            volumeInner:        $('.vapp-player_volume_inner'),
            fullScreener:       $('.vapp-player_fullscreener'),
            videosHolder:       $('.vapp-player_videos')
        };
    };

    player.initBinds = function(popupContext){
        eventBus.emit('boredChanged', function(){
            player.controls.playControls.addClass('hide')
        });

        $(window).bind('resize.video_player', function(){
            if ( !player.video ) return;

            player.video.width = popupContext.$box.width();
            player.video.height = popupContext.$box.height();
        });

        $(player.video).click(function(){
            player.pause();
        });

        player.controls.progress.click(function(e) {
            if(!player.video.currentTime) return;

            var x = (e.pageX - this.offsetLeft)/$(this).width();

            player.video.currentTime = x * player.video.duration;
        });

        player.video.addEventListener("play", function() {
            if ( !player.video ) return;

            player.controls.videosHolder.html('').hide();
            player.controls.playOverlay.hide();
            player.controls.playControls.attr('class', 'unselectable vapp-player_control_play played');
        });

        player.video.addEventListener("pause", function() {
            if ( !player.video ) return;

            player.controls.playOverlay.show();
            player.controls.playControls.attr('class', 'unselectable vapp-player_control_play paused');

        });

        player.video.addEventListener("ended", function() {
            if ( !player.video ) return;

            player.controls.playOverlay.hide();
            player.controls.playControls.attr('class', 'unselectable vapp-player_control_play ended');

            var displayholder = vapp.renderer.videoAfter(player.videoPlaying.vid);

            if(displayholder) player.controls.videosHolder.show();
        });

        player.video.addEventListener("timeupdate", function() {
            if ( !player.video ) return;

            var currentTime = player.video.currentTime;

            player.controls.progressTtip.text( timeSmall( currentTime ));

            var progress = currentTime / player.video.duration;

            player.controls.progressLine[0].style.width = Math.floor(progress * 100) + "%";

            if ( !player.viewed ) {
                var summaryTime = 0;

                for (var i = 0; i < player.video.played.length; i++) { summaryTime += (player.video.played.end(i) - player.video.played.start(i)); }

                if ( summaryTime >= player.viewedSeconds ){
                    player.viewed = true;

                    console.log('Просмотрено ' + player.viewedSeconds + ' ' + plural(player.viewedSeconds, ['секунда', 'секунды', 'секунд']))
                }
            }

        }, false);
    };

    player.clear = function(){
        $(window).unbind('resize.video_player');

        player.videoPlaying = null;
        player.video = null;
        player.popup = null;
        player.isExternal = true;
    };

    player.pause = function(){
        if ( player.video ) player.video.pause();
    };

    player.play = function(){
        if ( player.video ) player.video.play();
    };

    player.playClick = function(el){
        el = $(el);

        if ( el.hasClass('paused') || el.hasClass('ended') ){
            player.play();
        } else {
            player.pause();
        }
    };

    player.volumeClick = function(el){
        el = $(el);

        el.toggleClass('muted');

        player.video.muted = !player.video.muted;
    };

    player.fullsceenClick = function(el){
        el = $(el);

        if ( !el.hasClass('opened') ) {
            vapp.fullscreen.open(player.controls.player[0]);
        } else {
            vapp.fullscreen.cancel();
        }

        el.toggleClass('opened');
    }
};

/**
 * Event Machine
 * 22.03.2013
 *
 * new Eventer();
 */

var eventer = function (opts) {
    $.extend(this, {
        eventPrefix: '__em_'
    }, opts);
};

(function (proto) {

    proto.on = function (type, fn) {
        var self = this;
        $(this).on(self.eventPrefix + type, function (e, data) {
            fn.call(self, { type: e.type }, data);
        });
        return this;
    };

    proto.emit = function (type, data) {
        $(this).triggerHandler(this.eventPrefix + type, data);
        return this;
    };

    proto.off = function (type) {
        $(this).off(this.eventPrefix + type);
        return this;
    };

})(eventer.prototype);

var eventBus = new eventer(); //additional for subscribe and emit global events

/**
 * менеджер пользовательского афк
 */
vapp.boredManager = new function(){
    var bManager = this;

    bManager.st = null;
    bManager.state = 'active';
    bManager.time = 3000;

    bManager.activate = function(){
        if(bManager.st) clearTimeout(bManager.st);

        if(bManager.state != 'active'){
            bManager.state = 'active';
            eventBus.emit('boredChanged');
        }

        bManager.st = setTimeout(function(){
            bManager.unactive();
        }, bManager.time);
    };

    bManager.unactive = function(){
        if ( bManager.state != 'unactive'){
            bManager.state = 'unactive';
            eventBus.emit('boredChanged');
        }
    };

    bManager.init = function(){
        bManager.activate();

        $(window).bind('click.boredManager', function(){
            bManager.activate();
        });

        $(window).bind('mousemove.boredManager', function(){
            bManager.activate();
        });

        $(window).bind('focus.boredManager', function(){
            bManager.activate();
        });

        $(window).bind('keydown.boredManager', function(){
            bManager.activate();
        });

        $(window).bind('scroll.boredManager', function(){ bManager.activate(); });

        console.log($(window), $('body'));
    };

    bManager.init();
};

/* popup */
var popup = function () {};

(function (pop, _proto) {
    pop.stack = [];

    $.extend(pop, new eventer());

    pop.props = {
        width: 400,
        showTop: true,
        onlyContent: true
    };

    pop.on('close', function (event, data) {
        if (pop.stack.length == 0) {
            vapp.nodes.wrapper.removeClass('fixed');

            $(window).scrollTop( -vapp.nodes.wrapper.css('top').replace('px', '') );

            vapp.nodes.wrapper.css('top', 0);
        } else {
            pop.enableFirst();
        }
    });

    pop.on('open', function (event, data) {
        vapp.nodes.wrapper.css('top', -$(window).scrollTop()).addClass('fixed');

        if ( pop.stack.length ){
            pop.enableFirst();
        }
    });

    pop.enableFirst = function(){
        var _stackLength = pop.stack.length;

        for(var i in pop.stack){
            pop.stack[i].$box[(i == _stackLength - 1 ? 'remove' : 'add' ) + 'Class']('invisible');
        }
    }

    pop.open = function (html, opts) {
        var _ex = new pop(opts);

        _ex.html = html;
        _ex.index = pop.stack.length;
        pop.stack.push(_ex);
        _ex.props = $.extend({}, pop.props, opts);

        _ex.open();
        pop.emit('open');
        return _ex;
    };

    pop.close = function (index) {
        if (typeof(index) === 'undefined') index = pop.stack.length - 1;
        if (pop.stack[index]) pop.stack[index].close();
    };

    pop.closeAll = function () {
        for (var i in pop.stack) {
            pop.stack[i].$wrapper.remove()
        }
        pop.stack = [];
    };

    _proto.open = function () {
        var context = this;

        context.render();
        context.$header.html(context.props.title);
        context.$content.html(context.html);
        context.$box.css({
            'maxWidth': context.props.width
        });
        context.align();

        if (context.props.myClass) context.$box.addClass(context.props.myClass);
        if (context.props.onOpen) context.props.onOpen(context);

    };

    _proto.align = function () {
        var context = this;

        context.$box.css({'margin-top': (context.$wrapper.height() - context.$box.height()) / 2 })
            .addClass('opened');
    };

    _proto.close = function () {
        var context = this;
        context.$box.css({'marginTop': 0}).addClass('closed');

        context.$wrapper.remove();
        pop.stack.splice(context.index, 1);

        for (var i in pop.stack) {
            pop.stack[i].index = i;
        }

        pop.emit('close');

        if (context.props.onClose) context.props.onClose(context);
    };

    _proto.render = function () {
        var context = this;

        context.$wrapper = $('<div>', {'id': 'popup-wrap-' + context.index, 'class': 'popup-wrap'}).click(function () {
            popup.close();
        });
        context.$box = $('<div>', {'class': 'popup-box'}).appendTo(context.$wrapper).click(function (event) {
            event.stopPropagation();
        });
        context.$header = $('<div>', {'class': 'popup-header'}).appendTo(context.$box);
        context.$closer = $('<div>', {'class': 'popup-close'}).appendTo(context.$box).click(function(){
            popup.close();
        }).append('<i class="icon-cancel"></i>');
        context.$content = $('<div>', {'class': 'popup-content'}).appendTo(context.$box);

        context.$wrapper.css({'z-index': 1000 + context.index});

        vapp.nodes.heap.append(context.$wrapper);
    };
}(popup, popup.prototype));

vapp.fullscreen = new function(){
    var fs = this;

    fs.open = function(el){
        if (!el) el = document.body;

        if ( !!el.mozRequestFullScreen ){
            el.mozRequestFullScreen();
        } else if(!!el.webkitRequestFullscreen){
            el.webkitRequestFullscreen();
        } else if(!!el.requestFullscreen){
            el.requestFullscreen();
        }
    };

    fs.cancel = function(){
        if ( !!document.mozCancelFullScreen ){
            document.mozCancelFullScreen();
        } else if(!!document.webkitCancelFullScreen){
            document.webkitCancelFullScreen();
        } else if(!!document.cancelFullScreen){
            document.cancelFullScreen();
        }
    };

    fs.supported = function(){
        return !!document.body.mozRequestFullScreen || !!document.body.webkitRequestFullscreen || !!document.body.requestFullscreen;
    };

};

function plural(n,f){n%=100;if(n>10&&n<20)return f[2];n%=10;return f[n>1&&n<5?1:n==1?0:2]}
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

/**
 *
 * @param sec
 * @returns {*}
 */
function timeSmall(sec){
    if (sec > 3599) {
        hours = Math.floor(sec / 3600);
        sec = sec - (3600 * hours);
        mins = Math.floor(sec / 60);
        secs = Math.floor(sec - (mins * 60));
        if (secs < 10) secs = '0'+secs;
        if (mins < 10) mins = '0'+mins;
        return  (hours < 10 ? '0' + hours : hours ) + ':' +mins+':'+secs;
    } else {
        mins = Math.floor(sec / 60);
        secs = Math.floor(sec - (mins * 60));
        if (secs < 10) secs = '0'+secs;
        if (mins < 10) mins = '0'+mins;
        return mins+':'+secs;
    }
}

/**
 * Calculate length of object
 * @param obj
 * @returns {number}
 */
function objLength(obj) {
    if (typeof obj != 'object') return 0;

    var length = 0;

    for(var key in obj) if ( obj.hasOwnProperty(key) ) { length += 1; }

    return length;
};

/**
 * get field by fieldname in object
 * @param arr
 * @param field
 * @param val
 * @returns {*}
 */
function getByField(arr, field, val) {
    if (!arr || !field || !val) return false;

    for(var key in arr) if ( arr.hasOwnProperty(key) ) {
        if(arr[key][field] == val) return arr[key];
    }

    return false;
};

// scroller for laizy load
function Scroller(params){
    var onScroll = {},
        scrollTo = {},
        offset = 200,
        me = {};

    var init = function(params, scope){
        me = scope;
        me.uuid = ++Scroller.uuid;

        if(params.selector){
            me.elem = $(params.selector);
            me.scrollTop = function(){ return me.elem.scrollTop(); };
            me.height = function(){ return me.elem.height(); };
        } else {
            me.elem = $(window);
            me.scrollTop = function(){ return $(window).scrollTop(); };
            me.height = function() { return vapp.windowHeight; };
        }

        if(params.offset)
            offset = params.offset;

        if(params.scrollTo){
            scrollTo = $(params.scrollTo);

            if ( !scrollTo.length ) {
                console.log('mistake in selector for aim scroller');
                return;
            }

            scrollTo.myScroll = function(){ return scrollTo.offset().top };
        } else {
            if(params.selector)
                scrollTo.myScroll = function(){ return me.elem[0].scrollHeight;};
            else
                scrollTo.myScroll = function(){ return document.documentElement.scrollHeight};
        }

        if(params.onScroll) {
            onScroll = function() {
                if( scrollTo.myScroll() - (me.scrollTop() + me.height())  < offset )
                    params.onScroll(me);
            };

            me.elem.bind('scroll.scroller' + me.uuid, function(){
                me.onScrollTimer = setTimeout(onScroll, 0);
            });

            $(onScroll);
        } else {
            return false;
        }

        return me;
    };

    return init(params, this);
}

(function(Scroller, proto){
    Scroller.uuid = 0;

    proto.destroy = function(){
        clearTimeout(this.onScrollTimer);
        this.elem.unbind('scroll.scroller'+this.uuid);
    };
})(Scroller, Scroller.prototype);

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