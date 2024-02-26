import { LitElement, html, css, nothing } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { DOM, natives } from '../utils/helpers.js';
import { SpinnerMixin, SpinnerStyles } from '../utils/spinner.js';
import './global.js'

import './w5-img.js'

@customElement('invite-item')
export class InviteItem extends SpinnerMixin(LitElement) {
  static styles = [
    SpinnerStyles,
    css`

      :host {
        position: relative;
        display: flex;
        max-width: 600px;
        border-radius: 0.2em;
        overflow: hidden;
        cursor: default;
      }

        :host * {
          transition: opacity 0.3s ease;
        }

      w5-img {
        margin: 0 1rem 0 0;
        border: 2px solid rgba(200, 200, 230, 0.5);
        border-radius: 0.2rem;
      }

      #content {
        flex: 1;
        position: relative;
        margin: 0 1em 0 0;
      }

      h3 {
        margin: -0.1em 0 0;
        font-size: 110%;
        text-wrap: nowrap;
      }

      p {
        margin: 0.3em 0 0;
      }

      #empty_text, #error_text {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        inset: 0;
        opacity: 0;
        z-index: 1000;
      }

      #empty_text:before,
      #error_text:before {
        content: attr(data-value);
      }

      :host(:not([did])) *:not(#empty_text),
      :host([error]) *:not(#error_text),
      :host([loading]) *:not(.spinner-mixin) {
        opacity: 0;
        pointer-events: none;
      }

      :host(:not([did])) #empty_text,
      :host([error]) #error_text {
        opacity: 1;
        pointer-events: all;
      }

      .spinner-mixin {
        font-size: 1.5rem;
      }

    `
  ]

  static properties = {
    loading: {
      type: Boolean,
      reflect: true
    },
    drl: {
      type: String,
      reflect: true
    },
    error: {
      type: Boolean,
      reflect: true
    },
    errorText: {
      attribute: 'error-text',
      type: String,
      reflect: true
    },
    emptyText: {
      attribute: 'empty-text',
      type: String,
      reflect: true
    },
  };

  willUpdate(changedProperties) {
    if (changedProperties.has('drl') && this.drl) {
      this._drl = natives.drl.parse(this.drl, '/:did/protocols/:protocol/communities/:community');
      console.log(this.drl, this._drl);
      this.loadInvite();
    }
  }

  async loadInvite(){
    this.error = false;
    this.loading = true;
    this.startSpinner();
    const drl = this.drl;
    const target = this._drl.did;
    const community = this._drl.path.community;
    console.log(this._drl);
    Promise.all([
      datastore.getCommunity(community, { from: target, role: 'community/member' }).then(async record => {
        console.log(record);
      }),
      datastore.getChannels(community, { from: target, role: 'community/member' }).then(async records => {
        console.log(records);
      })
    ]).then(() => {
      if (this.drl === drl) this.requestUpdate();
      this.loading = false;
      this.stopSpinner();
    }).catch(e => {
      console.log(e);
      this.loading = false;
      this.stopSpinner();
      this.error = true;
    })
  }


  render() {
    return html`
      <w5-img part="image" src="${ ifDefined(this.avatarDataUri) }" fallback="people"></w5-img>
      <div id="content">
        <h3 part="name">${ this.name || 'Unknown Invite' }</h3>
        ${ this.description ? html`<p>${this.description}</p>` : nothing }
      </div>
      <div id="empty_text" data-value="${this.emptyText || '' }"></div>
      <div id="error_text" data-value="${this.error && this.errorText || "Couldn't find anything for that" }"></div>
    `;
  }
}
