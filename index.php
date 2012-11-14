<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Othello</title>
    <link rel="stylesheet" type="text/css" href="css/ui-darkness/jquery-ui-1.9.1.custom.min.css">
    <link href="css/othello.css" rel="stylesheet" type="text/css" />

    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui.min.js"></script>

    <!-- allow data-main cache to be busted also -->
    <script type="text/javascript">
    var require = {
        urlArgs : 'x=' + Date.now()
    };
    </script>
    <script type="text/javascript" data-main="js/othello" src="js/require.js"></script>
</head>
<body>
    <div id="wrapper">
        <form id="settings">
            <label>columns</label>
            <input id="columns" value="8" />
            <label>rows</label>
            <input id="rows" value="8" />
            <label>games</label>
            <input id="gamesToPlay" value="50" />

            <strong>player 1</strong>
            <label>species</label>
            <select id="p1Species">
                <option value="human">human</option>
                <option value="AI" selected="selected">AI</option>
            </select>
            <label>AI mode</label>
            <select id="p1AiMode">
            </select>

            <strong>player 2</strong>
            <label>species</label>
            <select id="p2Species">
                <option value="human">human</option>
                <option value="AI" selected="selected">AI</option>
            </select>
            <label>AI mode</label>
            <select id="p2AiMode">
            </select>

            <input type="submit" />
            <button id="toggleIndices">toggle indices</button>
            <button id="paintMode">paint mode</button>
            <button id="randomSpread">random spread</button>
        </form>
        <div id="grid"></div>
        <div id="score">
            <div class="square player1Wins"></div>
            <div class="square player1"></div>
            <div class="square player2"></div>
            <div class="square player2Wins"></div>
        </div>
    </div>
    <div id="dialog">
        <div id="result"></div>
    </div>
</body>
</html>