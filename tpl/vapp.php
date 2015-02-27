<?php require_once 'header.php'; ?>

<div id="vapp-middle">
    <div id="vapp-page_top" class="vapp-content"></div>
    <div class="vapp-content ta-c" id="vapp-page"></div>
    <div id="vapp-scrolller_aim" class="h ta-c" >
        <img src="/static/i/loader.gif"/>
    </div>
</div>

<script type="text/template" id="vapp-welcome-page">
    <div class="vapp-box">
        <div class="vapp-box_top">
            Доброго времени суток, приложение загружается.
        </div>
        <img src="/static/i/loader.gif"/>
    </div>
</script>

<script type="text/template" id="vapp-not-logined-page">
    <div class="vapp-box">
        <div class="vapp-box_top">
            Приложение использует видео с сайта <a href="http://vk.com/" target="_blank">vk.com</a>, поэтому необходимо авторизоваться на этом сайте и подтвердить разрешения для приложения
        </div>
        <div class="vapp-box_bottom">
            <span class="btn" onclick="vapp.vk.login()">Войти через вконтакте</span>
        </div>
    </div>
</script>
<script type="text/template" id="vapp-not-rights-page">
    <div class="vapp-box">
        <div class="vapp-box_top">
            Приложению необходимо получить разрешения к видео контенту
        </div>
        <div class="vapp-box_bottom">
            <span class="btn" onclick="vapp.vk.login()">Предоставить разрешения</span>
        </div>
    </div>
</script>

<script type="text/template" id="vapp-not-supported-page">
    <div class="vapp-box">
        Ваш браузер не поддерживает технологию с помощью которой воспроизводится видео в приложении
    </div>
</script>

<script type="text/template" id="vapp-friend-item">
    <div class="vapp-friend_item" data-id="{uid}" id="vapp-friend_item_{uid}" onclick="vapp.feed.choiceFriend({uid}, event)">
        <div class="vapp-friend_item_img" style="background: url({photo_100})"></div>
        <div class="vapp-friend_item_name ellipsis">{first_name}</div>
    </div>
</script>

<script type="text/template" id="vapp-video-item">
    <div class="vapp-video_item" data-id="{vid}" id="vapp-friend_item_{vid}">
        <div class="vapp-video_item_img" style="background-image: url({image_medium})" onclick="vapp.player.open({vid});">
            <div class="vapp-video_item_hover"><div class="icon-play"></div></div>
            <div class="vapp-video_item_duration">{duration_small}</div>
        </div>
        <div class="vapp-video_item_name ellipsis">{title}</div>
    </div>
</script>

<script type="text/template" id="vapp-user-box">
    <div class="vapp-user_img_cover">
        <div class="vapp-user_img" style="background-image: url({photo_50})">
            <div class="vapp-user_top_exit unselectable" onclick="vapp.vk.logout();" onmouseover="$(this).addClass('hover')" onmouseout="$(this).removeClass('hover')">
                <div class="icon-logout"></div>
            </div>
        </div>
    </div>
</script>

<script type="text/template" id="vapp-video-player">
    <div class="vapp-player">
        <video src="{src}" width="{width}" height="{height}" id="vapp-video" poster="{poster}"></video>
        <div class="vapp-player_overlay unselectable" onclick="vapp.player.play();">
            <div class="vapp-player_inner">
                <div class="icon-play"></div>
            </div>
        </div>
        <div class="vapp-player_controls">
            <div class="unselectable vapp-player_control_play paused" onclick="vapp.player.playClick(this);">
                <div class="vapp-player_control_icn icon-play h"></div>
                <div class="vapp-player_control_icn icon-pause h"></div>
                <div class="vapp-player_control_icn icon-cw h"></div>
            </div>
            <div class="vapp-player_timing">
                <div class="unselectable vapp-player_timing_line">
                    <div class="vapp-player_timing_buffered"></div>
                    <div class="vapp-player_timing_progress">
                        <div class="vapp-player_timing_ttip">
                            00:00
                        </div>
                    </div>
                </div>
                <div class="vapp-player_timing_duration">
                    {duration}
                </div>
            </div>
            <div class="unselectable vapp-player_volume {class_volume}" onclick="vapp.player.volumeClick(this);">
                <div class="vapp-player_volume_icn icon-volume"></div>
                <div class="vapp-player_volume_icn icon-volume-off"></div>

                <div class="vapp-player_volume_line">
                    <div class="vapp-player_volume_inner"></div>
                </div>
            </div>
            <div class="vapp-player_fullscreener">
                <div class="icon-resize-full"></div>
            </div>
        </div>
    </div>
</script>

<script type="text/template" id="vapp-navigation-item">
    <a class="vapp-header_link unselectable {class}" id="vapp-header_link_{tabSource}" href="/?tab={tabSource}" onclick="vapp.feed.friendId = null; vapp.feed.change('{tabSource}', event);">{title}</a>
</script>


<script type="text/template" id="vapp-friend-top">
    <div class="vapp-friend_top">
        <div class="btn" onclick="vapp.feed.friendId = null; vapp.feed.change('friends', event);"><div class="icon-cancel"></div></div>
        <div class="vapp-friend_top_img" style="background: url({photo_50})"></div>
        Видео - {first_name}
    </div>
</script>

<script type="text/javascript">
    $(function(){
        vapp.init({
            apiId: <?= VK_APP_ID?>,
            feeds: {
                'mine' : {
                    title: 'Мои видео',
                    tabSource: 'mine'
                },
                'friends' : {
                    title: 'Видео друзей',
                    tabSource: 'friends'
                }
            },
            currentFeed: 'mine'
        });
    });
</script>

<?php require_once 'footer.php'; ?>
