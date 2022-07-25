---
title : Apple Pay on the Web
published : 2016-06-14
tags : Web,apple,technology
link : 
---

When Apple announced about Apple Pay APIs for the web (read Safari), I kind of guessed that it will be different from the [Web Payments API standard](https://www.w3.org/blog/wpwg/2016/04/21/first-public-working-drafts-of-payment-request-api/) from the [Web Payments Working Group](http://www.w3.org/Payments/WG/).

The documentation of the Apple Pay JS framework talks about bunch of JS events and one session object. Pretty straight forward stuff [with some conditions though](https://developer.apple.com/reference/applepayjs)

> There are three requirements for using Apple Pay on your website:
>
> - You must have an Apple Developer Account
>
> - Any pages that incorporate Apple Pay must be served over HTTPS
>
> - Your website must comply with the Apple Pay guidelines

Well so I was right, *but not entirely though*.

Apple is a member of the aforementioned Web Payments Working Group. And [they sent a message to the mailing list](https://lists.w3.org/Archives/Public/public-payments-wg/2016Jun/0013.html) post the keynote. Following text caught my attention:

> There are several differences between the Apple Pay API and the Payment
Request API, and we look forward using the experience we've gained while
working on it to help push the Payment Request API forward

So there is still some hope of convergence here.

I am looking forward to [tomorrow's WWDC session](https://developer.apple.com/wwdc/schedule/#/details/703) on the same and might update this post if some new information comes to light.