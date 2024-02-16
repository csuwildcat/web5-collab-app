import { LitElement, html, css, render, nothing, unsafeCSS } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import PageStyles from  '../styles/page.css';
import { DOM, notify } from '../utils/helpers';
import date from  '../utils/date.js';

const transitionDuration = 200;

@customElement('member-list')
export class MemberList extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    css`
      :host {
        position: relative
      }

      vaadin-message {
        padding: 0 0 0.5em;
      }

      vaadin-message::part(content) {
        min-width: 0;
        font-size: 90%;
      }

      vaadin-message::part(header) {
        font-size: 90%;
      }

      vaadin-message::part(name) {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      vaadin-message::part(time) {
        width: 100%;
        font-size: 85%;
      }

      vaadin-avatar {
        margin: 0.1em 0.75em 0 0;
      }

      #spinner {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        background: var(--sl-panel-background-color);
        inset: 0;
        opacity: 0;
        transition: opacity 300ms ease;
        z-index: 1000;
        pointer-events: none;
      }

      #spinner[show] {
        opacity: 1;
        pointer-events: all;
      }

    `
  ]

  @property({ type: String })
  path;

  @property({ type: String })
  context;

  @property({ type: Array })
  members = [];

  @query('#list', true)
  list;

  @query('#spinner', true)
  spinner;

  firstUpdated(){
    this.list.renderer = this.renderMember;
  }

  willUpdate(props) {

    if (props.has('path') || props.has('context')) {
      if (this.path && this.context && props.get('context') !== this.context) {
        this.loadMembers();
      }
    }
  }

  async loadMembers(){
    this?.spinner?.setAttribute?.('show', '')
    this.members = (await Promise.all([
      await datastore.getMembers(this.context, this.path),
      DOM.delay(transitionDuration)
    ]))[0]
    if (this.list) this.list.items = [...this.members];
    this?.spinner?.removeAttribute?.('show');
  }

  renderMember(root, list, { item: record, index }) {
    const data = record.cache.json;
    render(
      html`<vaadin-message
            time="Added on ${date.print(record.dateCreated)}"
            user-name = "${record.recipient}"
            @click="${e => DOM.fireEvent(this, 'show-member-modal', {
              detail: {
                did: record.recipient
              }
            })}"
          >
          </vaadin-message>`,
      root
    );
  };

  render() {
    return html`
      <vaadin-virtual-list id="list" .items="${this.members}"></vaadin-virtual-list>
      <div id="spinner"><sl-spinner></sl-spinner></div>
    `;
  }
}
