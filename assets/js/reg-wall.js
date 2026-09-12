/* Stragentech — shared lead-gate ("reg wall") for gated downloads.
   Any <a class="gated-download" data-file="..." data-label="..."> is intercepted:
   visitor fills a short form, submission is sent to Formspree, then the file downloads. */
(function(){
  var FORM_ENDPOINT = 'https://formspree.io/f/xpqerpje';

  var overlay, modal, form, titleEl, subEl, errEl, submitBtn, pendingTarget;

  function build(){
    overlay = document.createElement('div');
    overlay.id = 'regwallOverlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;'
      + 'background:rgba(6,14,11,0.72);backdrop-filter:blur(6px);padding:20px;';

    modal = document.createElement('div');
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.style.cssText = 'width:100%;max-width:440px;max-height:90vh;overflow-y:auto;background:#0d1f1a;'
      + 'border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:32px;position:relative;'
      + 'font-family:"DM Sans","Inter",-apple-system,sans-serif;color:#eef5f1;'
      + 'box-shadow:0 24px 80px rgba(0,0,0,0.45);';

    modal.innerHTML =
      '<button type="button" id="regwallClose" aria-label="Close" style="position:absolute;top:14px;right:14px;'
        + 'background:transparent;border:none;color:#8fae9f;font-size:20px;line-height:1;cursor:pointer;padding:6px;">&times;</button>'
      + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#5eead4;letter-spacing:2px;'
        + 'text-transform:uppercase;margin-bottom:10px;">Get The Download</div>'
      + '<h3 id="regwallTitle" style="font-family:Georgia,serif;font-weight:400;font-size:22px;line-height:1.3;'
        + 'color:#ffffff;margin:0 0 8px;"></h3>'
      + '<p id="regwallSub" style="font-size:13px;line-height:1.55;color:#a9c4b8;margin:0 0 22px;"></p>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'
        + field('rwName','Full Name *','text','Jane Smith')
        + field('rwTitle','Job Title *','text','VP Operations')
      + '</div>'
      + '<div style="margin-bottom:12px;">' + field('rwCompany','Company *','text','Acme Industrial Inc.') + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;">'
        + field('rwEmail','Work Email *','email','jane@company.com')
        + field('rwPhone','Phone (optional)','tel','+1 (206) 555-0100')
      + '</div>'
      + '<div id="regwallErr" style="display:none;color:#f87171;font-size:12px;margin:6px 0 4px;"></div>'
      + '<button type="button" id="regwallSubmit" style="width:100%;margin-top:14px;padding:13px;border:none;'
        + 'border-radius:8px;background:#00b87a;color:#06120d;font-size:14px;font-weight:600;cursor:pointer;'
        + 'font-family:inherit;transition:background .2s;">Get the Download &rarr;</button>'
      + '<p style="font-size:11px;color:#6f9787;margin:14px 0 0;line-height:1.5;">We use this only to send you the '
        + 'download and occasional updates on operational AI. No spam, unsubscribe anytime.</p>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    titleEl = modal.querySelector('#regwallTitle');
    subEl = modal.querySelector('#regwallSub');
    errEl = modal.querySelector('#regwallErr');
    submitBtn = modal.querySelector('#regwallSubmit');

    modal.querySelector('#regwallClose').addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && overlay.style.display !== 'none') close(); });
    submitBtn.addEventListener('click', submit);
  }

  function field(id,label,type,placeholder){
    return '<div><label for="'+id+'" style="display:block;font-family:\'JetBrains Mono\',monospace;font-size:9px;'
      + 'color:#7fa595;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">'+label+'</label>'
      + '<input id="'+id+'" type="'+type+'" placeholder="'+placeholder+'" style="width:100%;background:rgba(255,255,255,0.06);'
      + 'border:1px solid rgba(255,255,255,0.14);border-radius:6px;padding:10px 12px;font-size:13px;color:#fff;'
      + 'font-family:inherit;outline:none;box-sizing:border-box;"></div>';
  }

  function open(target){
    if(!overlay) build();
    pendingTarget = target;
    titleEl.textContent = target.label;
    subEl.textContent = 'Enter your details and the download will start right away.';
    errEl.style.display = 'none';
    errEl.textContent = '';
    ['rwName','rwTitle','rwCompany','rwEmail','rwPhone'].forEach(function(id){
      var el = modal.querySelector('#'+id);
      el.value = '';
      el.style.borderColor = 'rgba(255,255,255,0.14)';
    });
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get the Download →';
    submitBtn.style.background = '#00b87a';
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ modal.querySelector('#rwName').focus(); }, 50);
  }

  function close(){
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function submit(){
    var name = modal.querySelector('#rwName');
    var title = modal.querySelector('#rwTitle');
    var company = modal.querySelector('#rwCompany');
    var email = modal.querySelector('#rwEmail');
    var phone = modal.querySelector('#rwPhone');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var missing = [];

    [[name,'Full Name'],[title,'Job Title'],[company,'Company'],[email,'Work Email']].forEach(function(pair){
      var ok = pair[0].value.trim() && (pair[0] !== email || emailRe.test(email.value.trim()));
      pair[0].style.borderColor = ok ? 'rgba(255,255,255,0.14)' : '#f87171';
      if(!ok) missing.push(pair[1]);
    });

    if(missing.length){
      errEl.textContent = 'Please check: ' + missing.join(', ') + '.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    if(typeof gtag !== 'undefined'){
      gtag('event','lead_magnet_download',{
        'asset_label': pendingTarget.label,
        'page_location': window.location.pathname
      });
    }

    fetch(FORM_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        '_subject':'Lead Magnet Download: ' + pendingTarget.label,
        'Full Name': name.value.trim(),
        'Job Title': title.value.trim(),
        'Company': company.value.trim(),
        'Email': email.value.trim(),
        'Phone': phone.value.trim(),
        'Requested Asset': pendingTarget.label,
        'Source Page': window.location.pathname
      })
    }).then(function(res){
      if(res.ok){
        triggerDownload(pendingTarget.file);
        submitBtn.textContent = 'Download starting ✓';
        submitBtn.style.background = '#008f5e';
        setTimeout(close, 1500);
      } else {
        fail();
      }
    }).catch(fail);
  }

  function fail(){
    errEl.textContent = 'Something went wrong — please email info@stragentech.com and we\'ll send it over.';
    errEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get the Download →';
    submitBtn.style.background = '#00b87a';
  }

  function triggerDownload(fileUrl){
    var a = document.createElement('a');
    a.href = fileUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function wire(){
    document.querySelectorAll('.gated-download').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault();
        open({
          file: el.getAttribute('data-file') || el.getAttribute('href'),
          label: el.getAttribute('data-label') || document.title
        });
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
