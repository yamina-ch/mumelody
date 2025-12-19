/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("sadbedxsf9g4ay8")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_favorites_user_song` ON `favorites` (\n  `userId`,\n  `songId`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("sadbedxsf9g4ay8")

  collection.indexes = []

  return dao.saveCollection(collection)
})
