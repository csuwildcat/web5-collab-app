
function addSchemas(config) {
  const types = config.types;
  const protocolUri = config.protocol;
  return Object.entries(types).reduce((result, [key, value]) => {
    if (value.dataFormats.length === 1) {
      result[key] = types[key].schema = protocolUri + '/schemas/' + key;
    }
    return result;
  }, {})
}

const adminOrCreator = [
  {
    who: 'author',
    of: 'community',
    can: 'write'
  },
  {
    role: 'community/admin',
    can: 'write'
  }
];

const appDefinition = {
  published: true,
  protocol: 'https://slick.app',
  types: {
    invite: {
      dataFormats: ['application/json']
    },
    community: {
      dataFormats: ['application/json']
    },
    overview: {
      dataFormats: ['application/json']
    },
    channel: {
      dataFormats: ['application/json']
    },
    message: {
      dataFormats: ['application/json']
    },
    image: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg']
    },
    media: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg', 'video/mp4']
    },
    reaction: {
      dataFormats: ['application/json']
    },
    admin: {
      dataFormats: ['application/json']
    },
    participant: {
      dataFormats: ['application/json']
    },
    task: {
      dataFormats: ['application/json']
    }
  },
  structure: {
    task: {},
    invite: {
      $actions: [
        {
          who: 'anyone',
          can: 'write'
        }
      ]
    },
    friend: {
      $globalRole: true
    },
    community: {
      admin: {
        $contextRole: true,
        $actions: [
          {
            who: 'author',
            of: 'community',
            can: 'write'
          },
          {
            role: 'community/admin',
            can: 'write'
          }
        ]
      },
      participant: {
        $contextRole: true,
        $actions: adminOrCreator
      },
      overview: {
        $actions: adminOrCreator
      },
      image: {
        $actions: adminOrCreator
      },
      channel: {
        $actions: [
          {
            who: 'anyone',
            can: 'write'
          },
          {
            role: 'community/admin',
            can: 'write'
          },
          {
            role: 'community/admin',
            can: 'delete'
          }
        ],
        message: {
          $actions: [
            {
              who: 'anyone',
              can: 'write'
            },
            {
              role: 'community/admin',
              can: 'write'
            },
            {
              role: 'community/participant',
              can: 'write'
            },
            {
              role: 'community/admin',
              can: 'delete'
            },
            {
              role: 'community/participant',
              can: 'delete'
            }
          ],
          media: {
            $actions: [
              {
                who: 'author',
                of: 'community/channel/message',
                can: 'write'
              }
            ]
          },
          reaction: {
            $actions: [
              {
                who: 'anyone',
                can: 'write'
              }
            ]
          }
        }
      },
      convo: {
        $actions: [
          {
            role: 'community/admin',
            can: 'write'
          },
          {
            role: 'community/admin',
            can: 'delete'
          }
        ],
        message: {
          $actions: [
            {
              who: 'recipient',
              of: 'community/convo/message',
              can: 'write'
            },
            {
              who: 'author',
              of: 'community/convo/message',
              can: 'delete'
            }
          ],
          media: {
            $actions: [
              {
                who: 'author',
                of: 'community/convo/message',
                can: 'write'
              }
            ]
          },
          reaction: {
            $actions: [
              {
                who: 'recipient',
                of: 'community/convo/message',
                can: 'write'
              }
            ]
          }
        }
      }
    }
  }
}

export const sync = {
  uri: appDefinition.protocol,
  schemas: addSchemas(appDefinition),
  definition: appDefinition
}

const profileDefinition = {
  published: true,
  protocol: "https://areweweb5yet.com/protocols/profile",
  types: {
    name: {
      dataFormats: ['application/json']
    },
    social: {
      dataFormats: ['application/json']
    },
    messaging: {
      dataFormats: ['application/json']
    },
    phone: {
      dataFormats: ['application/json']
    },
    address: {
      dataFormats: ['application/json']
    },
    avatar: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg']
    },
    hero: {
      dataFormats: ['image/gif', 'image/png', 'image/jpeg']
    }
  },
  structure: {
    social: {},
    avatar: {},
    hero: {},
    name: {},
    messaging: {},
    address: {},
    phone: {}
  }
}

export const profile = {
  uri: profileDefinition.protocol,
  schemas: addSchemas(profileDefinition),
  definition: profileDefinition
}
