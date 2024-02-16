import { LitElement, html, css, render, unsafeCSS } from 'lit';
import { consume } from '@lit/context';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query, property } from 'lit/decorators.js';

import { AppContext } from '../utils/context.js';

import '@vaadin/message-input/theme/lumo/vaadin-message-input.js';
import '@vaadin/message-list/theme/lumo/vaadin-message.js';
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

const transitionDuration = 200;

@customElement('community-channel')
export class CommunityChannel extends LitElement {

  @consume({context: AppContext, subscribe: true})
  context;

  static styles = [
    unsafeCSS(PageStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      #header {
        display: flex;
        align-items: center;
        min-height: 3em;
        padding: 0 1em;
        background: rgba(255,255,255,0.075);
        box-shadow: 0 0 3px 0px rgba(0,0,0,0.5);
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }

      #header h3 {
        margin: 0;
      }

      #header h3:before {
        content: '# ';
      }

      #messages_wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
      }

      #message_list {
        position: relative;
        flex: 1;
        padding: 0 0.25em;
      }

      #message_list * {
        overflow-anchor: none;
      }

      vaadin-message::part(content) {
        font-size: 90%;
      }

      vaadin-message::part(header) {
        max-width: 350px;
        font-size: 90%;
        opacity: 0.5;
      }

      vaadin-message::part(name) {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      vaadin-message::part(time) {
        font-size: 85%;
      }

      /* vaadin-message::part(message) {
        font-size: 90%;
      } */

      #message_input {
        /* max-width: 900px; */
      }

      #spinner {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        background: var(--body-bk);
        inset: 0;
        opacity: 0;
        transition: opacity ${transitionDuration}ms ease;
        z-index: 1000;
        pointer-events: none;
      }

      #spinner[show] {
        opacity: 1;
        pointer-events: all;
      }

      @media(max-width: 500px) {

      }
    `
  ]

  @property({ type: Array })
  messages = [];

  @property({ type: String })
  community;

  @property({ type: String })
  channel;

  @query('#message_list', true)
  messageList;

  @query('#spinner', true)
  spinner;

  firstUpdated(){
    this.messageList.renderer = this.renderMessage;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('channel') && this.channel) {
      this.loadMessages(this.channel);
    }
  }

  async loadMessages(channelId){
    if (!channelId) {
      this.messages = [];
      return;
    }
    this?.spinner?.setAttribute?.('show', '')
    this.messages = (await Promise.all([
      await datastore.getChannelMessages(channelId),
      DOM.delay(transitionDuration)
    ]))[0]
    if (this.messageList) this.messageList.items = [...this.messages];
    this?.spinner?.removeAttribute?.('show');
  }

  renderMessage(root, list, { item: record, index }) {
    const data = record.cache.json;
    render(
      html`<vaadin-message
            time="${date.print(record.dateCreated, true)}"
            user-name = "${record.author}">${data.body}
          </vaadin-message>`,
      root
    );
  };

  async submitMessage(e){
    const message = e.detail.value;
    const record = await datastore.createChannelMessage(this.community, this.channel, {
      data: {
        body: message
      }
    });
    this.messageList.items = this.messages = this.messages.concat([record]);
    this.messageList.requestContentUpdate();
  }

  render() {
    const channelData = this.context.channels.get(this.channel)?.cache?.json;
    return html`
      <header id="header">
        ${channelData?.name ? html`<h3>${channelData.name}</h3>` : '' }
      </header>
      <div id="messages_wrapper">
        <vaadin-virtual-list id="message_list" .items="${this.messages}"><div anchor></div></vaadin-virtual-list>
        <vaadin-message-input id="message_input" @submit="${this.submitMessage}"></vaadin-message-input>
        <div id="spinner"><sl-spinner></sl-spinner></div>
      </div>
    `;
  }

}