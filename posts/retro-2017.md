---
title : Retrospecting 2017
published : 2017-12-17
tags : technology
---

From [Typeclassopedia's Functor](https://wiki.haskell.org/Typeclassopedia#Functor) page

> Intuition will come, in time, on its own.

This year's highlight, for me, is the shift from Scala to Haskell.

I started the year with a lot of enthusiasm continuing programming in Scala. Focussing on the functional side of things, I chose `cats` `shapeless`, `akka` (especially the `streams`) & `monix` for various use-cases where they seemed fit. `shapeless` was really interesting & mind-bending at the same time, hence I worked my way through [Type Astronaut's Guide](https://underscore.io/books/shapeless-guide/) to get a better grasp of it. I managed to solve relevant tasks elegantly using these tools and I was happy the way I was progressing.

At the same time, I was _also_ drinking a lot of _kool aid_ reading papers & blog posts to further my journey in the beautiful land of _Fun Programming_. Most of those text contained code in Haskell, of course. It got gradually difficult for me to continue understanding those codes without a proper understanding of basic tenets of Haskell. So I decided a digression to actually learn Haskell, just so that I could get a proper understanding of those pedagogy and then will come back to Scala to implement leveraging that acquired knowledge.

So I started with the [Haskell Book](http://haskellbook.com) and, honestly, the first chapter on Lambda Calculus half-converted me. It was really shocking to me when I realised how the kind of reasoning that we can do with Haskell programs, mostly due to its strict ideological stance to remain pure whatever it takes, can never be done with Scala. Never.

This realisation became more apparent as I went back to those papers & posts & realized how people implicitly leveraged that same purity for their ideas. The nice thing with Haskell's purity by design is that it never cheats on you. Which is not the case in Scala, and I discovered it as I went back to all those codes of mine and observed them now with my new _lens_ of purity. I tried to refactor but it got really complex & lost all its elegance.

Pure functional programming provides referential transparency for free & thereby resulting in equational reasoning. And all these results in sleeping peacefully at night. These known heresies become real in Haskell. Scala just gave an illusion of them but I found very late that they were all lies.

Scala's weird syntax never bothered me much, also when programming with higher-kinded types. To me, semantics mattered more. But with Haskell, that trade-off also went away. Now I believe that Haskell's syntax is the only natural way of writing expressions.

I worked my way through Haskell Book, few other online courses, and some side projects (one of them was migrating this blog to [Hakyll](https://jaspervdj.be/hakyll/)). But then LambdaConf videos came out especially the [Let's Lens](https://www.youtube.com/watch?v=inyfR3Gb6GE) workshop from [Tonny Morris](https://twitter.com/dibblego?lang=en). I had watched Kmett's [talk on deriving lenses](https://www.youtube.com/watch?v=cefnmjtAolY) and could not get most of it. Tony's [lets-lens](https://github.com/data61/lets-lens) exercises provided the best progression to eventually understand Kmett's derivation of lenses. The video was also interesting for me to help understand how people actually think when writing Haskell. There were many enlightening moments in that 6hrs long video that really gave me a lot of confidence in writing Haskell for everyday programming.

I met Tony in person [at Functional Conf](https://www.youtube.com/watch?v=0x3EIqBrZxw) this year. Got a lot of unconventional wisdom, worked my way through his superb [fp-course](https://github.com/data61/fp-course) and all that boosted my spirits to write more Haskell.

I consider this year to be one of the most productive years personally for me. I wrote & read a lot of Haskell code. Both of which I feel is highly necessary to build intuitions.

I've read complaints on Haskell's community & it's availability of documentation. My experience was very different though. I learn a lot hanging around in Haskell IRCs and also lately the Scalaz IRC! I think most of the Haskell related [blog posts](http://www.stephendiehl.com/posts/haskell_2018.html) actually are of higher quality than the ones written with other languages (esp. Scala). Haskell requires a different way to think about solving problems and with that respect [available](https://hackage.haskell.org) [pedagogy](https://wiki.haskell.org/Learning_Haskell) is really good. There will always be a scope of doing better and I think people like [Julie Moronuki](https://joyofhaskell.com) are trying to make that happen.

Haskell made me value the importance of science in Computer Science and hence I believe understanding the underlying [_theories_](https://www.cs.cmu.edu/~crary/819-f09/) is absolutely necessary to write any significant code in Haskell. With Haskell, I believe, the concept of design works the same way irrespective of whether the context is small/local or large/distributed. And that's only possible on account of those underlying mathematical/logical foundations. There are enough prior arts in Haskell community where a theory that applies to a basic program can be _lifted_ at a system level to achieve something big (e.g. [haxl](https://github.com/facebook/Haxl), [lens](https://github.com/ekmett/lens)). And that's the beauty of designing programs with Haskell - if done properly (i.e. polymorphically), it liberates the implementation from the shackles of any kind of contexts (execution or deployment).

Apart from Haskell & Scala, I wrote few boring machine learning/statistics code with Python & a good amount of shell scripts <sup id="fnref-1-2015-10-18"><a href="#fn-1-2017-12-17" rel="footnote">1</a></sup>. I deliberately stayed away from writing any JavaScript this year. But I had to review a lot of them (which is a whole different story).

Among new frameworks that I played around this year, Kubernetes (K8S) & Nix are really the coolest ones. K8S is kind of a beast. I am still grappling with all the concepts there but it will be a big part of my professional life next year so maybe I might talk more about it in future. Nix is a personal interest of mine as it's kind of a darling within Haskell community and I really like the underlying ideas.

---

It won't be surprising now that next year I am planning to write more Haskell. It has taken me quite a long time to learn the concepts by reading a lot of theories, working my way through toy programs & reading a lot of code. And I'm looking forward to doing more of those next year as well. But one of my primary goal for next year is to use Haskell to solve some real-world use-cases that I would be expected to do in some other mainstream languages. And apparently, Haskell fit right into some of my ongoing interests for next year like new ways to do distributed computing & knowledge systems.

---

<div class="footnotes">
 <ol>
 <li class="footnote" id="fn-1-2017-12-17"><p>Automation & AI are the current marketing gimmicks around Enterprises<a href="#fnref-1-2017-12-17" title="return to article"> ↩</a></p>
 </li>
 </ol>
</div>
