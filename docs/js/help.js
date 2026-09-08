// Native dialog keeps keyboard focus inside the guide and supports Escape.
const helpButton = document.getElementById('help-button');
const helpDialog = document.getElementById('help-dialog');
const helpClose = helpDialog.querySelector('.help-close');

helpButton.addEventListener('click', () => {
  helpDialog.showModal();
  document.body.classList.add('help-open');
});
helpClose.addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('click', event => {
  if (event.target !== helpDialog) return;
  const bounds = helpDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    helpDialog.close();
  }
});
helpDialog.addEventListener('close', () => {
  document.body.classList.remove('help-open');
  helpButton.focus();
});
