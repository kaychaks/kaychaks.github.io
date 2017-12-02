--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Control.Monad           (forM)
import           Data.List               (groupBy, sort, sortBy)
import           Data.Maybe              (fromMaybe)
import           Data.Monoid             (mappend)
import           Data.Time.Clock         (UTCTime (..))
import           Data.Time.Format        (formatTime)
import           Data.Time.Locale.Compat (defaultTimeLocale)
import           Data.Tuple              (swap)
import           Hakyll


--------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    matchMetadata "posts/*" (elem ("linked" :: String) . getTagsFromMetadata) $ do
      route $ gsubRoute "posts/" (const "linked/") `composeRoutes` setExtension "html"
      compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/post.html" postCtx
        >>= loadAndApplyTemplate "templates/title.html" (boolField "linked" (const True) `mappend` postCtx)
        >>= saveSnapshot "postSave"
        >>= loadAndApplyTemplate "templates/default.html" postCtx
        >>= relativizeUrls

    matchMetadata "posts/*" (notElem ("linked" :: String) . getTagsFromMetadata) $ do
      route $ setExtension "html"
      compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/post.html" postCtx
        >>= loadAndApplyTemplate "templates/title.html" (boolField "linked" (const False) `mappend` postCtx)
        >>= saveSnapshot "postSave"
        >>= loadAndApplyTemplate "templates/default.html" postCtx
        >>= relativizeUrls

    create ["archive.html"] $ do
        route idRoute
        compile $ do
            postsGroup <- groupPostsByMonth =<< recentFirst =<< loadAll "posts/*"
            let archiveCtx =
                  listField "postGroup" postGroupCtx (return postsGroup) `mappend`
                  constField "title" (feedTitle feedConfig ++ " : Archive")            `mappend`
                  defaultContext

            makeItem ""
                >>= loadAndApplyTemplate "templates/archive.html" archiveCtx
                >>= loadAndApplyTemplate "templates/default.html" archiveCtx
                >>= relativizeUrls

    create ["atom.xml"] $ do
      route idRoute
      compile $ do
        let feedCtx = postCtx `mappend` bodyField "description"
        posts <- fmap (take 10) . recentFirst =<< loadAllSnapshots "posts/*" "postSave"
        renderAtom feedConfig feedCtx posts


    match "index.html" $ do
        route idRoute
        compile $ do
            posts <- fmap (take 10) . recentFirst =<< loadAllSnapshots "posts/*" "postSave"
            let indexCtx =
                    listField "posts" postCtx (return posts) `mappend`
                    constField "title" (feedTitle feedConfig) `mappend`
                    defaultContext

            getResourceBody
                >>= applyAsTemplate indexCtx
                >>= loadAndApplyTemplate "templates/default.html" indexCtx
                >>= relativizeUrls

    match "templates/*" $ compile templateBodyCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" `mappend`
    defaultContext

postGroupCtx :: Context ArchiveGroup
postGroupCtx = field "month" (return . month . fst . itemBody) `mappend`
               listFieldWith "posts" postCtx (return . snd . itemBody)


getTagsFromMetadata :: Metadata -> [String]
getTagsFromMetadata md =  fromMaybe [] $ (map trim . splitAll ",")  <$>  lookupString "tags" md


type ArchiveGroup = (UTCTime, [Item String])

groupPostsByMonth :: [Item String] -> Compiler [Item ArchiveGroup]
groupPostsByMonth xs = do
  mxs  <- forM xs (\it -> fmap (swap . (,) it)
                               (getItemUTC defaultTimeLocale $ itemIdentifier it))
  let gmxs = (transform . group) mxs
  traverse makeItem gmxs
 where

   sortFn :: (UTCTime, Item String) -> (UTCTime, Item String) -> Ordering
   sortFn (t1, _) (t2, _) = compare t1 t2

   group :: [(UTCTime, Item String)] -> [[(UTCTime, Item String)]]
   group = (sortBy sortFn <$>). groupBy (\a b -> month (fst a) == month (fst b))

   transform :: [[(UTCTime, Item String)]] -> [ArchiveGroup]
   transform = fmap transform'
     where
       transform' :: [(UTCTime, Item String)] -> ArchiveGroup
       transform' xss = foldl (\b a -> (fst b, snd a : snd b)) ((fst $ head xss , []) :: ArchiveGroup) xss

month :: UTCTime -> String
month = formatTime defaultTimeLocale "%B, %Y"

feedConfig :: FeedConfiguration
feedConfig = FeedConfiguration
  { feedTitle = "Kaushikc.Org"
  , feedDescription = "Kaushik Chakraborty's web blog"
  , feedAuthorName = "Kaushik Chakraborty"
  , feedAuthorEmail = "feed@kaushikc.org"
  , feedRoot = "kaushikc.org" }
