/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("f0b77fxbiotks3x")

  collection.indexes = [
    "CREATE INDEX `idx_comments_playlist` ON `comments` (`playlistId`)",
    "CREATE INDEX `idx_comments_user` ON `comments` (`userId`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("f0b77fxbiotks3x")

  collection.indexes = [
    "CREATE INDEX `idx_comments_playlist` ON `comments` (`playlistId`)"
  ]

  return dao.saveCollection(collection)
})
