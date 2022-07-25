---
title : Daniel Spiewak's Scala Collection Proposal
published : 2015-10-11
tags : linked,linkedlist,technology,fun-prog,scala
link : https://gist.github.com/djspiewak/2ae2570c8856037a7738
---

Daniel in his [proposal](https://gist.github.com/djspiewak/2ae2570c8856037a7738):

>Collections and complexity are inherently tied together.

Implementation of Collection Types on top of JVM has always been a subject of introspection by people directly involved or knowledgable enough. My copy of Joshua Bloch's seminal book Effective Java <sup id="fnref-1-2015-10-11"><a href="#fn-1-2015-10-11" rel="footnote">1</a></sup> must be lying around somewhere.

When one love something, they tend to also look at cracks in it much more clearly than anyone else. Daniel's take on re-working some of the parts of Scala Collections is interesting.

My foray into the Scala world has started some time back but I have been doing it much rigorously now since I'm working mostly with data <sup id="fnref-2-2015-10-11"><a href="#fn-2-2015-10-11" rel="footnote">2</a></sup> & graphs. Higher-order abstractions on top of Collection Types is something that's so quintessential of any functional language. Scala Collections takes it to a different level of complexity when you add the mind-boggling structure of it's inheritance tree. There were times when I had to go back and think about some Haskell way to solve a problem and then come back to see if any of the Scala Collections already has it as a higher order abstraction.

Scala is an all encompassing language which by design strive to address as many problem domains as possible that Java over the years have addressed. And when I think about it, all the weird number of Scala Collection types might make sense.

Daniel wrote about his issues, particularly with the design and implementation of Scala Collections, and his remarks are useful for novice like me so as to make better informed decisions in future.

>Choosing a collection is a very deliberate and intentional thing. We want to select our collection to match the complexity bounds of our problem. Encouraging (and even enabling!) users to work in terms of generic types that throw away this information is wrong, and very very much an anti-pattern.

Lastly, delving into Scalaz is something I have been pondering lately. I came to deal with it while working with this esoteric framework named `banana-rdf` <sup id="fnref-3-2015-10-11"><a href="#fn-3-2015-10-11" rel="footnote">3</a></sup> for those Semantic Web projects. And Daniel has some thoughts there as well

>The IList type in Scalaz very notably replicates the functionality of List, but because it is using specialized functions that were implemented specifically for IList, its performance numbers are generally much better than those of List. And this is the most basic collection imaginable! (other than perhaps Option)

Its seems to be a nice proposal that has tenets I don't understand fully right now. My aim is to strive for those times when I could comprehend those aspects. I will write about my adventures.

---

<div class="footnotes">
 <ol>
 <li class="footnote" id="fn-1-2015-10-11"><p><em>those days from my previous life</em>. It took years of JavaScript, PHP & other weirdness that I could start this functional programming journey with a clean slate &nbsp;<a href="#fnref-1-2015-10-11" title="return to article"> ↩</a></p>
 </li>
 <li class="footnote" id="fn-2-2015-10-11"><p>actually <a href="https://spark.apache.org">Spark </a>&nbsp;<a href="#fnref-2-2015-10-11" title="return to article"> ↩</a></p>
 </li>
 <li class="footnote" id="fn-3-2015-10-11"><p>a <a href="https://github.com/banana-rdf/banana-rdf">library</a> for RDF, SPARQL and Linked Data technologies in Scala.&nbsp;<a href="#fnref-3-2015-10-11" title="return to article"> ↩</a></p>
 </li>
 </ol>
</div>