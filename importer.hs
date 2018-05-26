{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE Rank2Types #-}

module Importer where

import           Control.Applicative (liftA2)
import           Control.Lens
import           Control.Monad (join)
import           Control.Monad.Except (runExceptT, ExceptT, liftIO)
import           Data.Aeson (FromJSON (..), Value, withObject, (.:))
import           Data.Aeson.Lens
import           Data.Aeson.Types (parseMaybe)
import           Data.Map
import           Data.Maybe (isJust, fromMaybe, catMaybes)
import           Data.Monoid ((<>))
import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import           Data.Time.Clock (UTCTime)
import           Data.Time.Format (parseTimeM, defaultTimeLocale, formatTime)
import qualified Data.Vector as V
import Text.Regex.PCRE



jsonFile :: FilePath
jsonFile = "/Users/kaushik/Developer/src/personal/blog-hakyll/kaushikc-org.ghost.2017-11-05.json"

getJSON :: IO T.Text
getJSON = TIO.readFile jsonFile

data Post = Post {
  postId      :: Int,
  title       :: T.Text,
  content     :: T.Text,
  date        :: T.Text,
  tags        :: Maybe [T.Text],
  url         :: T.Text,
  slug        :: T.Text,
  titleLink   :: Maybe T.Text
} deriving Show

bool :: a -> a -> Bool -> a
bool x _ False = x
bool _ y True  = y

totuple :: [a] -> Maybe (a,a)
totuple (x : y : _) = Just (x , y)
totuple _ = Nothing

checklinkedpost :: T.Text -> (T.Text , Maybe T.Text)
checklinkedpost s = let pat = "\\[(.*)\\]\\((.*)\\)" :: String
                        m = T.unpack s =~ pat :: MatchResult String

                        br :: (T.Text, Maybe T.Text)
                        br = maybe
                             (s, Nothing)
                             (\(a,b) -> (T.pack a, Just (T.pack b)))
                             (totuple $ mrSubList m)
                    in

                      bool (s,Nothing) br (not . Prelude.null $ mrMatch m)


instance FromJSON Post where
  parseJSON  = withObject "data" (
    \o -> do
      pid <- o .: "id"
      t <- o .: "title"
      c <- o .: "markdown"
      d <- o .: "published_at"
      s <- o .: "slug"
      let u = "http://kaushikc.org/" <> s
      let (tt, ml) = checklinkedpost t
      return $ Post pid tt c d Nothing u s ml)

tpair :: (AsValue t) => T.Text -> T.Text -> Fold t (Int, Value)
tpair l r = folding $ \v ->
  do
    i <- v ^? key l . _Integral
    n <- v ^? key r
    pure (i, n)

datestr :: UTCTime -> T.Text
datestr = T.pack . formatTime defaultTimeLocale "%0Y-%0m-%0d"

formatdate :: T.Text -> T.Text
formatdate = maybe ""
  datestr
  . (parseTimeM True defaultTimeLocale "%0Y-%0m-%0dT%H:%I:%S.000%Z" :: String -> Maybe UTCTime)
  . T.unpack

tshow :: Post -> T.Text
tshow p =
  "---" <> "\n"
  <> "title : " <> title p <> "\n"
  <> "published : " <> formatdate (date p) <> "\n"
  <> "tags : " <> maybe mempty (T.intercalate ",") (tags p) <> "\n"
  <> "link : " <> fromMaybe mempty (titleLink p) <> "\n"
  <> "---" <> "\n\n"
  <> content p

path :: Post -> FilePath
path p = T.unpack $ "./posts/" <> T.intercalate "-" (T.words $ slug p) <> ".md"

export :: V.Vector Post -> ExceptT String IO ()
export = liftIO . V.mapM_ (liftA2 TIO.writeFile path tshow)


main :: IO ()
main = do
 js <- getJSON

 let dataL = key "db" . nth 0 . key "data"
 let postsL =  dataL . key "posts"

 let posts :: Maybe (V.Vector Value)
     posts = js ^? ( postsL. _Array)

 let postsRec :: V.Vector (Maybe Post)
     postsRec = maybe V.empty (fmap (parseMaybe parseJSON)) posts

 let getTags :: [(Int, Value)]
     getTags = js ^.. (key "db" . values . key "data" . key "tags" . values . tpair "id" "name")

 let tagsMap :: Map Int Value
     tagsMap = fromList getTags

 let tag :: Maybe Int -> Maybe Value
     tag  = maybe Nothing (`Data.Map.lookup` tagsMap)

 let postTagTuple :: [(Int, Value)]
     postTagTuple = js ^.. (key "db" . values . key "data" . key "posts_tags" . values . tpair "post_id" "tag_id")

 let postTagsMap :: Map Int [Maybe T.Text]
     postTagsMap = (fmap.fmap) (join.fmap (^? _String)) (fromListWith (++) $ fmap (\(k, a) -> (k, pure $ tag $ a ^? _Integral)) postTagTuple)

 let populateTags :: Post -> Post
     populateTags p = let ts :: Maybe [T.Text]
                          ts = fmap catMaybes (Data.Map.lookup (postId p) postTagsMap)
                          islinked :: Bool
                          islinked = isJust (titleLink p)
                      in
                      p {tags = bool ts (("linked" :) <$> ts) islinked}

 let postsRecWithTags :: V.Vector (Maybe Post)
     postsRecWithTags = V.filter isJust $ (fmap.fmap) populateTags  postsRec

 e <- runExceptT $ export(fromMaybe V.empty $ sequence postsRecWithTags)

 case e of
   Right _ -> return ()
   Left er -> putStrLn er
