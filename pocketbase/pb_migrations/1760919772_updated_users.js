/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.viewRule = "@request.auth.id = id"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "l1vk5xhp",
    "name": "plan",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Free",
        "Premium",
        "Family"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.viewRule = "@request.auth.id != \"\""

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "l1vk5xhp",
    "name": "plan",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Free Premium Family"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
