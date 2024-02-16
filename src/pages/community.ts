import { LitElement, html, css, unsafeCSS } from 'lit';
import { consume } from '@lit/context';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import { AppContext } from '../utils/context.js';

import PageStyles from  '../styles/page.css';
import * as markdown from  '../utils/markdown.js';

import '../components/community-channel';

@customElement('page-community')
export class PageCommunities extends LitElement {

  @consume({context: AppContext, subscribe: true})
  context;

  static styles = [
    unsafeCSS(PageStyles),
    markdown.styles,
    css`
      :host {
        display: flex;
        overflow: auto !important;
      }

      :host > section {
        padding: 0;
      }

      @media(max-width: 500px) {

      }
    `
  ]

  static properties = {
    community: {
      type: String,
      reflect: true
    },
    channel: {
      type: String,
      reflect: true
    }
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <community-channel id="channel" community="${this.community}" channel="${this.channel}"></community-channel>
    `;
  }
}
