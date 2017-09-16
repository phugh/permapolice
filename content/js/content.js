'use strict';

// default options
let action = 'block';
let ngrams = true;
let tags = 'p,a,h1,h2,h3,h4,h5,h6,li,span,em,strong,code,samp,kbd,var,blockquote,label,th,td,output';

/**
 * @function getNgrams
 * @param  {Array} arr  array of tokens
 * @param  {Number} n   number of grams
 * @return {Array} array of n-grams
 */
function getNgrams(arr, n) {
  const ngrams = [];
  const mainLoop = (i) => {
    const a = [];
    for (let h = 0; h < n; h++) {
      a.push(arr[(i + n) + (h - n)]);
    }
    return a;
  };
  const len = arr.length - n + 1;
  for (let i = 0; i < len; i++) {
    ngrams.push(mainLoop(i));
  }
  return ngrams;
}

/**
 * @function getMatches
 * @param  {Array} arr
 * @return {Object}
 */
function getMatches(arr) {
  const matches = {};
  for (let category in permaLexicon) {
    if (!permaLexicon.hasOwnProperty(category)) continue;
    let match = [];
    let data = permaLexicon[category];
    for (let word in data) {
      if ((data.hasOwnProperty(word)) && arr.indexOf(word) > -1) {
        match.push(Number((data[word])));
      }
    }
    matches[category] = match;
  }
  return matches;
};

/**
 * @function calcLex
 * @param  {Object} obj
 * @return {number}
 */
function calcLex(obj) {
  let lex = 0;
  for (let word in obj) {
    if (!obj.hasOwnProperty(word)) continue;
    lex += Number(obj[word]);
  }
  return lex;
};

/**
 * @function main
 * @return {Object}
 */
function main() {
  let data = {
    action: action,
    block: false,
    elements: 0,
    filtered: 0,
  };

  let elements = document.querySelectorAll(tags);
  const elems = elements.length;

  if (elems > 0) {
    let filtered = 0;

    let P = [];
    let E = [];
    let R = [];
    let M = [];
    let A = [];
    let Pn = [];
    let En = [];
    let Rn = [];
    let Mn = [];
    let An = [];

    for (let i = 0; i < elems; i++) {
      // tokenise element text
      const text = elements[i].textContent;
      let tokens = text.match(permaReg);
      if (!tokens) continue;
      if (ngrams) {
        const bigrams = getNgrams(tokens, 2);
        const trigrams = getNgrams(tokens, 3);
        tokens = tokens.concat(bigrams, trigrams);
      }
      // match tokens against lexicon
      const matches = getMatches(tokens);
      if (!matches) continue;
      // calculate lexical values
      const pp = calcLex(matches.POS_P);
      const pe = calcLex(matches.POS_E);
      const pr = calcLex(matches.POS_R);
      const pm = calcLex(matches.POS_M);
      const pa = calcLex(matches.POS_A);
      const np = calcLex(matches.NEG_P);
      const ne = calcLex(matches.NEG_E);
      const nr = calcLex(matches.NEG_R);
      const nm = calcLex(matches.NEG_M);
      const na = calcLex(matches.NEG_A);
      // push to array so we can make page average later
      P.push(pp);
      E.push(pe);
      R.push(pr);
      M.push(pm);
      A.push(pa);
      Pn.push(np);
      En.push(ne);
      Rn.push(nr);
      Mn.push(nm);
      An.push(na);
      // calculate if this element is majority positive or negative
      let z = 0;
      if (pp < np) z++;
      if (pe < ne) z++;
      if (pr < nr) z++;
      if (pm < nm) z++;
      if (pa < na) z++;
      if (z >= 3) {
        filtered++;
        if (action === 'redact' && elements[i].classList) {
          elements[i].classList.add('pp_redacted');
          const els = elements[i].children;
          for (let i = 0; i < els.length; i++) {
            if (els[i].classList) els[i].classList.add('pp_redacted');
          }
        }
      }
    }

    // function to calculate average of array values
    const average = (values) => {
      return (values.reduce((sum, x) => sum + x) / values.length);
    };

    data = {
      elements: elems,
      filtered: filtered,
      perma: {
        POS_P: average(P),
        POS_E: average(E),
        POS_R: average(R),
        POS_M: average(M),
        POS_A: average(A),
        NEG_P: average(Pn),
        NEG_E: average(En),
        NEG_R: average(Rn),
        NEG_M: average(Mn),
        NEG_A: average(An),
      },
    };

    let z = 0;
    if (data.perma.POS_P > data.perma.NEG_P) z++;
    if (data.perma.POS_E > data.perma.NEG_E) z++;
    if (data.perma.POS_R > data.perma.NEG_R) z++;
    if (data.perma.POS_M > data.perma.NEG_M) z++;
    if (data.perma.POS_A > data.perma.NEG_A) z++;
    if (action === 'block' && z <= 3) {
          data.block = true;
    }
    data.rate = z;
  }
  return data;
}

if (!permaLexicon) {
  console.error('PERMA lexicon is missing!');
} else {
  chrome.storage.sync.get({
    action: 'block',
    ngrams: true,
    tags: 'p,a,h1,h2,h3,h4,h5,h6,li,span,em,strong,code,samp,kbd,var,blockquote,label,th,td,output',
  }, function(items) {
    action = items.action;
    ngrams = items.ngrams;
    tags = items.tags;

    if (tags.length > 0) {
      const data = main();
      chrome.runtime.sendMessage({data: data});
      chrome.runtime.onMessage.addListener(
        function(msg, sender, sendResponse) {
          if ((msg.from === 'popup') && (msg.subject === 'data')) {
            sendResponse(data);
          } else {
            console.error('Unrecognised message: ', msg);
          }
        }
      );
    } else console.log('PERMA Police: no elements selected to scan in options.');
  });
}
