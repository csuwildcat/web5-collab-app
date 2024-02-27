import { createContext, provide } from '@lit/context';

const initialState = {
  instance: null,
  did: null,
  avatar: null,
  social: null,
  community: null,
  channel: null,
  communities: new Map(),
  channels: new Map(),
  convos: new Map(),
  invites: [],
};

export const AppContext = createContext(initialState);

export const AppContextMixin = (BaseClass) => class extends BaseClass {

  constructor(){
    super();
    this.context = {
      instance: this,
      did: null,
      avatar: null,
      social: null,
      community: null,
      channel: null,
      communities: new Map(),
      channels: new Map(),
      convos: new Map(),
      invites: [],
    }
  }

  loadProfile(did){
    if (did === this.context.did) return;
    this.context.did = did;
    clearInterval(this.context.inviteChron);
    return this.context.profileReady = new Promise(async resolve => {
      const records = await Promise.all([
        datastore.setAvatar(null, null, did),
        await datastore.getSocial({ from: did }) || datastore.createSocial({ data: {
          displayName: '',
          bio: '',
          apps: {}
        }, from: did }),
        this.loadInvites(did, false)
      ])
      this.context.inviteChron = setInterval(() => this.loadInvites(), 1000 * 30)
      this.updateState({
        did,
        avatar: records[0],
        social: records[1]
      });
      resolve(this.context.did);
    });
  }

  async setAvatar(file){
    const record = await datastore.setAvatar(file, this.context.avatar, this.context.did);
    this.updateState({ avatar: record });
    return record;
  }

  async setSocial(data){
    const record = this.context.social;
    await record.update({ data });
    record.send(this.context.did);
    this.updateState({ social: record });
    return record;
  }

  async loadCommunities(){
    const communities = await datastore.getCommunities();
    await Promise.all(communities.map(async community => {
      return community.logo = await datastore.getCommunityLogo(community.id, { from: community.author });
    })).then(logos => {
      this.requestUpdate()
    });
    this.updateState({
      communities: new Map(communities.map(community => [community.id, community]))
    })
  }

  async loadChannels(){
    const channels = await datastore.getChannels(this.context.community.id);
    this.context.channels = new Map(channels.map(channel => [channel.id, channel]));
  }

  async loadConvos(){
    const convos = await datastore.getConvos(this.context.community.id);
    this.context.convos = new Map(convos.map(convo => [convo.id, convo]));
  }

  async loadInvites(_did, update) {
    const did = this.context.did || _did;
    const invites = await datastore.getInvites({ from: did, recipient: did });
    this.context.invites = invites;
    if (invites && update !== false) this.updateState({ invites: invites });
  }

  async setCommunity(communityId, channelId){
    if (!this.context.communities.size) return;
    const community = this.context.communities.get(communityId);
    if (!community) {
      this.updateState({
        community: null,
        channel: null,
        channels: new Map(),
        convos: new Map()
      })
      return;
    }
    this.context.community = community;
    await Promise.all([
      this.loadChannels(),
      this.loadConvos()
    ])
    this.context.channel = null;
    this.context = { ...this.context };
    const channel = channelId || this.getChannel(community.id);
    if (channel) this.setChannel(channel, true);
    else this.requestUpdate();
  }

  async setCommunityLogo(communityId, logo){
    const community = this.context.communities.get(communityId);
    community.logo = logo;
    this.context = { ...this.context };
    this.requestUpdate();
  }

  async installCommunity(id, from){
    try {
      const [community, admins, member, channels] = await Promise.all([
        datastore.getCommunity(id, { from, role: 'community/member', cache: false }),
        datastore.getAdmins(id, { from, cache: false }),
        datastore.getMember(this.context.did, id, { from, cache: false }),
        datastore.getChannels(id, { from, role: 'community/member', cache: false })
      ]);
      await Promise.all([
        community.import(),
        admins.map(z => z.import()),
        member.import(),
        channels.map(z => z.import()),
      ].flat())
      await this.setCommunity(id);
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  getChannel(community){
    let activeChannels = localStorage.activeChannels;
    return (activeChannels ? JSON.parse(activeChannels) : {})[community];
  }

  getChannels(){
    let activeChannels = localStorage.activeChannels;
    return activeChannels ? JSON.parse(activeChannels) : {};
  }

  async setChannel(channelId, isActive){
    const community = this.context.community;
    if (community) {
      let activeChannels = localStorage.activeChannels;
          activeChannels = activeChannels ? JSON.parse(activeChannels) : {};
      activeChannels[community.id] = channelId;
      localStorage.activeChannels = JSON.stringify(activeChannels);
      if (isActive) {
        this.updateState({ channel: channelId });
      }
    }
  }

  addCommunity(community) {
    const updatedMap = new Map(this.context.communities);
    updatedMap.set(community.id, community);
    this.updateState({ communities: updatedMap }, false);
    this.setCommunity(community.id);
  }

  addChannel(channel) {
    const updatedMap = new Map(this.context.channels);
    updatedMap.set(channel.id, channel);
    this.setChannel(channel.id, true);
    this.updateState({ channels: updatedMap });
  }

  addConvo(convo) {
    const updatedMap = new Map(this.context.convos);
    updatedMap.set(convo.id, convo);
    this.updateState({ convos: updatedMap });
  }

  updateState(partialState, render) {
    this.context = { ...this.context, ...partialState };
    if (render !== false) this.requestUpdate();
  }
}