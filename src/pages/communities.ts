import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, query } from 'lit/decorators.js';

import PageStyles from  '../styles/page.css';
import * as markdown from  '../utils/markdown.js';

import '../components/feed-view';

@customElement('page-communities')
export class PageCommunities extends LitElement {
  static styles = [
    unsafeCSS(PageStyles),
    markdown.styles,
    css`
      :host > section {
        padding: 0;
      }

      @media(max-width: 500px) {

      }
    `
  ]


  constructor() {
    super();
    window.addEventListener('post-published', e => {
      this.feedView.processPost(e.detail.record);
    })
    this.initialize();
  }

  async initialize(){
    await datastore.ready;
  }

  async onPageEnter(path){
    this.communityId = path.id;
  }

  #communityId;
  set communityId(id){
    this.#communityId = id;
    Promise.all([
      this.loadChannels(),
      this.loadConvos()
    ]).then(() => this.requestUpdate())
  }

  get communityId(){
    return this.#communityId;
  }

  async loadChannels(){
    const channels = await datastore.getChannels(this.#communityId);
    DOM.fireEvent(this, 'channels-loaded', {
      detail: {
        channels: channels
      }
    })
    console.log(channels);
  }

  async loadConvos(){
    const convos = await datastore.getConvos(this.#communityId);
    DOM.fireEvent(this, 'convos-loaded', {
      detail: {
        channels: convos
      }
    })
    console.log(convos);
  }

  render() {
    return html`

    `;
  }
}
