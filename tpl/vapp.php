<?php require_once 'header.php'; ?>

<div id="vapp-content">
    <div class="vapp-content" id="vapp-page"></div>
</div>

<script type="text/template" id="vapp-welcome-page">
    <div class="vapp-container vapp-container_welcome">
        Доброго времени суток, приложение загружается.
    </div>
</script>

<script type="text/template" id="vapp-not-logined-page">
    <div class="vapp-container-logined ta-c">
        <div style="margin: 0 0 20px;">
            Приложение использует видео с сайта vk.com, поэтому необходимо авторизоваться на этом сайте и подтвердить разрешения для приложения
        </div>
        <div>
            <span class="btn" onclick="vapp.vk.login()">Войти через вконтакте</span>
        </div>
    </div>
</script>
<script type="text/template" id="vapp-not-rights-page">
    <div class="vapp-container-logined ta-c">
        <div style="margin: 0 0 20px;">
            Приложению необходимо получить разрешения к видео контенту
        </div>
        <div>
            <span class="btn" onclick="vapp.vk.login()">Дать разрешения вконтакте</span>
        </div>
    </div>
</script>

<script type="text/template" id="vapp-not-supported-page">
    <div class="vapp-container-supported">
        Ваш браузер не поддерживает технологию с помощью которой воспроизводится видео в приложении
    </div>
</script>

<script type="text/template" id="vapp-friend-item">
    <div class="vapp-friend_item" data-id="{uid}" id="vapp-friend_item_{uid}">
        <div class="vapp-friend_item_img" style="background: url({photo_100})"></div>
        <div class="vapp-friend_item_name">{first_name}</div>
    </div>
</script>

<script type="text/template" id="vapp-video-item">
    <div class="vapp-video_item" data-id="{vid}" id="vapp-friend_item_{vid}">
        <div class="vapp-video_item_img" style="background: url({image_medium})"></div>
        <div class="vapp-video_item_name">{title}</div>
    </div>
</script>

<script type="text/template" id="vapp-navigation-item">
    <a class="vapp-header_link unselectable fl-r {class}" id="vapp-header_link_{tabSource}" href="/?tab={tabSource}" onclick="vapp.feed.change('{tabSource}', event);">{title}</a>
</script>

<script type="text/javascript">
    vapp.init({
        apiId: <?= VK_APP_ID?>,
        feeds: {
//            'search' : {
//                title: 'Поиск',
//                tabSource: 'search'
//            },
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
</script>

<?php require_once 'footer.php'; ?>
