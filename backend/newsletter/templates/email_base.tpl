<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Helvetica, sans-serif;
      color: #0c0c0c;
    }

    table {
      border-spacing: 0;
      width: 100%;
      margin: 0 auto;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    a {
      color: #2a5ca1;
      text-decoration: none;
    }

    hr {
      border: 0;
      height: 1px;
      background: #949494;
      margin: 20px 0;
    }

    @media only screen and (max-width: 600px) {
      body {
        font-size: 14px;
      }

      table {
        width: 100%;
      }

      h1 {
        font-size: 20px;
      }

      p {
        font-size: 14px;
      }
    }

    .header-container {
      background-color: #0076BC;
      color: #ffffff;
      padding: 20px;
      font-family: Helvetica, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-logo {
      margin-right: 15px;
    }

    .header-title {
      margin: 0;
      font-size: 20px;
      line-height: 1.5;
      font-weight: normal;
      text-align: center;
    }

    .token {
      font-size: 32px;
      font-weight: bold;
      color: #0076BC;
      text-align: center;
      margin: 20px 0;
    }

    .clickable-row {
        cursor: pointer; /* Changes the cursor to a pointer */
        transition: background-color 0.5s; /* Smooth color transition */
    }

    .clickable-row:hover {
        background-color: #c0d6ef;
        color: #0076BC;
    }
  </style>
  </style>
</head>

<body>
    <table style="background-color: #F8F8F8; margin: 0 auto; max-width: 600px; padding: 0px;">
        {% include 'header.html' %}
        {% block content %} {% endblock %}
        {% include 'unsubscribe_banner.html' %}
        {% include 'footer.html' %}
    </table>
</body>

</html>
