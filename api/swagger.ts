
export const swaggerDocument = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "In Court Presentation API",
    description: "A Node Js Application that facilitates the creation, management and hosting of In Court Presentation sessions on a web socket server",
  },
  paths: {
    "/health": {
      get: {
        summary: "Check the status of the service",
        consumes: [
          "application/json",
        ],
        produces: [
          "application/json",
        ],
        responses: {
          200: {
            description: "Successful Operation",
            schema: {
              "$ref": "#/definitions/Health",
            },
          },
        },
      },
    },
    "/icp/sessions/:caseId": {
      get: {
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "description": "Users Auth token",
            "required": true,
            "type": "string",
          },
          {
            "name": "caseId",
            "in": "path",
            "description": "Case ID that ICP session relates to",
            "required": true,
            "type": "string",
          },
        ],
        summary: "Check whether an In Court Presentation session exists for provided case id, if one does return it, else create one and return it",
        consumes: [
          "application/json",
        ],
        produces: [
          "application/json",
        ],
        responses: {
          200: {
            description: "successful operation",
            schema: {
              "$ref": "#/definitions/SessionsResponse",
            },
          },
          400: {
            "$ref": "#/responses/400",
          },
          401: {
            "$ref": "#/responses/401",
          },
          500: {
            "$ref": "#/responses/500",
          },
        },
      },
    },
  },
  definitions: {
    Health: {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "UP",
            "DOWN",
          ],
        },
        "redis": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "enum": [
                "UP",
                "DOWN",
              ],
            },
          },
        },
        "buildInfo": {
          "type": "object",
          "properties": {
            "environment": {
              "type": "string",
            },
            "project": {
              "type": "string",
            },
            "name": {
              "type": "string",
            },
            "version": {
              "type": "string",
            },
            "commit": {
              "type": "string",
            },
            "date": {
              "type": "string",
            },
          },
        },
      },
    },
    SessionsResponse: {
      "type": "object",
      "properties": {
        "username": {
          "type": "string",
        },
        "session": {
          "type": "object",
          "properties": {
            "sessionId": {
              "type": "string",
            },
            "caseId": {
              "type": "string",
            },
            "dateOfHearing": {
              "type": "string",
            },
          },
        },
      },
    },
    Error: {
      "type": "object",
      "properties": {
        "error": {
          "type": "string",
        },
      },
    },
  },
  responses: {
    400: {
      "description": "Bad Request",
      "schema": {
        "$ref": "#/definitions/Error",
      },
    },
    401: {
      "description": "Unauthorized",
      "schema": {
        "$ref": "#/definitions/Error",
      },
    },
    404: {
      "description": "Not Found",
      "schema": {
        "$ref": "#/definitions/Error",
      },
    },
    500: {
      "description": "Internal Server Error",
      "schema": {
        "$ref": "#/definitions/Error",
      },
    },
  },
};
