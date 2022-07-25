---
title : Relay Notes
published : 2015-11-30
tags : technology,javascript
link : 
---

<!-- Object Identification & Mutations -->
<!-- --- -->

[GraphQL](http://facebook.github.io/graphql/) is new way of fetching data from server championed at Facebook. It's a spec, mostly straightforward, which needs to be followed both at server and client to achieve its goals of a schema backed data correspondence.

[Relay](https://facebook.github.io/relay/) is an extension of GraphQL which is an attempt to bring sanity in other practical aspects of data management at the client especially for [React](http://facebook.github.io/react/index.html) based applications. However, being a spec it's not a React only thing.

I am attempting to port a fully semantic model based web application with mildly complex user interface and rich with REST & adhoc endpoints to GraphQL-Relay-React land.

As I mentioned before, GraphQL as a spec and Facebook's [reference implementation](https://github.com/graphql/graphql-js) is pretty straightforward. Moreover, as my backend is nothing but bunch of RDFs stored in a triple store backed by an OWL based semantic model, creating a GraphQL schema for the client was not that challenging.

The real challenge comes when Relay comes into picture.

Relay tries to simplify some practical pain points of front-end development like data flow between UI components, state  / scope management , both local and global, separation of concern while fetching data from server, managing timeouts and retries. And for that it takes the convention over configuration approach. By design, it's built with React in mind (but there is no reason why it can't be used without it).

GraphQL has the term *query* as part of its name and for a good reason. As long as the application is asking for data from server, everything works fine. But to have any meaningful implementation, we need write some data. Or as they say in functional world, we need to have side effects. In GraphQL land, its called *Mutations*.

Mutations are a late addition to the spec and again simple enough. It just mandates client to say along with what they want to write to also mention how is that gonna change the overall system. I.e. there is `payload object` for every mutation request which clients should leverage to ask GraphQL server to fetch everything that that they think might have changed because of what they have done. At a client level it's somewhat similar to a Monadic system (without the required laws though) where the overall state is also part of the input & output.

Relay's take on mutations is still a bit rusty. Both at the spec level as well as in the current implementation. Having said that, I am pretty confident on the job the committers at Facebook and others in the open are doing.

The documentation around mutations in Relay is pretty weak. Other than [this video](https://www.youtube.com/watch?v=mmke4w4gc6c) and some posts explaining simple scenarios, the [official documentation](https://facebook.github.io/relay/docs/guides-mutations.html#content) and source code of [these examples](https://github.com/facebook/relay/tree/master/examples) as part of relay framework is the best we've got right now.

There are some important discussions around mutations is happening as Github issues and StackOverflow questions.

*I just want to reiterate, Relay (more than GraphQL) needs a different way of thinking in building client-server applications. I will surely have more to write on it (in much smaller doses than this one) as I tread deep into this land.*

Here are few of my realisations for now

---

- [Object Identification](https://facebook.github.io/relay/docs/graphql-object-identification.html#content) is an important concept when working with Relay-on-React(RoR). In almost all of the examples of Relay, the entry to the application happens by fetching a collection of a particular type which means that Relay store gets to know about the IDs of the individual instances.

 - These IDs as mentioned in the documentation are *opaque* which in other words is the domain agnostic way for both client and server to identify an instance. It's synonymous to ID column in databases (SQL & NOSQL both) which is different from the domain specific identification of the same instance.

 - Relay Store saves those IDs as `__dataID__` for each instance that it tracks and then use the same for all it's data fetching exercise like when some React component would want to get additional information of those instance or the instance changes state as a result of some mutation.

 - Unless the ID of an instance remains consistent to what Relay saves and what server sends, there will be weird warning / error messages from Relay. Or Relay won't bother creating the right query to GraphQL server. Which is more frustrating as I spent a lot of time debugging my application rather than looking at the request created by Relay.

 - A way that worked for me and I think something that is recommended when thinking in Relay is that

     - your instances are always expected be treated with an unique ID that follows a pattern and is different of from the domain specific identifier (if any)

      - the pattern is known to server so that it can be deciphered in the resolve function of your `Node` definition and the domain specific ID is used for further processing

     - Relay client should be unaware of the pattern so that the separation of concern remains intact

     - the same id, however, should be used whenever Relay client need to identify the instance e.g. in `getConfigs` method of `Mutation` class or a React component creating query `fragments` for relevant information of the same instance

     - Relay store internally maps the `id` field of the `Node` type (Relay specific interface for your GraphQL schema) to `__dataID__` and then use the same to track the same instance across the application boundaries. Our app need not concern with the internal representation but be very sure that the `id` of our instance is consistent & available to Relay store at all times. Best way to check the same is via [React Chrome Plugin](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) where we can see what `props` data Relay containers are having.

- [Mutation apis](https://facebook.github.io/relay/docs/api-reference-relay-mutation.html#content) at client side is still developing and some major updates are coming in future releases of relay. One confusing feature is the `RANGE_ADD` configuration for the Relay mutator

  - If as a result of a mutation, some new `edges` are added to an existing `connection` (Relay's way to represent the graph of associations between GraphQL types e.g. a `user` type has a connection `todos` to represent list of `todo` types), the mutation should have a `connectionEdge` as one of the output fields

  - the same edge then can be used in the `getFatQuery` and `getConfigs` function of the Mutation to ask Relay store to magically take care of replicating the same addition operation in it's store mimicking what happened at the server side. It's a really powerful feature but still has some rough edges especially when it throws weird warnings and fail silently. So here is what worked for me

     - the `RANGE_ADD` option for the mutator will only work for instances that are already getting tracked by Relay. In other words, if the `connection` in question is not queried before by any component then Relay is going to skip asking for it when it frames the final mutation query and show this weird warning - `newly created edge <edge_name> and its <node_name> field. Did you forget to update the RANGE_ADD mutation config?`.

      - Relay only looks for common fields when it does intersection between what's asked in the `getFatQuery` and what exactly it's components need as per their `getFragments` definition. So, check that the connection is at least used in one of the component's `fragments`.

     - in future updates the above warning message will be replaced with relevant message based on whether the problem is at the client end (i.e. when connection is never queried before being asked as part of the mutation) or at the server side when server is not including the new edge as part of the mutation payload. Check out [issue #542](https://github.com/facebook/relay/issues/542) for the discussion and [issue #574](https://github.com/facebook/relay/pull/574) for a possible implementation

      - in cases where you still need to get fields
in the mutation payload which are not being asked by any component, there is a new option `REQUIRED_CHILDREN` which would force Relay to include the relevant fields in its mutation query. Check out [issue #237](https://github.com/facebook/relay/issues/237)