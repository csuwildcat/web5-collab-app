
import { toWebStream } from "./streams";
import * as protocols from './protocols';

setInterval(() => Datastore.cache = {}, 1000 * 60 * 60)

class Datastore {

  static cache = {}
  static setCache(did, key, value){
    (Datastore.cache[did] || (Datastore.cache[did] = {}))[key] = value;
  }
  static getCache(did, key){
    return Datastore.cache?.[did]?.[key];
  }

  constructor(options){
    this.did = options.did;
    this.dwn = options.web5.dwn;
    this.ready = this.installProtocols();
  }

  async installProtocols(){
    console.log(protocols['sync']);
    const response = await this.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocols['sync'].uri
        }
      }
    });
    if (response.protocols.length) {
      return true;
    }
    else {
      console.log('installing');
      try {
        await Promise.all(
          Object.values(protocols).map(async _protocol => {

            const { protocol } = await this.dwn.protocols.configure({
              message: {
                definition: _protocol.definition
              }
            })
            await protocol.send(this.did);
          })
        )
        console.log('installed');
      }
      catch (e) {
        console.log(e);
        return false;
      }
    }
  }

  async getProtocol(protocolUri, options = {}){
    const params = {
      from: options.from,
      message: {
        filter: {
          protocol: protocolUri,
        }
      }
    }
    const { protocols, status } = await this.dwn.protocols.query(params);
    return { protocol: protocols[0], status };
  }

  async queryProtocolRecords(protocol, path, options = {}){
    await this.ready;
    const params = {
      message: {
        filter: {
          protocol: protocols[protocol].uri,
          protocolPath: path,
        }
      }
    }
    if (options.from) params.from = options.from;
    if (options.parentId !== undefined) {
      params.message.filter.parentId = options.parentId
    }
    if (options.published !== undefined) {
      params.message.filter.published = options.published
    }
    if (options.recipient !== undefined) {
      params.message.filter.recipient = options.recipient
    }
    if (options.sort || options.latestRecord) {
      params.message.dateSort = options.latestRecord ? 'createdDescending' : options.sort;
    }

    return this.dwn.records.query(params);
  }

  async readProtocolRecord(id, options = {}){
    await this.ready;
    const params = {
      message: {
        filter: {
          recordId: id
        }
      }
    }
    if (options.from) {
      params.from = options.from;
    }
    if (options.role) {
      params.message.protocolRole = options.role
    }
    const response = await this.dwn.records.read(params);
    console.log('read status: ', response.status);
    return response;
  }

  async createProtocolRecord(protocol, path, options = {}){
    await this.ready;
    const params = {
      message: {
        protocol: protocols[protocol].uri,
        protocolPath: path,
        schema: protocols[protocol][path.split('/').pop()]
      }
    }
    const schema = protocols[protocol].schemas[path.split('/').pop()];
    if (schema) params.message.schema = schema;
    if (options.from) params.from = options.from;
    if (options.parentId) params.message.parentId = options.parentId;
    if (options.contextId) params.message.contextId = options.contextId;
    if (options.data) params.data = options.data;
    if (options.dataFormat) params.message.dataFormat = options.dataFormat;
    if (options.published !== undefined) params.message.published = options.published;
    if (options.recipient) params.message.recipient = options.recipient;
    if (options.role) params.message.protocolRole = options.role;
    const response = await this.dwn.records.create(params);
    console.log('status', response.status);
    await response.record.send(this.did).then(e => {
      console.log('sent', response.record);
    }).catch(e => {
      console.log('send error', e)
    });
    console.log(response.record);
    return response;
  }

  async getSocial(options = {}) {
    await this.ready;
    const did = options.from || this.did;
    if (did !== this.did) {
      const cached = Datastore.getCache(did, 'social');
      if (cached) return cached;
    }
    const { records, status } = await this.queryProtocolRecords('profile', 'social', options)
    const latestRecord = records[0];
    if (!latestRecord) return;
    latestRecord.cache = {
      json: await latestRecord.data.json()
    }
    Datastore.setCache(did, 'social', latestRecord);
    return latestRecord;
  }

  async createSocial(options = {}) {
    const { record, status } = await this.createProtocolRecord('profile', 'social', {
      published: true,
      data: options.data,
      dataFormat: 'application/json'
    })
    record.cache = {
      json: await record.data.json()
    }
    return record;
  }

  // getPostsAfter = (options = {}) => {
  //   return this.queryProtocolRecords('profile', 'avatar', Object.assign({
  //     sort: 'createdDescending',
  //     filter: { datePublished: { from: randomDate } },
  //   }, options))
  // }

  async getAvatar(options = {}) {
    const { records, status } = await this.queryProtocolRecords('profile', 'avatar', options);
    return records[0];
  }

  createAvatar = async (options = {}) => {
    if (options.data) {
      options.dataFormat = options.data.type;
      if (options.data instanceof File) {
        options.data = new Blob([options.data], { type: options.dataFormat });
      }
    }
    options.published = true;
    const { record, status } = await this.createProtocolRecord('profile', 'avatar', options)
    return record;
  }

  async readAvatar(options = {}){
    await this.ready;
    const did = options.from = options.from || this.did;
    if (did !== this.did) {
      const cached = Datastore.getCache(did, 'avatar');
      if (cached) return cached;
    }
    const record = await this.getAvatar(options);
    const blob = await record.data.blob();
    record.cache = {
      blob: blob,
      uri: URL.createObjectURL(blob)
    }
    if (did !== this.did) Datastore.setCache(did, 'avatar', record);
    return record;
  }

  async setAvatar(file, _record, from = this.did){
    let record = _record || await datastore.getAvatar({ from });
    let blob = file ? new Blob([file], { type: file.type }) : undefined;
    try {
      if (blob) {
        if (record) await record.delete();
        record = await this.createAvatar({ data: blob, from });
        const { status } = await record.send(from);
      }
      else if (record) {
        blob = await record.data.blob();
      }
    }
    catch(e) {
      console.log(e);
    }
    if (record) {
      record.cache = record.cache || {};
      record.cache.blob = blob;
      record.cache.uri = blob ? URL.createObjectURL(blob) : undefined;
    }
    return record;
  }

  async createCommunity(options = {}) {
    const { record, status } = await this.createProtocolRecord('sync', 'community', Object.assign({
      dataFormat: 'application/json'
    }, options));
    record.cache = {
      json: await record.data.json()
    }
    return record;
  }

  async getCommunity (id, options = {}) {
    await this.ready;
    const { record, status } = await this.readProtocolRecord(id, options)
    console.log(status);
    if (status.code > 299) return status;
    record.cache = {
      json: await record.data.json()
    }
    return record;
  }

  async getCommunities (options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'community', options)
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data.json()
      }
    }))
    return records;
  }

  async createChannel(communityId, options = {}) {
    const { record, status } = await this.createProtocolRecord('sync', 'community/channel', Object.assign({
      parentId: communityId,
      contextId: communityId,
      dataFormat: 'application/json'
    }, options));
    record.cache = {
      json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
    }
    return record;
  }

  async getChannels (communityId, options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'community/channel', Object.assign({ parentId: communityId }, options))
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }))
    return records;
  }

  async getChannelMessages (channelId, options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'community/channel/message', Object.assign({ parentId: channelId }, options))
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }))
    return records;
  }

  async createChannelMessage(communityId, channelId, options = {}) {
    const { record, status } = await this.createProtocolRecord('sync', 'community/channel/message', Object.assign({
      contextId: communityId,
      parentId: channelId,
      dataFormat: 'application/json'
    }, options));
    record.cache = {
      json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
    }
    return record;
  }

  async createConvo(communityId, options = {}) {
    const { record, status } = await this.createProtocolRecord('sync', 'community/convo', Object.assign({
      contextId: communityId,
      parentId: communityId,
      dataFormat: 'application/json'
    }, options));
    record.cache = {
      json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
    }
    return record;
  }

  async getConvos (communityId, options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'community/convo', Object.assign({ parentId: communityId }, options))
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }))
    return records;
  }

  async addMember(recipient, communityId, options = {}) {
    const { record, status } = await this.createProtocolRecord('sync', 'community/member', Object.assign({
      recipient,
      parentId: communityId,
      contextId: communityId,
      dataFormat: 'application/json'
    }, options));
    record.cache = {
      json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
    }
    console.log(status);
    return record;
  }

  async getMember (recipient, communityId, protocolPath, options = {}) {
    const { records } = await this.queryProtocolRecords('sync', protocolPath || 'community/member', Object.assign({ recipient, parentId: communityId }, options))
    return records[0];
  }

  async getMembers (parentId, protocolPath, options = {}) {
    const { records } = await this.queryProtocolRecords('sync', protocolPath || 'community/member', Object.assign({ parentId }, options))
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }))
    return records;
  }

  async sendInvite(recipient, link, options = {}) {
    if (!options.skipCheck) {
      let invite = await this.getActiveInvite({ recipient });
      if (invite) {
        invite.cache = {
          json: await invite.data?.json()?.catch(e => {})?.then(obj => obj)
        }
        return invite;
      }
    }
    const { record, status: recordStatus } = await this.createProtocolRecord('sync', 'invite', Object.assign({
      recipient,
      store: false,
      dataFormat: 'application/json',
      data: { link }
    }, options));
    record.cache = {
      json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
    }
    const { status: sendStatus } = await record.send(recipient);
    console.log(sendStatus);
    if (sendStatus.code === 202) {
      console.log(record);
      const result = await record.store();
      console.log(result);
      return record;
    }
  }

  async getActiveInvite (options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'invite', options)
    const record = records.find(record => !record.isDeleted)
    if (record) {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }
    return record;
  }

  async getInvites (options = {}) {
    const { records } = await this.queryProtocolRecords('sync', 'invite', options)
    await Promise.all(records.map(async record => {
      record.cache = {
        json: await record.data?.json()?.catch(e => {})?.then(obj => obj)
      }
    }))
    return records;
  }

  // async toggleFollow(did, follow){
  //   await datastore.queryFollows({ recipient: did, latestRecord: true }).then(async (record) => {
  //     if (record) {
  //       console.log(record);
  //       if (follow && record.isDeleted) record.update();
  //       else if (!follow) {
  //         const { record: deleted } = await this.dwn.records.delete({
  //           message: {
  //             recordId: record.id,
  //           }
  //         });
  //         record = deleted;
  //       }
  //       return record;
  //     }
  //     else {
  //       const { record, status } = await datastore.createProtocolRecord('sync', 'follow', { recipient: did, dataFormat: 'application/json' })
  //       return record;
  //     }
  //   })
  // }

}


export {
  Datastore
}