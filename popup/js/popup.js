window.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', subject: 'data'},
    function(data) {
      if (data.perma) {
        const ctx = document.getElementById('chart').getContext('2d');
        const radardata = {
          labels: [
            'Emotion',
            'Engagement',
            'Relationships',
            'Meaning',
            'Accomplishment',
          ],
          datasets: [
            {
              label: 'Positive',
              lineTension: 0.1,
              backgroundColor: 'rgba(119, 221, 119,0.2)',
              borderColor: '#77dd77',
              pointBackgroundColor: 'rgba(179,181,198,1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#77dd77',
              data: [
                data.perma.POS_P,
                data.perma.POS_E,
                data.perma.POS_R,
                data.perma.POS_M,
                data.perma.POS_A,
              ],
            },
            {
              label: 'Negative',
              lineTension: 0.1,
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              pointBackgroundColor: 'rgba(255,99,132,1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255,99,132,1)',
              data: [
                data.perma.NEG_P,
                data.perma.NEG_E,
                data.perma.NEG_R,
                data.perma.NEG_M,
                data.perma.NEG_A,
              ],
            },
            {
              label: 'Zero',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: '#000',
              pointBackgroundColor: 'rgba(0,0,0,1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#000',
              data: [0, 0, 0, 0, 0],
            },
          ],
        };
        const pp_radar = new Chart(ctx, {
          type: 'radar',
          data: radardata,
          options: {
            legend: {
              position: 'bottom',
            },
          },
        });
        document.getElementById('data').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
        document.getElementById('blocked').textContent = data.filtered;
        document.getElementById('elems').textContent = data.elements;
        document.getElementById('cent').textContent = ((data.filtered / data.elements) * 100).toFixed(2);
        document.getElementById('rate').textContent = data.rate;
      } else {
        document.getElementById('data').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
      }
    });
  });

  document.getElementById('opts').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('../options/options.html'));
    }
  });
});
