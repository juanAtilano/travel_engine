import { Pointers } from "./StylesPointers";

export class HtmlToScene {

  /**
   * 
   * @param {HTMLElement} div
   * @param {string} type
   */
  #typePointer(div, type) {

    const styles = Pointers[type];

    for (let i = 0; i < styles.length; i++) {
      const [ style, value ] = styles[i];
      div.style[style] = value;
    }

    div.style.left = `${window.innerWidth / 2}px`;
    div.style.top = `${window.innerHeight / 2}px`;

  }

  /**
   * 
   * @param {HTMLElement} div
   * @param {string} type
   */
  pointer(div, type) {

    switch (type) {
      case 'pointer':
        this.#typePointer(div, type);
        break
      default:
        break;
    }

  }

  /**
   * 
   * @param {JSON} message
   * @param {string} keyInteract
   * @return {HTMLElement}
   * 
   */
   bodyMessageNote(message, keyInteract) {

    const { html, isPredifined, predifined } = message;
    
    if(isPredifined) {

      const titleHTML = document.createElement('h1');
      const bodyText = document.createElement('p');
      const textAction = document.createElement('p');

      const { body, link, title } = predifined;
      titleHTML.innerText = title;
      bodyText.innerText = body;
      textAction.innerText = `Press ${keyInteract} to interact`;

      const container = document.createElement('div');

      container.append(titleHTML, bodyText, textAction);

      return container;

    }

  }

  /**
   * 
   * @param {string} inputs
   * @param {string} keyInteract
   * @return {HTMLElement}
   * 
   */
   bodyInputsEditables( name, keyInteract) {

    const container = document.createElement('p');

    container.style.width = '100%';
    container.innerText = `For select "${name}", press ${keyInteract}.`
    
    return container;

  }

}
