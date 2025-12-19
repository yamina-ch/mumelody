/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.createRule = "@request.auth.role = \"admin\""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.createRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
})
