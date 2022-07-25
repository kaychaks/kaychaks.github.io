---
title : Am Encrypted!
published : 2015-12-05
tags : encryption,security,technology
link : 
---

[Let's Encrypt is in public beta](https://letsencrypt.org/2015/12/03/entering-public-beta.html) since last night.

And hence the lock icon in the location bar says

![My Certificate](/images/Screen-Shot-2015-12-04-at-4-31-26-pm.png)

Although Let's Encrypt guys are not shipping auto-install plugin for nginx in this beta, the whole process is smooth.

Here are the steps that I followed:

* Get the certificates

```
./letsencrypt-auto certonly
```

* Make sym links

```
sudo ln -s
/etc/letsencrypt/live/www.kaushikc.org/fullchain.pem
/etc/nginx/ssl/fullchain.pem

sudo ln -s /etc/letsencrypt/live/www.kaushikc.org/privkey.pem /etc/nginx/ssl/privkey.pem
```

* Configure SSL in nginx site config

```
server {
    listen 443 ssl;
    server_name kaushikc.org www.kaushikc.org;
    add_header Strict-Transport-Security "max-age=31536000";
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

* Redirect all *http* to *https*

```
server {
       listen         80;
       server_name    kaushikc.org www.kaushikc.org;
       return         301 https://$server_name$request_uri;
}
```

* Reload nginx

```
sudo service nginx reload
```

* [Donate to ISRG](https://letsencrypt.org/become-a-sponsor/)

---

__Update__

- [How do I renew these certs every 90 days](/posts/am-encrypted-renewal.html)
