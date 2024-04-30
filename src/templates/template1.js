export const template1 = {
  "tables": [
    {
      "id": "d1aaac11-9298-4b1f-b551-d341a106dbc9",
      "name": "customer",
      "x": 60,
      "y": 10,
      "comment": null,
      "fields": [
        {
          "id": "09241c02-5342-4e66-a89a-5e6e030557b1",
          "name": "id",
          "type": "int",
          "default": "",
          "pk": true,
          "notNull": true,
          "increment": true,
          "comment": ""
        },
        {
          "id": "f24b1de6-4db7-4e5c-b03f-c02d64ec050e",
          "name": "name",
          "type": "varchar(255)",
          "default": "",
          "pk": false,
          "notNull": true,
          "increment": false,
          "comment": ""
        },
        {
          "id": "b7991ac2-5560-4eba-aed0-371ccfd7e41b",
          "name": "address",
          "type": "varchar(1024)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "a17eecc2-18b0-48bc-b3f9-db618ddca6ba",
          "name": "email",
          "type": "varchar(255)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "c7ef9bad-2ae2-457c-b221-4bef293f8f55",
          "name": "phone",
          "type": "varchar(16)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        }
      ],
      "indices": [],
      "color": "#E4A62F"
    },
    {
      "id": "0c6320b3-6703-444b-a91f-55b4394a4a0b",
      "name": "order",
      "x": 340,
      "y": 10,
      "comment": null,
      "fields": [
        {
          "id": "9b020208-d8bb-4138-ac31-57cd490eacee",
          "name": "id",
          "type": "int",
          "default": "",
          "pk": true,
          "notNull": true,
          "increment": true,
          "comment": ""
        },
        {
          "id": "8873f84a-5833-42ea-b9f0-630e17c7ae11",
          "name": "date",
          "type": "datetime",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "19eea02d-94ca-4ad3-8d96-e86acd796f47",
          "name": "customer_id",
          "type": "int",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "df18fd40-f509-4bba-bee2-22bf847044bb",
          "name": "amount",
          "type": "decimal(10, 2)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "37ec96a3-43d1-4702-99d1-04a739aa06a3",
          "name": "product_id",
          "type": "int",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "f2d3646e-330d-48b8-9a9c-153668076ae0",
          "name": "created_at",
          "type": "datetime",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        }
      ],
      "indices": [],
      "color": "#DE65C3"
    },
    {
      "id": "040c3760-8b36-4a51-a08a-cb943bb4228b",
      "name": "product",
      "x": 340,
      "y": 300,
      "comment": null,
      "fields": [
        {
          "id": "4789688c-0339-45ea-b1cf-294110ef08c4",
          "name": "id",
          "type": "int",
          "default": "",
          "pk": true,
          "notNull": true,
          "increment": true,
          "comment": ""
        },
        {
          "id": "23d1a7c0-6e14-42cb-ba92-a46d2508bb0f",
          "name": "name",
          "type": "varchar(255)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "bd3fc62f-7732-411d-9f48-93f5e2cdebd3",
          "name": "description",
          "type": "text",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "6d54bc00-18e6-48d2-9793-0547c24d63dd",
          "name": "price",
          "type": "decimal(10, 2)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        },
        {
          "id": "2428cc19-d16a-4f4a-8aec-79cb8eab9233",
          "name": "category_id",
          "type": "int",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        }
      ],
      "indices": [],
      "color": "#4B81B0"
    },
    {
      "id": "bab47c88-c836-41d5-8661-672d4d3c7cc3",
      "name": "category",
      "x": 60,
      "y": 300,
      "comment": null,
      "fields": [
        {
          "id": "5a8c8479-b5ab-4c1e-a9e9-0e1c55ed2697",
          "name": "id",
          "type": "int",
          "default": "",
          "pk": true,
          "notNull": true,
          "increment": true,
          "comment": ""
        },
        {
          "id": "2e03d913-6f44-48eb-a591-b2d2e9c8bc13",
          "name": "name",
          "type": "varchar(255)",
          "default": "",
          "pk": false,
          "notNull": false,
          "increment": false,
          "comment": ""
        }
      ],
      "indices": [],
      "color": "#FFD700"
    }
  ],
  "relationships": [
    {
      "id": "de7d9a6b-ea54-406a-95bf-bbd553e82d5b",
      "fromTable": "0c6320b3-6703-444b-a91f-55b4394a4a0b",
      "fromField": "19eea02d-94ca-4ad3-8d96-e86acd796f47",
      "toTable": "d1aaac11-9298-4b1f-b551-d341a106dbc9",
      "toField": "09241c02-5342-4e66-a89a-5e6e030557b1"
    },
    {
      "id": "cb7d084a-241f-4093-b02b-1090578cffe1",
      "fromTable": "0c6320b3-6703-444b-a91f-55b4394a4a0b",
      "fromField": "37ec96a3-43d1-4702-99d1-04a739aa06a3",
      "toTable": "040c3760-8b36-4a51-a08a-cb943bb4228b",
      "toField": "4789688c-0339-45ea-b1cf-294110ef08c4"
    },
    {
      "id": "29a35b36-85c2-4b4e-8db9-63820d93b16c",
      "fromTable": "040c3760-8b36-4a51-a08a-cb943bb4228b",
      "fromField": "2428cc19-d16a-4f4a-8aec-79cb8eab9233",
      "toTable": "bab47c88-c836-41d5-8661-672d4d3c7cc3",
      "toField": "5a8c8479-b5ab-4c1e-a9e9-0e1c55ed2697"
    }
  ]
}