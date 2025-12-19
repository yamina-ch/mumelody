/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "@request.auth.id != \"\" && owner = @request.auth.id\n"
  collection.viewRule = "@request.auth.id != \"\" && owner = @request.auth.id\n"
  collection.createRule = "@request.auth.id != \"\""
  collection.updateRule = "owner = @request.auth.id"
  collection.deleteRule = "owner = @request.auth.id\n"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d9pv9wgiv7vdk6i")

  collection.listRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.createRule = "@request.auth.role = \"\""
  collection.updateRule = "@request.auth.role = \"\" || owner = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"\" || owner = @request.auth.id"

  return dao.saveCollection(collection)
})
