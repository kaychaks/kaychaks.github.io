---
title : Am Encrypted! - Renewal
published : 2016-05-30
tags : encryption,technology
link : 
---

It's been 2 renewals & not a single issue till now. However in the mean time Let's Encrypt guys have released a new tool to smoothen those few rough edges, namely - [__certbot__](https://certbot.eff.org).

And it's cool for renewal as well. So here's a simple rundown:

- Get it

```
wget https://dl.eff.org/certbot-auto
```

- Make it runnable

```
chmod a+x certbot-auto
```

- Renew

```
./certbot-auto renew
```

- And automate it (so that you don't have to do it again)

```
> sudo crontab -e
# check twice in a day & don't forget the newline in the end
0 4 * * * ./home/ubuntu/certbot-auto renew --quiet --standalone --pre-hook "service nginx stop" --post-hook "service nginx start"
0 16 * * * ./home/ubuntu/certbot-auto renew --quiet --standalone --pre-hook "service nginx stop" --post-hook "service nginx start"

```
Cool thing is

> certificates are only renewed when they’re determined to be near expiry

and

> The hooks will only be run if a certificate is due for renewal, so you can run this command frequently without unnecessarily stopping your webserver

For more information on all the options mentioned above & more, check out [this nice documentation](https://certbot.eff.org/docs/using.html#renewal)