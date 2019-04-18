---
title: "Logical equivalences in Haskell"
published: 2019-01-03
tags: technology , haskell
link: 
---

The blogpost [Classical Logic in Haskell](https://cvlad.info/clasical-logic-in-haskell/) established a way to prove equivalences between logical propositions and _law of excluded middle_ by writing intances of `Iso` for the same propositions wrapped in a `newtype`. [Vladimir's](https://twitter.com/cvlad) post contain proofs of some important propositions. I had fun proving them myself. I wanted to continue with some more. 

Recently, I did the [Logic and Proof](https://leanprover.github.io/logic_and_proof/) course to learn both proof techniques and [Lean](https://leanprover.github.io/) theorem prover. It was fun. So I picked few propositions from the exercises of the [Propositional Logic in Lean](https://leanprover.github.io/logic_and_proof/propositional_logic_in_lean.html#exercises) chapter to try write equivalence proofs for them.

Below are the propositions as newtypes (their logical notations mentioned as comment) and subsequently the `Iso` instances to prove their equivalences with `Lem`. As mentioned in the original blogpost, one nice way to progress here is by taking clues from the type system itself in the form of [typed holes](https://wiki.haskell.org/GHC/Typed_holes).

Let's set some language pragmas


```haskell
:set -XMultiParamTypeClasses
:set -XRankNTypes
:set -XInstanceSigs
:set -XScopedTypeVariables
:set -XTupleSections
```

Required `Iso` class from the original blogpost put inside a module so that it can be imported for rest of the sections


```haskell
module Proof where
import Data.Void (Void, absurd)

class Iso a b where
    to :: a -> b
    from :: b -> a
    
-- Law of excluded middle
-- forall P. P \/ -P
newtype Lem m = 
    Lem
        (forall a .
            m (Either a (a -> m Void)))    
```


```haskell
import Data.Void
import Proof
```

And now the propositions...


```haskell
-- forall. P,Q. P /\ (P -> Q) -> Q

import Control.Monad.Fix

newtype Prop1 m = 
    Prop1 
        (forall a b. 
            (a , (a -> m b)) -> m b)
            
-- proof, implication elimination <==> LEM
instance Monad m => Proof.Iso (Prop1 m) (Lem m) where
    from :: Lem m -> Prop1 m
    from _ = Prop1 $ uncurry (flip id)
            
    to :: Prop1 m -> Lem m
    to (Prop1 i) = Lem $ fmap Left $ i (id, pure . fix)
```


```haskell
-- forall. P,Q. P -> - (- P /\ B)

newtype Prop2 m = 
    Prop2
        (forall a b.
            (a -> m (((a -> m Void), b) -> m Void)))
            
-- proof, Prop2 <==> LEM
instance Monad m => Proof.Iso (Prop2 m) (Lem m) where
    to :: Prop2 m -> Lem m
    to (Prop2 p) = Lem $ pure $ Right proof where
        proof :: a -> m Void
        proof x = p x >>= ($ (proof, x))
    
    from :: Lem m -> Prop2 m
    from (Lem l) = Prop2 $ flip fmap l . proof where
        proof :: a -> Either a (a -> m Void) -> (((a -> m Void), b) -> m Void)
        proof x = either (flip fst) (\f _ -> f x)
        
```


```haskell
-- forall. P,Q. - (P /\ Q) -> (P -> - Q)
import Control.Applicative (liftA2)

newtype Prop3 m = 
    Prop3
        (forall a b.
            ((a,b) -> m Void) -> m (a -> m (b -> m Void)))
            
-- proof, Prop3 <==> LEM
instance Monad m => Proof.Iso (Prop3 m) (Lem m) where
    to :: Prop3 m -> Lem m
    to (Prop3 p) = Lem 
                    $ fmap Right 
                    $ proof 
                        >>= 
                        (\f -> pure (liftA2 (>>=) f (flip id))) 
                where
                proof :: m (a -> m (a -> m Void))
                proof = p (\(x,y) -> proof >>= (($ y) =<<) . ($ x))
        
    from :: Lem m -> Prop3 m
    from (Lem l) = Prop3
                    $ (\f ->
                            pure
                                $ \a ->
                                    either (const . f . (a ,)) id <$> l)
```


```haskell
-- forall. P,Q. -P /\ -Q -> - (P \/ Q)

newtype Prop4 m = 
    Prop4
        (forall a b.
            ((a -> m Void , b -> m Void) -> m (Either a b ->  m Void)))
            
-- proof, Prop4 <==> LEM
instance Monad m => Proof.Iso (Prop4 m) (Lem m) where
    to :: Prop4 m -> Lem m
    to (Prop4 p) = Lem 
                    $ pure 
                    $ Right 
                        ((proof >>=) . flip id . Left)
                where
                proof :: m (Either a a -> m Void)
                proof = curry p ((proof >>=)
                                . flip id
                                . Left) 
                                ((proof >>=)
                                . flip id
                                . Right)
        
    from :: Lem m -> Prop4 m
    from _ = Prop4 $ uncurry $ (pure .) . either
```

---

_This is an [IHaskell Notebook](https://github.com/kaychaks/notebooks/blob/master/logical-equivalences-in-haskell.ipynb) which is pretty cool for above kind of experiments. Much more feature rich than GHCi. I got the inspiration from [Vaibhav Sagar](https://twitter.com/vbhvsgr) who writes [all his posts](https://vaibhavsagar.com/) as IHaskell Notebooks._
