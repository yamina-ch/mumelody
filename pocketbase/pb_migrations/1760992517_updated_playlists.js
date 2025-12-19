/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.createRule = "@request.auth.role = \"\""
  collection.updateRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"\" || owner = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.createRule = "@request.auth.role = \"admin\""
  collection.updateRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"admin\" || owner = @request.auth.id"

  return dao.saveCollection(collection)
})
