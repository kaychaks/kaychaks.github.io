--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Control.Monad           (forM)
import           Data.List               (groupBy, sortBy)
import           Data.Maybe              (fromMaybe)
import           Data.Monoid             (mappend)
import           Data.Time.Clock         (UTCTime (..))
import           Data.Time.Format        (formatTime,defaultTimeLocale)
import           Data.Tuple              (swap)
import           Hakyll
--------------------------------------------------------------------------------
main :: IO ()
main = hakyllWith defaultConfiguration {providerDirectory = "./public", destinationDirectory = "./site"} $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "webfonts/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route   idRoute
        compile compressCssCompiler

    match "resume.md" $ do
      route $ setExtension "html"
      compile $
       pandocCompiler >>=
       loadAndApplyTemplate "templates/resume-default.html" defaultContext
       

    tags <- buildTags "posts/*" (fromCapture "tags/*.html")

    tagsRules tags $ \t p -> do
      route idRoute
      compile $ do
        posts <- recentFirst =<< loadAll p
        let tagCtx =
              constField "title" t `mappend`
              listField "posts" postCtx (return posts) `mappend`
              defaultContext

        makeItem ""
          >>= loadAndApplyTemplate "templates/tag.html" tagCtx
          >>= loadAndApplyTemplate "templates/default.html" tagCtx
          >>= relativizeUrls

    create ["tags/index.html"] $ do
      route idRoute
      compile $
        renderTags
         (\a b c _ _ -> "<li><a href=" ++ b ++ ">" ++ a ++ " (" ++ show c ++ ")" ++ "</a></li>")
         (\xs -> "<article><ul>" ++ concat xs ++ "</ul></article>")
         tags
        >>= makeItem
        >>= loadAndApplyTemplate "templates/default.html" defaultContext
        >>= relativizeUrls

    matchMetadata "posts/*" (elem ("linked" :: String) . getTagsFromMetadata) $ do
      route $ gsubRoute "posts/" (const "linked/") `composeRoutes` setExtension "html"
      compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/post.html" (postCtxWithTags tags)
        >>= loadAndApplyTemplate "templates/title.html" (boolField "linked" (const True) `mappend` (postCtxWithTags tags))
        >>= saveSnapshot "postSave"
        >>= loadAndApplyTemplate "templates/default.html" (postCtxWithTags tags)
        >>= relativizeUrls

    matchMetadata "posts/*" (notElem ("linked" :: String) . getTagsFromMetadata) $ do
      route $ setExtension "html"
      compile $ pandocCompiler
        >>= loadAndApplyTemplate "templates/post.html" (postCtxWithTags tags)
        >>= loadAndApplyTemplate "templates/title.html" (boolField "linked" (const False) `mappend` (postCtxWithTags tags))
        >>= saveSnapshot "postSave"
        >>= loadAndApplyTemplate "templates/default.html" (postCtxWithTags tags)
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

    -- experimental micro blog
    match "micro-posts/*.md" $ do
      route $ gsubRoute "micro-posts/" (const "micro/") `composeRoutes` setExtension "html"
      compile $ do
          pandocCompiler
          >>= loadAndApplyTemplate "templates/micro-post-body.html" microPostCtx
          >>= saveSnapshot "microPostBodySave"
          >>= loadAndApplyTemplate "templates/micro-post.html" microPostCtx
          >>= saveSnapshot "microPostSave"
          >>= loadAndApplyTemplate "templates/micro-default.html" defaultContext
          >>= relativizeUrls

    match "micro-posts/index.html" $ do
      route $ gsubRoute "micro-posts/" (const "micro/")
      compile $
          do
            posts <- ( recentFirst =<< loadAllSnapshots "micro-posts/*.md" "microPostSave" ) :: Compiler [Item String]
            let indexCtx =
                  listField "posts" microPostCtx (return posts) `mappend`
                  constField "title" (feedTitle microFeedConfig) `mappend`
                  defaultContext
            getResourceBody
              >>= applyAsTemplate indexCtx
              >>= loadAndApplyTemplate "templates/micro-default.html" indexCtx
              >>= relativizeUrls

    create ["micro-posts/rss.xml"] $ do
      route $ gsubRoute "micro-posts/" (const "micro/")
      compile $ do
        let feedCtx = constField "title" "" <> postCtx <> bodyField "description"
        posts <- fmap (take 10) . recentFirst =<< loadAllSnapshots "micro-posts/*.md" "microPostBodySave"
        renderRss microFeedConfig feedCtx posts

    match "templates/*" $ compile templateBodyCompiler


--------------------------------------------------------------------------------
postCtx :: Context String
postCtx =
    dateField "date" "%B %e, %Y" `mappend`
    defaultContext

microPostCtx :: Context String
microPostCtx =
  dateField "date" "%FT%TZ" <>
  defaultContext

postCtxWithTags :: Tags -> Context String
postCtxWithTags t = tagsField "tags" t `mappend` postCtx

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

microFeedConfig :: FeedConfiguration
microFeedConfig = FeedConfiguration
  { feedTitle = "Kaushikc.Org Micro"
  , feedDescription = "Kaushik Chakraborty's micro blog"
  , feedAuthorName = "Kaushik Chakraborty"
  , feedAuthorEmail = "feed@kaushikc.org"
  , feedRoot = "https://kaushikc.org" }

feedConfig :: FeedConfiguration
feedConfig = FeedConfiguration
  { feedTitle = "Kaushikc.Org"
  , feedDescription = "Kaushik Chakraborty's web blog"
  , feedAuthorName = "Kaushik Chakraborty"
  , feedAuthorEmail = "feed@kaushikc.org"
  , feedRoot = "https://kaushikc.org" }
