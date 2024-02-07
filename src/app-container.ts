
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { AppRouter } from './components/router';

import './styles/global.css';
import './components/global.js';
import './styles/theme.js';
import { DOM, notify } from './utils/helpers';
import PageStyles from  './styles/page.css';

import '@vaadin/app-layout/theme/lumo/vaadin-app-layout.js';
import '@vaadin/app-layout/theme/lumo/vaadin-drawer-toggle.js';

import './pages/home';
import './pages/communities';
import './pages/drafts';
import './pages/follows';
import './pages/settings';

import { ProfileCard } from './components/profile-card'

import { Web5 } from '@web5/api';
const { web5, did: userDID } = await Web5.connect({
  techPreview: {
    dwnEndpoints: ['http://localhost:3000']
  }
});
console.log(userDID);
globalThis.userDID = userDID

import { Datastore } from './utils/datastore.js';
const datastore = globalThis.datastore = new Datastore({
  web5: web5,
  did: userDID
})

const BASE_URL: string = (import.meta.env.BASE_URL).length > 2 ? (import.meta.env.BASE_URL).slice(1, -1) : (import.meta.env.BASE_URL);

document.addEventListener('profile-card-popup', e => {
  const anchor = e.detail.anchor;
  const popup = document.querySelector('#app_container ').profileCardPopup
  const card = popup.querySelector('profile-card');

  anchor.addEventListener('pointerleave', e => {
    popup.active = false
  }, { once: true })

  card.did = e.detail.did;
  popup.reposition();
  popup.anchor = e.detail.anchor;
  popup.active = true;
})

@customElement('app-container')
export class AppContainer extends LitElement {

  static styles = [
    unsafeCSS(PageStyles),
    css`

      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      main {
        position: relative;
        height: 100%;
      }

      main > * {
        position: absolute;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        opacity: 0;
        background-color: var(--body-bk) !important;
        visibility: hidden;
        transition: visibility 0.3s, opacity 0.3s ease;
        overflow-y: scroll;
        z-index: -1;
      }

      main > [state="active"] {
        opacity: 1;
        z-index: 0;
        visibility: visible;
      }

      h1 {
        display: flex;
        align-items: center;
      }

      h1 img {
        height: 2em;
        margin-right: 0.5em;
      }

      vaadin-drawer-toggle {
        display: flex;
        height: var(--lumo-size-m);
        width: var(--lumo-size-m);
        font-size: 1.4em;
        cursor: pointer;
      }

      vaadin-app-layout::part(navbar) {
        background: var(--header-bk);
        box-shadow: 0 0 2px 2px rgba(0 0 0 / 25%);
      }

      vaadin-app-layout #logo {
        font-size: 1.2em;
      }

      vaadin-app-layout #slogan {
        color: rgba(255,255,255,0.5);
        margin: 0.2em 0 0;
        font-size: 0.8em;
      }

      vaadin-app-layout h1 {
        margin: 0 0.6em 0 0.4em;
        font-size: 1.2em;
        text-shadow: 0 1px 1px rgba(0,0,0,0.5);
      }

      #user_avatar {
        --size: 2.25em;
        margin-left: auto;
        margin-right: 0.5em;
      }

      vaadin-app-layout::part(drawer) {
        flex-direction: row;
        width: 20em;
        background: rgba(44 44 49 / 100%);
        border-inline-end: 1px solid rgb(255 255 255 / 2%);
      }

      #communities_list {
        display: flex;
        flex-direction: column;
        width: 4em;
        margin: 0;
        padding: 0.5em;
        background: rgba(0,0,0,0.15);
        border-right: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0px 0 1px 2px rgba(0, 0, 0, 0.25);
      }

      #communities_list > * {
        margin-bottom: 0.75rem;
        cursor: pointer;
      }

      #communities_list sl-avatar {
        animation: bouncyFadeIn 0.4s ease-out forwards;
      }

      #communities_list sl-avatar::part(base) {
        box-shadow: 0 1px 2px 1px rgba(0 0 0 / 20%);
      }

      #communities_list sl-avatar[pressed]::part(base) {
        box-shadow: 0 1px 2px 1px rgba(0 0 0 / 20%) inset;
      }

      #communities_list a[active] sl-avatar::part(base) {
        border: 3px solid var(--sl-color-primary-600);
      }

      #community_nav {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin: 0;
        padding: 0.5em;
        background: rgba(0,0,0,0.25);
      }

      #community_nav sl-details {
        border-bottom: 1px solid rgba(255,255,255,0.15)
      }

      #community_nav sl-details::part(base) {
        border: none;
        background: none;
      }

      #community_nav sl-details::part(header) {
        padding: 0.4em;
      }

      #community_nav sl-details::part(summary) {
        order: 1;
      }

      #community_nav sl-details sl-icon-button[slot="summary"] {
        margin-left: auto;
      }

      #community_nav sl-details::part(summary-icon) {
        margin-right: 0.5em;
      }

      #community_nav sl-details::part(content) {
        padding: 0 0.4em 0.8em;
      }

      #community_nav sl-details a {
        display: block;
        padding: 0.2em 0.4em;
        font-size: 90%;
        color: unset;
        text-decoration: none;
        border-radius: 5px;
        transition: background 0.3s ease;
      }

      #community_nav sl-details a:before {
        content: '# ';
      }

      #community_nav sl-details a:hover {
        background: rgba(255,255,255,0.05);
      }

      #community_nav sl-details a[active] {
        color: var(--sl-color-primary-600);
        background: rgba(255,255,255,0.1);
      }

      #community_nav sl-details .empty-list-button {
        display: block;
      }

      vaadin-app-layout vaadin-tab {
        font-family: var(--font-family);
        padding: 0.75rem 1.2rem;
      }

      vaadin-app-layout vaadin-tab[selected] {
        color: var(--link-color);
      }

      vaadin-app-layout vaadin-tab a :first-child {
        margin: 0 0.5em 0 0;
      }

      #profile_card_popup {
        min-width: 300px;
        max-width: 400px;
      }

      #profile_card_popup::part(popup) {
        padding: 0.75rem;
        border: 1px solid rgb(30 30 30 / 90%);
        border-top-color: rgb(33 33 33 / 90%);
        border-bottom-color: rgb(25 25 25 / 90%);
        border-radius: 0.25rem;
        background: rgb(20 20 20 / 92%);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow: 0 2px 10px -2px rgba(0,0,0,0.75);
        /* opacity: 0;
        transition: opacity 0.3s ease; */
      }

      #add_community_modal::part(panel) {
        height: 90%;
        max-height: 445px;
      }

      #add_community_modal::part(body) {
        padding-top: 0;
      }

      #add_community_modal sl-tab-group::part(nav) {
        justify-content: center;
      }

      #add_community_modal sl-tab::part(base) {
        flex: 1; /* Each tab will grow equally, filling the container */
      }

      #add_community_modal sl-tab-panel::part(base) {
        padding-bottom: 0;
      }



      @media(max-width: 500px) {

      }

      @keyframes bouncyFadeIn {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        60% {
          transform: scale(1.1);
          opacity: 1;
        }
        80% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
        }
      }

      /* main > *[state="active"] {
        overflow-y: scroll;
      } */

      /* For Webkit-based browsers (Chrome, Safari) */
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: rgb(40, 40, 40);
      }

      ::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        border: 2px solid rgb(40, 40, 40);
        background-clip: content-box;
      }

      /* For Firefox (version 64 and later) */
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) rgb(40, 40, 40);
      }

      /* For Edge */
      ::-ms-scrollbar {
        width: 10px;
      }

      ::-ms-scrollbar-track {
        background: rgb(40, 40, 40);
      }

      ::-ms-scrollbar-thumb {
        border-radius: 6px;
        border: 2px solid rgb(40, 40, 40);
        background-color: rgba(255, 255, 255, 0.25);
        background-clip: content-box;
      }

    `
  ]

  @query('#profile_card_popup', true)
  profileCardPopup;

  @query('#add_community_modal', true)
  addCommunityModal

  @query('#new_community_name', true)
  newCommunityName

  @query('#new_community_description', true)
  newCommunityDescription

  @query('#add_channel_modal', true)
  addChannelModal

  @query('#new_channel_name', true)
  newChannelName

  @query('#new_channel_description', true)
  newChannelDescription

  constructor() {
    super();

    this.initialize();

    this.router = globalThis.router = new AppRouter(this, {
      onRouteChange: (route, path) => {
        if (this.initialized) {
          localStorage.lastActivePath = location.href.split(location.origin)?.[1] || null;
        }
        this.community = path.community;
        this.renderRoot.querySelector('#app_layout')?.__closeOverlayDrawer()
      },
      routes: [
        {
          path: '/',
          component: '#home'
        },
        {
          path: '/communities{/}?',
          component: '#communities',
        },
        {
          path: '/communities/:community?',
          component: '#communities',
        },
        {
          path: '/communities/:community/*',
          component: '#communities',
        },
        {
          path: '/drafts',
          component: '#drafts'
        },
        {
          path: '/follows',
          component: '#follows'
        },
        {
          path: '/settings',
          component: '#settings'
        }
      ]
    });
  }

  async initialize(){
    const promises = [];
    this.communities = await datastore.getCommunities();
    const firstCommunity = this.communities?.[0]?.id;
    const lastActivePath = localStorage.lastActivePath;
    this.initialized = true;
    this.router.navigateTo(lastActivePath ? lastActivePath : firstCommunity ? '/communities/' + firstCommunity : '/settings');
    this.requestUpdate();
  }

  firstUpdated() {
    DOM.skipFrame(() => this.router.goto(location.pathname));
  }

  #community;
  get community(){
    return this.#community;
  }
  set community(id){
    if (!this.communities) return;
    const record = this.communities.find(community => community.id === id);
    if (!record) {
      this.#community = null;
      this.channels = [];
      this.convos = [];
      return;
    }
    this.#community = record;
    Promise.all([
      this.#loadChannels(),
      this.#loadConvos()
    ]).then(() => {
      this.router
      this.requestUpdate()
    })
  }

  private async #loadChannels(){
    this.channels = await datastore.getChannels(this.#community.id);
  }

  private async #loadConvos(){
    this.convos = await datastore.getConvos(this.#community.id);
  }

  async createCommunity(e){
    const name = this.newCommunityName.value;
    const description = this.newCommunityDescription.value;
    if (!name || !description) {
      notify.error('You must add a name and description to create a new community')
      return;
    }
    const community = await datastore.createCommunity({ data: {
      name,
      description
    }});
    try {
      this.communities.push(community);
      console.log('send', status, this.communities);
      notify.success('Your new community was created!')
      this.addCommunityModal.hide();
      this.requestUpdate();
    }
    catch(e) {
      notify.error('There was a problem creating your new community')
    }
  }

  async createChannel(){
    const name = this.newChannelName.value;
    const description = this.newChannelDescription.value;
    if (!name || !description) {
      notify.error('You must add a name and description to create a new community')
      return;
    }
    const channel = await datastore.createChannel(this.#community.id, { data: {
      name,
      description
    }});
    try {
      this.channels.push(channel);
      console.log('send', status, this.channels);
      notify.success('Your new channel was created!')
      this.addChannelModal.hide();
      this.requestUpdate();
    }
    catch(e) {
      notify.error('There was a problem creating your new channel')
    }
  }

  channelAddHandler(e){
    e.cancelBubble = true;
    this.addChannelModal.show()
  }

  render() {
    return html`

      <vaadin-app-layout id="app_layout">

        <vaadin-drawer-toggle slot="navbar">
          <sl-icon name="list"></sl-icon>
        </vaadin-drawer-toggle>

        <sl-icon id="logo" name="arrow-repeat" slot="navbar"></sl-icon>
        <h1 slot="navbar">5ync</h1>
        <small id="slogan" slot="navbar"></small>

        <sl-avatar id="user_avatar" label="User avatar" slot="navbar"></sl-avatar>

        <menu id="communities_list" slot="drawer">
          <sl-icon-button name="plus-circle" label="Add Community" style="font-size: 2rem;" @click="${e => this.addCommunityModal.show()}"></sl-icon-button>
          ${
            (this.communities || []).map(community => {
              const href = `/communities/${community.id}`
              return html`<a tabindex="-1" href="${href}" ?active="${location.pathname.match(href)}"><sl-avatar pressable label="${community.cache.json.name}"></sl-avatar></a>`
            })
          }
        </menu>

        <div id="community_nav" slot="drawer">

          <sl-details id="channels" open>
            <span slot="summary">Channels</span><sl-icon-button slot="summary" name="plus-lg" label="Add Channel" @click="${this.channelAddHandler}"></sl-icon-button>
            ${
              this.channels?.length ?
                this.channels.map(channel => {
                  const href = `/communities/${this.community.id}/channels/${channel.id}`;
                  return html`
                    <a href="${href}" ?active="${location.pathname.match(href)}">${channel.cache.json.name}</a>
                `}) :
                html`<sl-button class="empty-list-button" variant="default" size="small" @click="${this.channelAddHandler}">
                  <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                  Add Channel
                </sl-button>`
            }
          </sl-details>

          <sl-details id="convos" open>
            <span slot="summary">Convos</span><sl-icon-button slot="summary" name="plus-lg" label="Start Convo" @click=""></sl-icon-button>
            ${
                this.convos?.length ?
                this.convos.map(convo => {
                  const href = `/communities/${this.community.id}/convo/${convo.id}`;
                  return html`<a href="${href}" ?active="${location.pathname.match(href)}">${convo.cache.json.name}</a>`
                }) :
                html`<sl-button class="empty-list-button" variant="default" size="small">
                  <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                  Start Convo
                </sl-button>`
              }
          </sl-details>
        </div>

        <main id="pages">
          <page-home id="home" scroll></page-home>
          <page-communities id="communities" community="${this?.community?.id}" scroll></page-communities>
          <page-drafts id="drafts" scroll></page-drafts>
          <page-follows id="follows" scroll></page-follows>
          <page-settings id="settings" scroll></page-settings>
        </main>

      </vaadin-app-layout>

      <sl-popup id="profile_card_popup" placement="bottom-start" flip
        @pointerenter="${ e => e.currentTarget.active = true }"
        @pointerleave="${ e => e.currentTarget.active = false }">
        <profile-card id="profile_card_popup"></profile-card>
      </sl-popup>

      <sl-dialog id="add_community_modal" label="Add a Community">
        <sl-tab-group>
          <sl-tab slot="nav" panel="new-community">New Community</sl-tab>
          <sl-tab slot="nav" panel="existing-community">Existing Community</sl-tab>

          <sl-tab-panel name="new-community">
            <sl-input id="new_community_name" label="Community Name" placeholder="Enter name"></sl-input>
            <sl-textarea id="new_community_description" label="Description" placeholder="Enter a brief description"></sl-textarea>
            <sl-button variant="primary" @click="${ e => this.createCommunity() }">Create</sl-button>
          </sl-tab-panel>

          <sl-tab-panel name="existing-community">
            <sl-input placeholder="Enter community ID" id="community-id-input"></sl-input>
            <div id="lookup-result">
              <!-- Placeholder for lookup result or spinner -->
            </div>
          </sl-tab-panel>
        </sl-tab-group>
      </sl-dialog>

      <sl-dialog id="add_channel_modal" label="Add a Channel">
        <sl-input id="new_channel_name" label="Name" placeholder="Enter a name"></sl-input>
        <sl-textarea id="new_channel_description" label="Description" placeholder="Enter a brief description"></sl-textarea>
        <sl-button variant="primary" @click="${ e => this.createChannel() }">Create</sl-button>
      </sl-dialog>

      <sl-dialog id="start_convo_modal" label="Start a Convo">
        <!-- TODO: Member picker -->
      </sl-dialog>
    `;
  }
}
