
            </div>
        </div>
    </div>

    <div id="node-heap"></div>

    <script type="text/javascript">
        vapp.init({
            apiId: <?= VK_APP_ID?>,
            feeds: {
                'mine' : {
                    title: 'Моё видео'
                },
                'friends' : {
                    title: 'Видео друзей'
                },
                'search' : {
                    title: 'Поиск'
                }
            },
            currentFeed: 'mine'
        });
    </script>
</body>
</html>