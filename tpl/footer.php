
            </div>
        </div>
    </div>

    <div id="node-heap"></div>

    <script type="text/javascript">
        vapp.init({
            apiId: <?= VK_APP_ID?>,
            feeds: {
                'mine' : {
                    title: 'Моё видео',
                    tabSource: 'mine'
                },
                'friends' : {
                    title: 'Видео друзей',
                    tabSource: 'friends'
                },
                'search' : {
                    title: 'Поиск',
                    tabSource: 'search'
                }
            },
            currentFeed: 'mine'
        });
    </script>
</body>
</html>