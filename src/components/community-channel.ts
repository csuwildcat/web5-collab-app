import { LitElement, html, css, render, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import { AppRoutes } from '../components/router';


import '@vaadin/message-input/theme/lumo/vaadin-message-input.js';
import { VirtualList } from '@vaadin/virtual-list';

Object.defineProperty(VirtualList, 'template', {
  get: function() {
    const template = document.createElement('template');
          template.innerHTML = `
            <div id="items" style="overflow-anchor: none;">
              <slot></slot>
            </div>
            <div style="height: 1px; overflow-anchor: auto;"></div>
          `;
    return template;
  }
});

import PageStyles from  '../styles/page.css';
import { DOM, notify } from '../utils/helpers';
import date from  '../utils/date.js';

const messageListTransitionDuration = 300;

@customElement('community-channel')
export class CommunityChannel extends LitElement {

  static styles = [
    unsafeCSS(PageStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      #message_list {
        position: relative;
        flex: 1;
        padding: 0 1.1em;
      }

      #message_list * {
        overflow-anchor: none;
      }

      #message_list_spinner {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        background: var(--body-bk);
        inset: 0;
        opacity: 0;
        transition: opacity ${messageListTransitionDuration}ms ease;
        z-index: 1000;
        pointer-events: none;
      }

      #message_list_spinner[show] {
        opacity: 1;
        pointer-events: all;
      }

      @media(max-width: 500px) {

      }
    `
  ]

  @query('#message_list', true)
  messageList;

  @query('#message_list_spinner', true)
  messageListSpinner;

  constructor() {
    super();
    this.messages = [];
    this.initialize();
  }

  static properties = {
    community: { type: String, reflect: true },
    channel: { type: String, reflect: true },
  };

  // private routes = new AppRoutes(this, [
  //   {
  //     path: 'threads/:thread',
  //     component: '#channel',
  //   },
  // ]);

  async initialize(){
    await datastore.ready;
  }

  firstUpdated(){
    this.messageList.renderer = this.renderMessage;
  }

  #community = '';
  get community() {
    return this.#community;
  }
  set community(id) {
    console.log(id);
    this.#community = id;
  }

  #channel = '';
  get channel() {
    return this.#channel;
  }
  set channel(id) {
    const previousId = this.#channel;
    this.#channel = id;
    this.messagesLoading = this.loadMessages(this.#channel);
  }

  async loadMessages(channel){
    this?.messageListSpinner?.setAttribute?.('show', '')
    const messages = (await Promise.all([
      await datastore.getChannelMessages(channel),
      DOM.delay(messageListTransitionDuration)
    ]))[0]
    if (channel === this.#channel) {
      this.messages = messages;
      if (this.messageList) this.messageList.items = [...this.messages];
    }
    this.requestUpdate('messages');
  }

  renderMessage(root, list, { item: record, index }) {
    const data = record.cache.json;
    render(html`#${date.toTimeDate(record.dateCreated)}: ${data.body}`, root);
  };

  async submitMessage(e){
    const message = e.detail.value;
    const record = await datastore.createChannelMessage(this.#community, this.#channel, {
      data: {
        body: message
      }
    });
    this.messageList.items = this.messages = this.messages.concat([record]);
    this.messageList.requestContentUpdate();
  }

  render() {
    return html`
      <vaadin-virtual-list id="message_list" .items="${this.messages}"><div anchor></div></vaadin-virtual-list>
      <vaadin-message-input @submit="${this.submitMessage}"></vaadin-message-input>
      <div id="message_list_spinner"><sl-spinner></sl-spinner></div>
    `;
  }

  async updated(props){
    super.updated(props);
    if (props.has('messages')) {
      await this.messagesLoading;
      this.messageListSpinner.removeAttribute('show');
    }
  }

}

// const animationFinished = this?.messageList?.animate?.([{ opacity: 0 }], { duration: 200, fill: 'forwards' })?.finished || Promise.resolve(true);
// this.messages = await datastore.getChannelMessages(this.#channel);
// this.requestUpdate();
// await animationFinished;
// this.messageList.animate([{ opacity: 1 }], { duration: 200, fill: 'forwards' });


// async loadMessages(){
//   this?.messageList?.removeAttribute?.('show')
//   this.messages = await datastore.getChannelMessages(this.#channel);
//   if (this.messageList) this.messageList.items = [...this.messages];
//   this.requestUpdate();
// }

// renderMessage(root, list, { item: record, index }) {
//   const data = record.cache.json;
//   root.textContent = `#${date.toTimeDate(record.dateCreated)}: ${data.body}`;
// };

// async submitMessage(e){
//   const message = e.detail.value;
//   const record = await datastore.createChannelMessage(this.#community, this.#channel, {
//     data: {
//       body: message
//     }
//   });
//   this.messageList.items = this.messages = this.messages.concat([record]);
//   this.messageList.requestContentUpdate();
// }

// render() {
//   return html`
//     <vaadin-virtual-list id="message_list" .items="${this.messages}"></vaadin-virtual-list>
//     <vaadin-message-input @submit="${this.submitMessage}"></vaadin-message-input>
//     <!-- <div id="spinner_overlay"><sl-spinner></sl-spinner></div> -->
//   `;
// }

