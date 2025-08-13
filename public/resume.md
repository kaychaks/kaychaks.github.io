# Kaushik Chakraborty

[kaushik@kaushikc.org](mailto:kaushik@kaushikc.org) |
[github.com/kaychaks](github.com/kaychaks) | [linkedin.com/in/kaychaks/](https://www.linkedin.com/in/kaychaks/) | [kaushikc.org/tags/technology](kaushikc.org/tags/technology)

## About me
  
  As a passionate programmer with a deep interest in Functional Programming, Knowledge Engineering, and the Decentralized Web, I bring a blend of mathematical rigor and practical industry experience. My career spans from developing intricate server-side solutions to dynamic client interfaces, thriving in both R&D and large-scale enterprise environments. I advocate for a collaborative, 'show-and-tell' leadership style and am a committed contributor to the open-source community, embodying a belief in shared knowledge and innovation.

### Programming
  
  **TypeScript**, **Rust**, **Unison**<br />
  _Also_: Rust, Haskell, Python, NodeJS, React, Vue, Svelte, Scala, Lean, PHP, Relay, Redux

### Operations
  
  **Linux**, **Kubernetes**, **AWS**<br />
  _Also_: Nix, Github Actions, AWS EKS, AWS Cognito, AWS Lambda, Terraform, Dhall
  
### General
  
  **Enterprise Architecture**, **Distributed Systems**, **Modern Web Programming**,
  **Functional Programming**, **Type Systems**<br />
  _Also_: HTTP, Reactive Principles, Graphs, Formal Methods, Knowledge
  Engineering, Site Reliability Engineering (SRE), Extreme Programming based Agile

## Experience [Open Source]

- Published [unichorn](https://share.unison-lang.org/@kaychaks/unichorn), a Functional Choreographic Programming library in Unison. Choreographic programming is a programming paradigm where one writes a single program that describes the complete behavior of a distributed system and then compiles it to individual programs that run on each node. In this way, the generated programs are guaranteed to be deadlock-free, [2024](https://share.unison-lang.org/@kaychaks/unichorn)
- Published [cbor](https://share.unison-lang.org/@kaychaks/cbor), a library providing a CBOR (Concise Binary Object Representation) decoder implemented in Unison. It is specifically designed for decoding CBOR data in the context of WebAuthn flows, with a focus on supporting the CBOR Data Model that aligns with JSON document structures, [2024](https://share.unison-lang.org/@kaychaks/cbor)
- Published [autopack](https://github.com/kaychaks/autopack), a CLI tool built in Rust to auto-build and run a React app within a Docker container without a Dockerfile leveraging Cloud Native Buildpacks, [2023](https://github.com/kaychaks/autopack)
- Published [kiteticker-async Rust crate](https://crates.io/crates/kiteticker-async), an async Rust client for Kite Connect Websocket API, [2022](https://github.com/kaychaks/kiteticker-async)
- Published [hmm](https://github.com/kaychaks/hmm), Haskell implementations of Hidden Markov Models & related algorithms
   from AIMA book and using them for approaches mentioned in the paper [Assessing the resilience of stochastic dynamic systems under partial observability](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0202337), 2019
- Contributed to [scalaz/scalaz](https://github.com/scalaz/scalaz), a library for principled functional programming in Scala, [2019](https://github.com/scalaz/scalaz/commits/master/?author=kaychaks)
- Contributed to [haskell-nix/hnix project](https://github.com/haskell-nix/hnix), a Haskell re-implementation of the Nix expression language, [2018](https://github.com/haskell-nix/hnix/commits/master/?author=kaychaks)

## Experience [Cognizant Technology Solutions, 2006 - 2025]
### Enterprise Architect - Customer Portal Modernisation [2024-2025]
---
- Architected, implemented, and lead a large-scale migration of existing .NET & Angular-based legacy customer portal into modern AWS cloud-native Java Springboot microservices & Next.js microfrontends.

- Migration of ad-hoc authentication & authorisation system to AWS Cognito with both Cognito user pools & federated OIDC authentication and Amazon Verified Permission-based authorisation. 

- Database migration from legacy Oracle DB to AWS DocumentDB for application & RedShift for analytics. 

### Associate Director - Warehouse Management System (WMS) Modernisation for the World's Largest Refrigerated Warehousing Company [2022 - 2024]
---
- Architected the modernisation of a critical WMS built using legacy FoxPro to a modern web application using React with NestJS-based Node APIs in the backend interacting with MS SQL server.
- Built multiple internal libraries to fasten the overall implementation, like
	- an embedded TypeScript-based DSL to lift-and-shift code from legacy FoxPro
	- automation scripts to create TypeScript data models for corresponding DB tables
	- automation scripts to generate fully typed TypeScript code to call Stored Procedures
	- framework level changes by monkey patching NestJS decorators to realise multi-tenancy
	- custom audit trail framework to improve observability on top of Datadog integration
- Domain Domain-driven design of the API server, which leads to easy refactoring on continuously changing client expectations.
- Spearheaded the modern UX design of the new WMS, along with the product owners and web designers.
- Supervised the overall Kubernetes-driven cloud DevOps and Observability setup for the new WMS
- Supervised the rollout of the new WMS in more than 70 warehouses and collaborated with the production support team for all critical bugs.
- Helped design and solve critical bugs in a parallel modernisation of legacy mobile WMS to a new React Native-driver mobile WMS

### Associate Director - Large E-Commerce Site Transformation [2021 - 2022]
---
- Designed and spearheaded a large frontend technology transformation initiative for one of the largest e-commerce web applications. The web application is transitioning from legacy technologies of Backbone / Marrionette to modern Vue3 and SSR-based frontend stack.
- The design is keeping in mind many existing vertical domains. Thereby, implementation is being done in a pure domain-driven design model.
- Design is trying to enable some flavours of micro-frontends so that disparate teams could go live without having hard dependencies on other teams
- The overall design also entails creating a multi-theme design system from scratch (without relying on any external design frameworks)

### Sr. Architect - Large Store Transformation [2019 - 2020]
---
- Designed the end-to-end flow of a Hybrid Mobile Web Application destined to provide one consolidated experience capturing features from more than 40 legacy applications
- Designed & implemented _GraphQL_ based middleware providing sophisticated schema for an _React/Relay_ based Hybrid Web Application and also having totally _type-safe Typescript_ resolvers integrating with multiple
  micro-services based Enterprise backends
- Designed & implemented a Google Kubernetes-based cloud-native deployment pipeline that also interfaced with other Google Cloud services like Stackdriver & BigQuery for tracing and monitoring
- Implemented various proof-of-concepts to migrate one of the critical native store applications from iOS to Android, dealing with low-level Secure Socket Programming & AES encrypted message passing via an ad-hoc wire protocol
- Implemented advanced techniques in Relay's runtime and network manager to deal with better client performance for lazy loading and automated remote logging/monitoring.

### Sr. Architect - Global Technology Office - Applied Research Initiatives [2018 - 2019]
---
- Collaborated with academia for research engagements, which entailed doing extensive literature study (especially going through foundational research papers), evaluating relevant source code libraries/implementations, and coming up with novel approaches to become a
  research proposal.
- Worked on a proposal for _Model-based Resiliency Validation of Cloud-Native Distributed System_ to develop a stochastic model, which can then be plugged into a home-grown failure injection platform.
- Implemented a Haskell-based solution leveraging Hidden Markov Models-based probabilistic inferencing algorithms
- Involved in literature study and proof-of-concepts of the following other research proposals:
	- Bringing dependent type theory to model and reason Description Logic-based Knowledge Representation and Reasoning systems
	- Evaluating automatic Ontology generation approaches based on the foundations of Statistical Relational Learning
	- Evaluating proposal on using Fluid Session Types for various use cases

### Architect - Global Technology Office - Solutions and Accelerators [2012-2018]
---
- Worked on creating Knowledge Graph Models using Semantic Web Technologies (RDF & OWL) and
  other innovative techniques involving logic programming (Datalog & mini-Kanren), rules-engines, & other platforms (Stanford DeepDive) for various use-cases both internal and customer specific.
- Used Scala and Spark to do data analysis on the complete Stack Overflow Q&A dataset and created various Skills Clusters using Graph Algorithms. Which then was leveraged for an
  home-grown Skills and Competencies Ontology & related tool to help Human Resources in talent supply chain.
- Designed, setup, and maitained internal tools to improve developer productivity like source control repositories, CI/CD pipelines, docker registries for the overall company and deployed in a large Kubernetes cluster fully hosted in on-premise datacenters.
- Designed & implemented a generic Gamification Platform with rich analytical and presentation views. The technologies used were PHP, Angular, and Mongo DB for the client application and Drools as the central rules-engine driving the
  backend. Involved in pre-sales & evangelisation of the same for multiple customers.
- Contributed to HNix, an open source project for Haskell re-imlementation of the Nix expression language

### Sr. Associate - Global Technology Office - Consulting [2011 - 2012]
---
- Worked as lead consultant and developed features for the web dashboards of a large NY based Investment Bank's R&D division. Used extensively ExtJS widgets & a web-components-based design that integrated with multiple other 3rd party
  scripts while ensuring strict performance requirements from the customers.
- Worked as a consultant for a large mobility customer creating their massive web platform for converged experience of one of US's biggest media houses. The platform used advanced JavaScript to deliver streaming media content as well as lots of form based configuration screens having complicated business rules. Along with lead developer also tasked to manage teams across geographies for a seamless delivery.

### Associate [2006 - 2011]
---
- Developed an enterprise mashup platform which worked similar to Yahoo Pipes but produced deployable mashups. Used Adobe Flex as one of the technologies to create the platform.
- Involved in a project to create web based knowledge management portal by one of the largest casual dining chain of US. Used a home-grown JavaScript framework which
  used copy-on-write techniques for performant user interfaces.
- Involved in a legacy modernisation project where one large restaurant chain were migrating from C++ based point-of-sale systems to .NET Framework.
  Migrated code from complex legacy C++ codebase to modern .Net v2 implementations as part of a Windows CE native application to run in highly resource-constrained registers. We had to consider critically both space and time complexities.

## Education
- **B. Tech [Computer Science & Engineering]**, 2002 - 2006, Kalinga Institute of Technology
  and Science, Bhubaneshwar, India.
