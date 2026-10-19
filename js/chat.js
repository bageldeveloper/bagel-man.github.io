<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bagels Chat</title>

  <link rel="stylesheet" href="main.css">

  <script src="https://cdn.scaledrone.com/scaledrone.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.7.0.js"></script>
</head>

<body>
  <header class="topbar">
    <div class="logo-area">
      <img src="bagelicontab.png">
      <span>bagelcomics</span>
    </div>

    <nav class="top-links">
      <a href="index.html">Games</a>
      <a href="chat.html" class="active">Chat</a>
      <a href="projects.html">Projects</a>
      <a href="about.html">About</a>
    </nav>
  </header>

  <main class="chat-page">
    <h1 class="pedro">Chat</h1>

    <div class="members-count">-</div>
    <div class="members-list">-</div>
    <div class="messages"></div>

    <form class="message-form" onsubmit="return false;">
      <input class="message-form__input" placeholder="Say something..." type="text">
    </form>
  </main>

  <script src="./chatscript.js"></script>
</body>
</html>
