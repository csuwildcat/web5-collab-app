
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

const adminOrCreatorActions = [
  {
    who: 'author',
    of: 'community',
    can: 'write'
  },
  {
    who: 'author',
    of: 'community',
    can: 'delete'
  },
  {
    role: 'community/admin',
    can: 'write'
  },
  {
    role: 'community/admin',
    can: 'delete'
  }
];

const memberActions = [{
  role: 'community/member',
  can: 'write'
},
{
  role: 'community/member',
  can: 'delete'
}]

const channelTemplate = {
  $actions: adminOrCreatorActions,
  message: {
    $actions: [
      {
        who: 'author',
        of: 'community',
        can: 'write'
      },
      {
        who: 'recipient',
        of: 'community/channel/message',
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
      $actions: memberActions
    }
  }
};
const allMemberChannel = JSON.parse(JSON.stringify(channelTemplate));
      allMemberChannel.message.$actions.concat(memberActions)
      allMemberChannel.message.reaction.$actions.concat(memberActions)

const privateChannel = JSON.parse(JSON.stringify(channelTemplate))

privateChannel.participant = {
  $role: true,
  $actions: [
    {
      who: 'author',
      of: 'community/channel',
      can: 'write'
    },
    {
      who: 'author',
      of: 'community/channel',
      can: 'delete'
    },
    {
      role: 'community/channel/participant',
      can: 'write'
    },
    {
      role: 'community/channel/participant',
      can: 'delete'
    },
  ]
}

privateChannel.message.$actions.concat([{
  role: 'community/channel/participant',
  can: 'write'
},
{
  role: 'community/channel/participant',
  can: 'delete'
}])

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
    member: {
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
    community: {
      admin: {
        $contextRole: true,
        $actions: adminOrCreatorActions
      },
      member: {
        $contextRole: true,
        $actions: adminOrCreatorActions
      },
      overview: {
        $actions: adminOrCreatorActions
      },
      image: {
        $actions: adminOrCreatorActions
      },
      channel: allMemberChannel,
      convo: {
        $actions: [
          {
            role: 'community/member',
            can: 'write'
          }
        ],
        message: {
          $actions: [
            {
              who: 'author',
              of: 'community/convo',
              can: 'write'
            },
            {
              who: 'recipient',
              of: 'community/convo/message',
              can: 'write'
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
