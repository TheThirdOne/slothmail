MailSloth
=========

Why?
------

The better question is why not.   
![Why not sloth](https://3.bp.blogspot.com/-BscDUZYDpQY/URs3ZCdVMNI/AAAAAAAAyb8/lSwKX9C4A7M/s1600/2.gif)   
Have you ever felt that their aren't enough sloths in your life? MailSloth is made to prevent that. 
Just imagine an inbox filled with glorious sloths. (and related merchandise).
MailSloth can currently give you a sloth horoscope if you use the RESTful api. In the future, you will subscripe via the api and the get daily sloth horoscopes.

How it was made?
----------------
  - Nodejs - main language
  - Expressjs - for the RESTful api
  - Sendgrid - for the email
  - CodedayLA - the time
  - JSPos - adding sloths
  - Horoscope.com - daily horoscopes

How to install?
---------------
Why would you want to install it? For access to more sloths? To customize horoscopes? To add daily horoscope?
All of those are valid reasons, but the real question is how to install and run it.

```npm install sendgrid```   
```npm install express```   
```node main.js $sendGridUser$ $sendGridPassword$```

Easy right?   
![Easy Right?](http://www.gaming-servers.net/forums/uploads/FileUpload/3b/4581ead876f811e357998835f74e11.gif)

RESTful api?
------------
Kindof. Its one url.

/send/?email=youremail@example.com


