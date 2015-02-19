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
    <div class="vapp-container-logined">
        Приложение использует видео с сайта vk.com, поэтому необходимо авторизоваться на этом сайте и подтвердить разрешения для приложения
    </div>
</script>

<script type="text/template" id="vapp-not-supported-page">
    <div class="vapp-container-supported">
        Ваш браузер не поддерживает технологию с помощью которой воспроизводится видео в приложении
    </div>
</script>

<script type="text/template" id="vapp-navigation-item">
    <a class="vapp-header_link unselectable fl-r {class}" href="/?tab={tabName}" onclick="vapp.changeField('{tabName}');">{title}</a>
</script>

<?php require_once 'footer.php'; ?>
