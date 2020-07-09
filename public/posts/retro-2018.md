---
title : "Retrospecting 2018"
published : 2018-12-26
tags : technology
link :
---

This year was mostly uneventful unlike 2017. However, I did do a lot more technical reading - mostly papers and a few books - than previous years. Professionally things changed quite drastically. I am now meant to do mostly research-y things than what used to be half & half with engineering before. Not that I complain, my feelings are on the contrary actually. But this whole new setting at work, both from an operations & vision standpoint, is still clumsy and need more time to shape up well.

I am beginning to focus on the areas of *Knowledge Engineering*. I want to tie it with fascinating things from *Type Systems*. I believe their shared foundations in *Mathematical Logic* will provide interesting things to work on. And my choice of technology to realise any such research will be *Haskell*, mostly.

So apart from spending most of the time reading papers on the history of knowledge bases, their representation, and reasoning I also tried to get used to logic and proofs. During one such excavation, I landed on a course aptly named [Logic and Proof](https://leanprover.github.io/logic_and_proof/) which uses this beautiful language called [Lean](https://leanprover.github.io/) to write the proofs. Lean, like Haskell, has its roots in Microsoft Research. It, like Agda, is dependently typed language which also provides means to do inductive/automated theorem proving. It was my first foray into the world of computational theorem proving and some serious work with dependent types (I did dabble with Idris but it is better not to talk about that). Working with Lean and learning more about its origins and background type systems research gave me ideas that I believe are relevant to knowledge systems.

With Lean, I digressed heavily into learning dependent types, this time with a larger vision to make them useful for knowledge systems. And hence I got this amazing book called [*The Little Typer*](https://mitpress.mit.edu/books/little-typer). It provides the necessary foundations for me to relate dependent types, higher-order logic, relational programming, and eventually their role in knowledge systems. I am nowhere close to anything concrete to go after but I am having fun peeling the layers of these seemingly disjoint fields converging together elegantly.

Haskell with its dependent typing tools is nowhere close to things that Lean and Agda could do today. But it's still amazing how far the current type system could take you. [Sandy Maguire's new book](https://leanpub.com/thinking-with-types) is how I am trying to get my head around all those esoteric corners of Haskell. It's pretty good.

I also want to mention one other thing that is happening coincidentally and maybe right now I am not able to leverage it to its full extent only coz of my lack of understanding but I am pretty sure it will be something that I will be leaning a lot in future. And that is [Edward Kmett's Twitch videos on his creation of Guanxi](https://www.twitch.tv/ekmett/videos?filter=all&sort=time). Ed's videos are highly motivational (for some apparent indescribable reason).

Finally, I also want to highlight that I continued persevering with *Nix* irrespective of it still not friendly as a package manager in macOS. I realised that there's no other way, right now, to reading [nixpkgs](https://github.com/NixOS/nixpkgs/) source code to make stuff work properly with Nix especially in macOS. Hopefully, it will improve and I will also do my best towards that goal. But *Nix* is the future of so-called *devops* that I believe in and I want it to succeed at all costs.

As [my daughter](https://twitter.com/aarohi_c) grows up to her 3rd year of existence in 2019, I am hoping her to be a bit more independent and me getting a bit more time off work to try to contribute to some open source Haskell projects. Having a 2-year-old kid around when you are trying to do some focussed programming session is not a happy setting (no offence to any 2-year-olds).

I learnt a lot of new things in 2018 that now I think I have some roadmap for next year to channel my energies on. But none of them is related to *Deep Learning*, *Blockchain*, or *Microservices* unfortunately !!
