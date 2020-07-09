---
title : Google's AMP might take web components mainstream
published : 2015-10-12
tags : technology,Web
link : 
---

The Accelerated Mobile Project from Google has its heart at the right place being open source but it also can be an interesting attempt to get public onboard to showing ads before showing ads !

Its a shame that in 2015 Google has to come up with all these innovations to render bunch of static pages fast and without drama in our browser, especially the mobile ones. The direction here is produce a constrained environment for nothing other than a bunch of text (and some safe media) along with ads (that won't suck).

However, in all these if anything that's gonna get its long due visibility is the [*web components*](http://www.w3.org/TR/components-intro/) spec. And that's why I'm interested.

Some features of [AMP](https://www.ampproject.org/how-it-works/)

* AMP HTML documents would not include any author-written JavaScript, nor any third-party scripts.
* AMP Components are implemented using couple of great solutions of the web platform: [custom elements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/) and [web components](http://webcomponents.org/). AMP components may have JavaScript under the hood, but it is coordinated with other AMP components, so its composition into the page doesn’t cause performance degradation.
* “tracking pixels” can be embedded into AMP documents as long as they don’t use JavaScript.
* More advanced analytics are currently not supported. Vision is to deploy a single, unified, auditable, high performance, open source analytics library with AMP HTML that can report to various existing analytics provider backends, so it is possible to use the existing ecosystem without overloading a page with analytics software.
* AMP HTML doesn’t allow JavaScript so ads cannot be directly embedded – instead they live in *sandboxed iframes* with no access to the primary document
* AMP HTML has been added the ability to tell a document: render yourself, but only as far as what is visible above the fold and only elements which are not CPU intensive to minimize the cost of pre-rendering
* Google is offering a service that delivers AMP HTML documents given their URL through its CDN. *Others can use this service* or make their own or serve AMP HTML pages from a plain-old-web-server.
* All resource loading is controlled by the AMP library and, more importantly, resources must declare their sizing up-front. Document authors have to state resource sizes explicitly. This doesn’t mean that resources can’t be responsive – they can be, but their aspect ratio or dimensions needs to be inferable from the HTML alone.

All said and done when it comes to low latency web app & *instant loading* of web pages there is still much more required over at the server & also over the wire. And there comes the Google's [Serving Service](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#amp-html-).

>AMP HTML are also designed to be optionally served through specialized AMP serving systems that proxy AMP documents. These documents serve them from their own origin and are allowed to apply transformations to the document that provide additional performance benefits. An incomplete list of optimizations such a serving system might do is:

>* Replace image references with images sized to the viewer’s viewport.
* Inline images that are visible above the fold.
* Inline CSS variables.
* Preload extended components.
* Minify HTML and CSS

---

Coming back to the web components (the central piece of all these implementations & bold claims) -

>AMP HTML uses a set of contributed but centrally managed and hosted custom elements to implement advanced functionality such as image galleries that might be found in an AMP HTML document.

Here're somethings I am still not clear though

* if the core part of the design is around custom elements then why the `amp-ad` is based on iFrames. *I think it's because of the still unresolved complications with shadow DOM implementations across browsers.*

* Also, till the recent working group discussions browser vendor especially Google & Apple were still pondering on the [right implementations of custom elements spec](http://www.2ality.com/2015/08/web-component-status.html). Have they sorted out the details ? If not, is AMP going to use polyfills while rendering in Safari. I could not locate Polymer in the build script of AMP. Although, I found this comment though in their [`base-element.js`](https://github.com/ampproject/amphtml/blob/master/src/base-element.js)

![custom custom-component](/images/Screen-Shot-2015-10-12-at-7-36-01-am.png)

This clearly shows that since its just custom elements that AMP is concerned about, they have written the same from scratch rather than using their own Polymer polyfills.

Apart from the built-in components Google is providing ways to create extended / third-party components. However, these components to become widely used or recognised need to be contributed & will have to pass [an approval process by Google & other partners :](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-components.md#extended-components)

>* To be considered for inclusion into the official AMP components, a contributed component must:
    * The author of the component must sign the Google Individual CLA, or if contributing on behalf of a corporation, the Corporate CLA.
* Google and a core group of collaborators, and potentially representatives from other collaborators as the project grows in usage - will have ultimate discretion as to the inclusion of contributed components,

---

There are some other interesting decisions Google has taken here like keeping things pretty restricted for now just to prevent any kind of misuse & also to control the behaviour of the system from a performance perspective. The levels are as insane as Apple's control on iOS ecosystem

* Most of the important HTML tags are prohibited e.g. script, form, input elements & iframe.
* Initial version of AMP will only allow very simple CSS selectors in AMPs. The restriction is in place to make overall performance easier to reason about
* The AMP runtime is a piece of JavaScript that runs inside every AMP document. It provides implementations for AMP custom elements, manages resource loading and prioritization and optionally includes a runtime validator for AMP HTML for use during development.
* There are no particular guarantees as to the loading behavior of the AMP runtime, but it should generally strive to load resources quickly enough, so that they are loaded by the time the user would like to see them if possible. The runtime should prioritize resources currently in viewport and attempt to predict changes to the viewport and preload resources accordingly.

---

Lastly, being Google there is some Linked Data goodness [also involved here](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#html-tags)

* Script tag is prohibited unless the type is application/ld+json (Other non-executable values may be added as needed.). Exception is the mandatory script tag to load the AMP runtime and the script tags to load extended components.

An example format with Schema.Org tags will look something like this

![ld-goodness](/images/Screen-Shot-2015-10-12-at-7-38-53-am.png)

---

All of this might be an attempt in response to Facebook's Instant Article or Apple's iOS9 News app but being open source and some heavyweight content creators on board this might be that hallmark app for web components spec (and may be also for static content on the web). But as Google is saying it's just the initial draft and things might completely change in the coming days, I'm sure there will be much more to write about it in future.
