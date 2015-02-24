<?php require_once 'header.php'; ?>

<div id="vapp-middle">
    <div class="vapp-content ta-c" id="vapp-page"></div>
</div>

<script type="text/template" id="vapp-welcome-page">
    <div class="vapp-container">
        <div class="vapp-container_top">
            Доброго времени суток, приложение загружается.
        </div>
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
    <div class="vapp-friend_item" data-id="{uid}" id="vapp-friend_item_{uid}">
        <div class="vapp-friend_item_img">
            <img src="{photo_100}"/>
        </div>
        <div class="vapp-friend_item_name ellipsis">{first_name}</div>
    </div>
</script>

<script type="text/template" id="vapp-video-item">
    <div class="vapp-video_item" data-id="{vid}" id="vapp-friend_item_{vid}" onclick="vapp.player.open({vid});">
        <div class="vapp-video_item_img">
            <img src="{image_medium}"/>
        </div>
        <div class="vapp-video_item_name ellipsis">{title}</div>
    </div>
</script>

<script type="text/template" id="vapp-navigation-item">
    <a class="vapp-header_link unselectable fl-r {class}" id="vapp-header_link_{tabSource}" href="/?tab={tabSource}" onclick="vapp.feed.change('{tabSource}', event);">{title}</a>
</script>

<script type="text/javascript">
    $(function(){
        vapp.init({
            apiId: <?= VK_APP_ID?>,
            feeds: {
                'friends' : {
                    title: 'Видео друзей',
                    tabSource: 'friends'
                },
                'mine' : {
                    title: 'Мои видео',
                    tabSource: 'mine'
                }
            },
            currentFeed: 'mine'
        });
    });
</script>

<?php require_once 'footer.php'; ?>
