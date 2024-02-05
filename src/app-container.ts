
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
import '@vaadin/tabs/theme/lumo/vaadin-tabs.js';

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
        box-shadow: 0px 0 2px 2px rgba(0, 0, 0, 0.3);
      }

      #communities_list > * {
        margin-bottom: 0.75rem;
        cursor: pointer;
      }

      #community_nav {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin: 0;
        padding: 0.5em;
      }


      #community_nav sl-tree > sl-tree-item {
        border-bottom: 1px solid rgba(255,255,255,0.15)
      }

      #community_nav sl-tree > sl-tree-item::part(label) {
        flex: 1;
        padding: 0.4em 0;
        font-weight: bold;
      }

      #community_nav sl-tree > sl-tree-item sl-icon-button {
        margin-left: auto;
      }

      #community_nav sl-tree-item:has(.empty-list-button) sl-tree-item::part(item) {
        border: none;
      }

      #community_nav sl-tree-item:has(.empty-list-button) sl-tree-item::part(indentation),
      #community_nav sl-tree-item:has(.empty-list-button) sl-tree-item::part(expand-button) {
        display: none;
      }

      #community_nav sl-tree-item:has(.empty-list-button) sl-tree-item::part(label) {
        flex: 1;
        display: block;
      }

      #community_nav sl-tree .empty-list-button {
        display: block;
        margin: 0.5em;
      }

      #community_nav sl-tree-item sl-tree-item:last-child::part(item) {
        padding: 0 0 0.5em;
      }

      #community_nav sl-tree-item sl-tree-item::part(indentation) {
        width: 0;
      }

      #community_nav sl-details::part(base) {
        box-sizing: border-box;

        border: none;
        background: none;
      }

      #community_nav sl-details::part(content) {
        padding: 0 0 0 1em;
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

      #editor {
        position: fixed;
        z-index: 2;
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
        #editor {
          --modal-height: 100%;
          --modal-width: 100%;
          --modal-border-radius: 0rem;
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

  @query('#editor', true)
  editor;

  @query('#profile_card_popup', true)
  profileCardPopup;

  @query('#add_community_modal', true)
  addCommunityModal

  @query('#new_community_name', true)
  newCommunityName

  @query('#new_community_description', true)
  newCommunityDescription

  constructor() {
    super();

    window.startTime = new Date().getTime();

    this.router = globalThis.router = new AppRouter(this, {
      onRouteChange: (enteringRoute) => {
        if (this.nav){
          this.nav.selected = [...this.nav.children].indexOf(this.renderRoot.querySelector(`vaadin-tab a[href="${enteringRoute.path}"]`).parentNode)
        }
        this.renderRoot.querySelector('#app_layout')?.__closeOverlayDrawer()
      },
      routes: [
        {
          path: '/',
          component: '#home'
        },
        {
          path: '/communities/:id',
          component: '#communities'
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

    this.initialize();

    this.addEventListener('open-editor', e => this.openEditor(e.detail.record))

    this.addEventListener('channels-loaded', e => {
      this.channels = e.detail.channels || [];
    })

    this.addEventListener('convos-loaded', e => {
      this.convos = e.detail.convos || [];
    })
  }

  async initialize(){
    this.communities = await datastore.queryCommunities();
    this.requestUpdate();
  }

  firstUpdated() {
    this.nav = this.renderRoot.querySelector('#global_nav');
    DOM.skipFrame(() => this.router.goto(location.pathname));
  }

  openEditor(record){
    this.editor.open(record);
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
      this.addCommunityModal.close();
    }
    catch(e) {
      notify.error('There was a problem creating your new community')
    }
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

              return html`<a tabindex="-1" href="/communities/${community.id}"><sl-avatar label="${community.cache.json.name}"></sl-avatar></a>`
            })
          }

        </menu>




        <div id="community_nav" slot="drawer">
          <sl-tree selection="leaf">
            <sl-tree-item expanded >
              Channels <sl-icon-button name="plus-lg" label="Add Channel"></sl-icon-button>
              ${
                this.channels?.length ?
                this.channels.map(channel => html`<sl-tree-item>${channel.name}</sl-tree-item>`) :
                html`<sl-tree-item>
                  <sl-button class="empty-list-button" variant="default" size="small">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    Add Channel
                  </sl-button>
                </sl-tree-item>`
              }
            </sl-tree-item>

            <sl-tree-item expanded>
              Convos <sl-icon-button name="plus-lg" label="Start Convo"></sl-icon-button>
              ${
                this.convos?.length ?
                this.convos.map(channel => html`<sl-tree-item>${convo.name}</sl-tree-item>`) :
                html`<sl-tree-item>
                  <sl-button class="empty-list-button" variant="default" size="small">
                    <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                    Start Convo
                  </sl-button>
                </sl-tree-item>`
              }
            </sl-tree-item>
          </sl-tree>
        </div>


        <!-- <vaadin-tabs id="global_nav" slot="drawer" orientation="vertical">
          <vaadin-tab>
            <a tabindex="-1" href="/">
              <sl-icon name="house"></sl-icon>
              <span>Home</span>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1" href="/posts">
              <sl-icon name="file-earmark-richtext"></sl-icon>
              <span>My Posts</span>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1" href="/drafts">
              <sl-icon name="pencil"></sl-icon>
              <span>Drafts</span>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1" href="/follows">
              <sl-icon name="people"></sl-icon>
              <span>Follows</span>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1" href="/settings">
              <sl-icon name="sliders"></sl-icon>
              <span>Settings</span>
            </a>
          </vaadin-tab>
        </vaadin-tabs> -->

        <main id="pages">
          <page-home id="home" scroll></page-home>
          <page-communities id="communities" scroll></page-communities>
          <page-drafts id="drafts" scroll></page-drafts>
          <page-follows id="follows" scroll></page-follows>
          <page-settings id="settings" scroll></page-settings>
        </main>

      </vaadin-app-layout>

      <post-editor id="editor"></post-editor>

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

    `;
  }
}
