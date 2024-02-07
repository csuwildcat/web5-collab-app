import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import { AppRoutes } from '../components/router';

import PageStyles from  '../styles/page.css';
import * as markdown from  '../utils/markdown.js';

import '../components/community-channel';

@customElement('page-communities')
export class PageCommunities extends LitElement {

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

  constructor() {
    super();
    this.initialize();
  }

  static properties = {
    community: { type: String, reflect: true }
  };

  private #routes = new AppRoutes(this, [
    {
      path: 'channels/:channel',
      component: '#channel',
    },
    {
      path: 'convos/:convo',
      component: '#convo'
    }
  ], {
    onRouteChange: (route, path) => {
      if (path.channel) {
        this.channel = path.channel;
      }
      else if (path.convo) {
        this.convo = path.convo;
      }
      this.requestUpdate();
    }
  });

  async initialize(){
    // setTimeout(() => {
    //   console.log(this.community);
    // }, 2000)
    await datastore.ready;
  }

  #community = '';
  get community() {
    return this.#community;
  }
  set community(id) {
    this.#community = id;
    this.requestUpdate();
  }

  render() {
    return html`
      <community-channel id="channel" community="${this.community}" channel="${this.channel}"></community-channel>
    `;
  }
}
