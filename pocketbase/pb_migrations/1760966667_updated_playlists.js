/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.updateRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "1 = 1"
  collection.viewRule = "1 = 1"
  collection.updateRule = "@request.auth.id = owner"
  collection.deleteRule = "@request.auth.id = owner"

  return dao.saveCollection(collection)
})
