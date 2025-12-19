/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "f0b77fxbiotks3x",
    "created": "2025-11-24 10:36:00.663Z",
    "updated": "2025-11-24 10:36:00.663Z",
    "name": "comments",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8bu1dbat",
        "name": "playlistId",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "o70dxzpf",
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
        "id": "xaiiw9wd",
        "name": "content",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 500,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_l4sQwDL` ON `comments` (\n  `playlistId`,\n  `userId`\n)"
    ],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\" && @request.auth.id = userId",
    "updateRule": "@request.auth.id = userId || @request.auth.role = \"admin\"",
    "deleteRule": "@request.auth.id = userId || @request.auth.role = \"admin\"",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("f0b77fxbiotks3x");

  return dao.deleteCollection(collection);
})
