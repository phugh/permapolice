/**
 * Save options to chrome.storage
 * @function save_options
 */
function saveOptions() {
  const act = document.getElementById('action').value;
  const nGrams = document.getElementById('inc_n').checked;
  const tolerance = document.getElementById('blockTol').value;

  // concat checked elements into array
  const tags = [];
  if (document.getElementById('inc_p').checked) tags.push('p');
  if (document.getElementById('inc_a').checked) tags.push('a');
  if (document.getElementById('inc_h').checked) tags.push('h1,h2,h3,h4,h5,h6');
  if (document.getElementById('inc_li').checked) tags.push('li');
  if (document.getElementById('inc_span').checked) tags.push('span');
  if (document.getElementById('inc_phr').checked) tags.push('em,strong,code,samp,kbd,var');
  if (document.getElementById('inc_x').checked) tags.push('blockquote,label,th,td,output');
  const tag = tags.join(',');

  chrome.storage.sync.set({
    action: act,
    tags: tag,
    ngrams: nGrams,
    tolerance: tolerance,
  }, function(items) {
    Materialize.toast('Options saved!', 3000);
  });
}

/**
 * Restore options from chrome.storage
 * @function restoreOptions
 */
function restoreOptions() {
  chrome.storage.sync.get({
    action: 'block',
    tags: 'p,a,h1,h2,h3,h4,h5,h6,li,span,em,strong,code,samp,kbd,var,blockquote,label,th,td,output',
    ngrams: true,
    tolerance: 3,
  }, function(items) {
    document.getElementById('action').value = items.action;
    document.getElementById('inc_n').checked = items.ngrams;
    document.getElementById('blockTol').value = items.tolerance;

    const tags = items.tags.split(',');
    let len = tags.length;
    while (len--) {
      const x = tags[len];
      if (x === 'p') {
        document.getElementById('inc_p').checked = true;
      } else if (x === 'a') {
        document.getElementById('inc_a').checked = true;
      } else if (x === 'h1') {
        document.getElementById('inc_h').checked = true;
      } else if (x === 'li') {
        document.getElementById('inc_li').checked = true;
      } else if (x === 'span') {
        document.getElementById('inc_span').checked = true;
      } else if (x === 'em') {
        document.getElementById('inc_phr').checked = true;
      } else if (x === 'output') {
        document.getElementById('inc_x').checked = true;
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', restoreOptions());

$( document ).ready(function() {
  $('select').material_select();
  document.getElementById('save').addEventListener('click', saveOptions);
});
