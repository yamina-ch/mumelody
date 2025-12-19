/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "sadbedxsf9g4ay8",
    "created": "2025-11-24 10:30:06.090Z",
    "updated": "2025-11-24 10:30:06.090Z",
    "name": "favorites",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "h438hmus",
        "name": "userId",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "kso2abvn",
        "name": "songId",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "759zsvfg",
        "name": "songData",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\" && @request.auth.id = userId",
    "updateRule": "@request.auth.id = userId",
    "deleteRule": "@request.auth.id = userId",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("sadbedxsf9g4ay8");

  return dao.deleteCollection(collection);
})
